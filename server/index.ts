import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import helmet from "helmet";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import fs from "fs";
import Stripe from "stripe";

const app = express();

// Initialize Stripe after environment variables are loaded
let stripe: Stripe | null = null;
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET');
console.log('SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
  console.log('Stripe initialized successfully');
} else {
  console.log('Stripe NOT initialized - missing STRIPE_SECRET_KEY');
}

// Export stripe for use in routes
export { stripe };

// Initialize email after environment variables are loaded
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  // Test SMTP connection
  import('nodemailer').then((nodemailer) => {
    const testTransporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    testTransporter.verify((error: Error | null, success: boolean) => {
      if (error) {
        console.log('Email configuration error:', error);
      } else {
        console.log('Email server ready to send messages');
      }
    });
  });
} else {
  console.log('Email notifications disabled: SMTP credentials not configured');
}

// Cleanup expired files function
const cleanupExpiredFiles = async () => {
  try {
    console.log("Starting cleanup of expired files...");
    const expiredAttachments = await storage.getExpiredAttachments();
    
    for (const attachment of expiredAttachments) {
      try {
        // Delete physical file
        if (fs.existsSync(attachment.filePath)) {
          fs.unlinkSync(attachment.filePath);
          console.log(`Deleted expired file: ${attachment.filePath}`);
        }
        
        // Delete attachment record
        await storage.deleteAttachment(attachment.id);
        console.log(`Deleted expired attachment record: ${attachment.id}`);
      } catch (error) {
        console.error(`Error deleting attachment ${attachment.id}:`, error);
      }
    }
    
    console.log(`Cleanup completed. Removed ${expiredAttachments.length} expired files.`);
  } catch (error) {
    console.error("Error during file cleanup:", error);
  }
};

// Run cleanup on startup
// NOTE: cleanupExpiredFiles and cleanupInactiveUsers are started after DB is ready below

// Function to clean up inactive users (mark as offline)
const cleanupInactiveUsers = async () => {
  try {
    console.log('Starting inactive users cleanup...');
    const allUsers = await storage.getAllUsers();
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes of inactivity
    
    let updatedCount = 0;
    
    for (const user of allUsers) {
      if (user.isOnline && user.lastSeen) {
        const lastSeenDate = new Date(user.lastSeen);
        const timeSinceLastSeen = now.getTime() - lastSeenDate.getTime();
        
        if (timeSinceLastSeen > inactiveThreshold) {
          await storage.updateUser(user.id, { isOnline: false });
          updatedCount++;
          console.log(`Marked user ${user.username} as offline due to inactivity`);
        }
      }
    }
    
    console.log(`Inactive users cleanup completed. Marked ${updatedCount} users as offline.`);
  } catch (error) {
    console.error("Error during inactive users cleanup:", error);
  }
};

// NOTE: inactive users cleanup scheduler is started after DB is ready below

// Security headers with Helmet - simplified for development
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"]
      }
    }
  }));
} else {
  // Disable Helmet in development
  console.log('Running in development mode - Helmet disabled');
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Validate SESSION_SECRET for production security
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required in production');
}

// Configure secure session management with memory store for development
// WARNING: MemoryStore is not suitable for production - use Redis or similar persistent store
if (process.env.NODE_ENV === 'production') {
  console.warn('WARNING: Using MemoryStore in production is not recommended. Switch to Redis or persistent session store.');
}

const MemoryStoreSession = MemoryStore(session);

app.use(session({
  store: new MemoryStoreSession({
    checkPeriod: 86400000, // prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret-please-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict',
  },
  name: 'chatwithmechanic.sid',
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // Only log response body in development to avoid logging sensitive data
      if (capturedJsonResponse && process.env.NODE_ENV !== 'production') {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});


import { dbReady } from "./db";

(async () => {
  // Wait for database migrations to complete before starting the server
  await dbReady;

  // Initialize admin user after database is ready
  storage.initAdminUser();

  // Start background jobs that require DB only after db is ready
  // Run cleanup on startup
  cleanupExpiredFiles();
  // Schedule cleanup to run every 24 hours (86400000 ms)
  setInterval(cleanupExpiredFiles, 86400000);

  // Run inactive users cleanup every 2 minutes
  cleanupInactiveUsers();
  setInterval(cleanupInactiveUsers, 2 * 60 * 1000);

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error('Server error:', err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    console.log("Setting up Vite for development...");
    await setupVite(app, server);
  } else {
    console.log("Setting up static file serving for production...");
    try {
      serveStatic(app);
      console.log("Static file serving configured successfully");
    } catch (error) {
      console.error("Failed to configure static file serving:", error);
      throw error;
    }
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.NODE_ENV === 'production' ? "0.0.0.0" : "localhost";
  
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Port: ${port}`);
  console.log(`Host: ${host}`);
  console.log(`Frontend dist path: ${path.resolve(import.meta.dirname, "..", "dist", "public")}`);
  
  // Add global error handlers
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
  server.listen({
    port,
    host,
  }, () => {
    log(`serving on port ${port}, host: ${host}`);
  });
})();
