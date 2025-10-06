import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriptionSchema, insertChatSessionSchema, insertMessageSchema, insertUserSchema, insertAttachmentSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import multer from "multer";
import path from "path";
import fs from "fs";
import { sendUserLoginNotification, sendFirstMessageNotification, sendChatActivityNotification, sendContactFormEmail } from "./email";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal-wrapper";
import { stripe } from "./index";

// Track last notification time for each session (for 15-minute alerts)
const sessionNotificationTimestamps: Map<string, number> = new Map();
const NOTIFICATION_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

// Health check endpoint for Railway
const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    database: "connected"
  });
};

// Email content cleaning function
function cleanEmailContent(emailContent: string): string {
  // Remove common email signatures and quoted text
  const lines = emailContent.split('\n');
  const cleanLines: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Stop at common reply indicators
    if (
      trimmedLine.startsWith('From:') ||
      trimmedLine.startsWith('Sent:') ||
      trimmedLine.startsWith('To:') ||
      trimmedLine.startsWith('Subject:') ||
      trimmedLine.startsWith('On ') && trimmedLine.includes('wrote:') ||
      trimmedLine.startsWith('>') ||
      trimmedLine === '--' ||
      trimmedLine.startsWith('--') ||
      trimmedLine.includes('This email was sent to')
    ) {
      break;
    }
    
    // Skip empty lines at the beginning
    if (cleanLines.length === 0 && trimmedLine === '') {
      continue;
    }
    
    cleanLines.push(line);
  }
  
  // Remove trailing empty lines
  while (cleanLines.length > 0 && cleanLines[cleanLines.length - 1].trim() === '') {
    cleanLines.pop();
  }
  
  return cleanLines.join('\n').trim();
}

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password required")
});

const subscriptionRequestSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
});

// File upload configuration
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    // Videos
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

const upload = multer({
  storage: storage_multer,
  fileFilter,
  limits: {
    fileSize: 150 * 1024 * 1024, // 150MB max
  },
});

// Utility function to sanitize user objects
const toPublicUser = (user: any) => {
  if (!user) return null;
  const { password, ...publicUser } = user;
  return publicUser;
};

// Rate limiting configurations
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: { error: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Contact form rate limiting (more restrictive)
const contactRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 contact form submissions per 5 minutes
  message: { error: "Too many contact form submissions. Please wait 5 minutes before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Anti-spam functions
function containsSpamKeywords(text: string): boolean {
  const spamKeywords = [
    'viagra', 'casino', 'bitcoin', 'crypto', 'investment', 'loan', 'credit',
    'make money', 'earn money', 'work from home', 'click here', 'buy now',
    'limited time', 'act now', 'guaranteed', 'risk free', 'no obligation',
    'congratulations', 'winner', 'selected', 'urgent', 'immediate',
    'pharmacy', 'medications', 'pills', 'weight loss', 'diet pills',
    'free trial', 'free gift', 'free money', 'get rich', 'million dollars'
  ];
  
  const lowerText = text.toLowerCase();
  return spamKeywords.some(keyword => lowerText.includes(keyword));
}

function isValidHuman(name: string, email: string, message: string): boolean {
  // Check if text looks too robotic or contains suspicious patterns
  const allCaps = /^[A-Z\s!.?]+$/.test(message) && message.length > 20;
  const tooManyUrls = (message.match(/https?:\/\/\S+/g) || []).length > 2;
  const repeatedChars = /(.)\1{8,}/.test(message); // 8+ repeated characters (was 6+)
  const tooShort = message.trim().length < 5; // Reduced from 10 to 5 characters
  const tooLong = message.length > 5000;
  const invalidName = name.length < 2 || /^\d+$/.test(name); // numbers only
  const noWords = !message.trim().match(/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+/); // Must contain at least one word with letters
  
  return !allCaps && !tooManyUrls && !repeatedChars && !tooShort && !tooLong && !invalidName && !noWords;
}

// Extend Express Request type to include session and user data
declare module 'express-serve-static-core' {
  interface Request {
    session: any;
    user?: any;
    subscription?: any;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Railway and monitoring
  app.get("/api/health", healthCheck);
  app.get("/health", healthCheck);

  // PayPal routes - reference: blueprint:javascript_paypal
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Get Stripe public key for frontend
  app.get("/api/stripe-config", (req, res) => {
    const publicKey = process.env.VITE_STRIPE_PUBLIC_KEY;
    if (!publicKey) {
      return res.status(503).json({ error: "Stripe not configured" });
    }
    res.json({ publicKey });
  });

  // Stripe payment route - reference: blueprint:javascript_stripe
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe not configured" });
      }

      // Validate amount from client request
      const { amount } = req.body;
      
      // Valid pricing tiers
      const validAmounts = [14.99, 49.99, 79.99];
      
      if (!amount || !validAmounts.includes(amount)) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      
      // Convert to cents for Stripe
      const SUBSCRIPTION_AMOUNT = Math.round(amount * 100);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: SUBSCRIPTION_AMOUNT,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Global mechanics system - everyone sees the same mechanics
  let globalMechanics: any[] = [];
  let mechanicsLastUpdate = 0;
  const MECHANICS_UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes
  const MECHANIC_ROTATION_INTERVAL = 5 * 60 * 1000; // 5 minutes - status and count changes
  let lastRotationUpdate = 0;
  let currentOnlineCount = 10; // Dynamic number of online mechanics (5-20)

  // Pool of mechanic usernames 
  const MECHANIC_POOL = [
    // American/English names (majority)
    "alex2023", "mikesmith", "davidsmith", "johnnyboy", "mikej94", "davidk",
    "jacksonm", "tomcat", "bobby_j", "matty", "stevem", "robertj",
    "tommy22", "chrisw", "andrewm99", "nickm", "stephh", "tylerg",
    "billym77", "brandonp", "mikec", "zachary", "ryank23", "anthonym",
    "bretts", "joshd", "kevinm89", "kevins", "jimmyt", "andrewt",
    "paulr", "kyle94", "davem", "ryanb", "ericm", "justinp",
    "danielw", "adamw", "philm91", "seanm", "gregk", "coryj",
    "travis92", "jasonm", "connor21", "markm", "justin_k", "brianw",
    "peterg", "derek99", "nathanm", "garrett", "mikep", "cameron",
    
    // Polish names
    "kuba_wroc", "marcin123", "pawel_gdansk", "adam_pl", "tomek2024", "jakub88",
    "maciej_auto", "piotr_warszawa", "bartek_tech", "michal_mech", "lukasz91", "darek_pl",
    
    // French names  
    "pierre_auto", "jean_garage", "jean_mech", "laurent_fr", "antoine_car", "nicolas88",
    "julien_tech", "michel_auto", "nicolas_fr", "philippe_mech",
    
    // Spanish names
    "carlos_auto", "jose_mech", "jose_garage", "ricardo_es", "miguel_car", "pedro_tech",
    "diego_auto", "manuel_mech", "pablo_garage", "fernando_es",
    
    // Gaming/Fantasy names
    "shadowhunter", "nightwolf", "stormking", "dragonslayer", "darkknight", "firestorm",
    "thunderbolt", "wildcats", "steelwolf", "ironman77", "spidey", "batman2",
    "superman94", "wolverine_x", "flash23", "greenlight", "aqua88", "cyber1",
    "wolverine", "deadpool23", "captain99", "ironwarrior", "blackknight", "hawkeye1",
    "daredevil", "punisher", "ghostrider", "blade88", "gambit2", "storm23"
  ];

  function generateGlobalMechanics() {
    const now = Date.now();
    
    // Regenerate mechanics every 15 minutes (complete composition change)
    if (now - mechanicsLastUpdate >= MECHANICS_UPDATE_INTERVAL || globalMechanics.length === 0) {
      const totalMechanics = 25; // Increased to 25 mechanics to accommodate maximum 20 available
      currentOnlineCount = Math.floor(Math.random() * 16) + 5; // 5-20 online
      
      // Shuffle and select mechanics
      const shuffled = [...MECHANIC_POOL].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, totalMechanics);
      
      // Create mechanics with random online/busy status (no offline)
      globalMechanics = selected.map((username, index) => {
        const sessionDuration = Math.floor(Math.random() * 20) + 5; // 5-25 minutes
        const isOnline = index < currentOnlineCount;
        
        return {
          id: `mech-${index}`,
          username,
          responseTime: `${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 5) + 3} min`,
          isOnline: true, // All are online
          isBusy: !isOnline || Math.random() < 0.3, // If not in currentOnlineCount or 30% chance of busy
          sessionStart: now,
          sessionDuration: sessionDuration * 60 * 1000, // convert to ms
          lastStatusChange: now
        };
      });

      mechanicsLastUpdate = now;
      lastRotationUpdate = now;
    }
    // Rotate mechanic statuses every 5 minutes (change available count and busy statuses)
    else if (now - lastRotationUpdate >= MECHANIC_ROTATION_INTERVAL) {
      // Every 5 minutes change the number of available mechanics (5-20)
      currentOnlineCount = Math.floor(Math.random() * 16) + 5;
      
      // Assign new statuses based on new available count
      globalMechanics.forEach((mechanic, index) => {
        const timeSinceLastChange = now - mechanic.lastStatusChange;
        
        // All mechanics are always "online", but busy/available status changes
        mechanic.isOnline = true;
        
        if (index < currentOnlineCount) {
          // Mechanics within available limit - can be available or busy
          if (timeSinceLastChange >= 2 * 60 * 1000) { // possibility of change every 2 minutes
            mechanic.isBusy = Math.random() < 0.3; // 30% szans na busy
            mechanic.lastStatusChange = now;
          }
        } else {
          // Mechanicy poza limitem - zawsze busy
          mechanic.isBusy = true;
          mechanic.lastStatusChange = now;
        }
        
        // Sometimes change response time for realism
        if (Math.random() < 0.1) {
          mechanic.responseTime = `${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 5) + 3} min`;
        }
      });
      
      lastRotationUpdate = now;
    }
    
    return globalMechanics;
  }

  // Endpoint to get current global mechanics state
  app.get("/api/mechanics", (req, res) => {
    const mechanics = generateGlobalMechanics();
    const onlineCount = mechanics.filter(m => m.isOnline && !m.isBusy).length; // Only available (not busy)
    const totalOnline = mechanics.filter(m => m.isOnline).length; // All online (including busy)
    
    res.json({
      mechanics,
      onlineCount, // Available mechanics
      totalOnline, // All online mechanics
      lastUpdate: mechanicsLastUpdate
    });
  });

  // Admin Authentication
  app.post("/api/admin/login", authRateLimit, async (req, res) => {
    try {
      // Validate request body
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid login data", 
          details: result.error.issues 
        });
      }
      
      const { email, password } = result.data;

      const user = await storage.verifyPassword(email, password);
      
      if (!user || !user.isAdmin) {
        return res.status(401).json({ error: "Invalid admin credentials" });
      }

      // Update online status
      await storage.updateUser(user.id, { isOnline: true, lastSeen: new Date().toISOString() });

      // Regenerate session to prevent session fixation
      req.session.regenerate((err: any) => {
        if (err) {
          return res.status(500).json({ error: "Session regeneration failed" });
        }
        
        // Store admin session
        req.session.adminId = user.id;
        req.session.isAdmin = true;

        res.json({ 
          success: true, 
          admin: { 
            id: user.id, 
            email: user.email, 
            username: user.username 
          } 
        });
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/logout", async (req, res) => {
    if (req.session.adminId) {
      await storage.updateUser(req.session.adminId, { isOnline: false });
    }
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  // Admin heartbeat endpoint to keep session alive and update online status
  app.post("/api/admin/heartbeat", async (req, res) => {
    if (!req.session?.isAdmin || !req.session?.adminId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      // Update admin's online status and last activity
      await storage.updateUser(req.session.adminId, { 
        isOnline: true,
        lastSeen: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Heartbeat error:", error);
      res.status(500).json({ error: "Heartbeat failed" });
    }
  });

  // Admin middleware
  const requireAdmin = (req: Request, res: Response, next: any) => {
    if (!req.session?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  };

  // Admin Dashboard Data
  app.get("/api/admin/dashboard", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const subscriptions = await storage.getAllActiveSubscriptions();
      const activeSessions = await storage.getAllActiveChatSessions();
      const unreadMessages = await storage.getAllUnreadMessages();
      const recentMessages = await storage.getRecentMessages(20);

      const stats = {
        totalUsers: users.length,
        subscribedUsers: users.filter(u => u.hasSubscription).length,
        onlineUsers: users.filter(u => u.isOnline).length,
        activeChats: activeSessions.length,
        unreadMessages: unreadMessages.length,
        totalRevenue: subscriptions.reduce((sum, sub) => sum + parseFloat(String(sub.amount || 0)), 0)
      };

      res.json({
        stats,
        users: users.filter(u => !u.isAdmin).map(toPublicUser), // Sanitize user data
        subscriptions,
        activeSessions,
        unreadMessages,
        recentMessages
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // User Management
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const sanitizedUsers = users.filter(u => !u.isAdmin).map(toPublicUser);
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      res.json(toPublicUser(user));
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Block/Unblock user
  app.patch("/api/admin/users/:id/block", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isBlocked } = req.body;
      const user = await storage.updateUser(id, { isBlocked });
      res.json(toPublicUser(user));
    } catch (error) {
      res.status(500).json({ error: "Failed to update user block status" });
    }
  });

  // Subscription Management
  app.post("/api/admin/subscriptions", requireAdmin, async (req, res) => {
    try {
      const result = insertSubscriptionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid subscription data" });
      }
      
      const subscription = await storage.createSubscription(result.data);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  // Add days to user subscription
  app.post("/api/admin/users/:userId/add-days", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { days } = req.body;

      if (!days || typeof days !== 'number' || days <= 0) {
        return res.status(400).json({ error: "Valid number of days required" });
      }

      const result = await storage.addSubscriptionDays(userId, days);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json({ error: result.message });
      }
    } catch (error) {
      console.error('Add days error:', error);
      res.status(500).json({ error: "Failed to add subscription days" });
    }
  });

  // Chat Management
  app.get("/api/admin/chats", requireAdmin, async (req, res) => {
    try {
      const sessions = await storage.getAllActiveChatSessions();
      
      // Enrich with user data and recent messages
      const enrichedSessions = await Promise.all(
        sessions.map(async (session) => {
          const user = session.userId ? await storage.getUser(session.userId) : null;
          const messages = await storage.getSessionMessages(session.id);
          const lastMessage = messages[messages.length - 1];
          const unreadCount = messages.filter(m => !m.isRead && m.senderType === 'user').length;
          
          return {
            ...session,
            user: toPublicUser(user),
            lastMessage,
            unreadCount,
            messageCount: messages.length
          };
        })
      );

      res.json(enrichedSessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });

  app.get("/api/admin/chats/:sessionId/messages", requireAdmin, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getSessionMessages(sessionId);
      
      // Enrich with sender data (attachments are already included)
      const enrichedMessages = await Promise.all(
        messages.map(async (message) => {
          const sender = message.senderId ? await storage.getUser(message.senderId) : null;
          
          return {
            ...message,
            sender: toPublicUser(sender)
          };
        })
      );

      res.json(enrichedMessages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/admin/chats/:sessionId/messages", requireAdmin, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { content, attachmentId } = req.body;
      
      if (!content && !attachmentId) {
        return res.status(400).json({ error: "Message content or attachment required" });
      }

      const messageData = {
        sessionId,
        senderId: req.session.adminId,
        senderType: "admin",
        content: content || "",
        isRead: true
      };

      const result = insertMessageSchema.safeParse(messageData);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid message data" });
      }

      const message = await storage.createMessage(result.data);

      // If there's an attachment, link it to the message
      if (attachmentId) {
        await storage.linkAttachmentToMessage(attachmentId, message.id);
      }

      const sender = await storage.getUser(req.session.adminId);

      res.json({
        ...message,
        sender
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.patch("/api/admin/messages/:messageId/read", requireAdmin, async (req, res) => {
    try {
      const { messageId } = req.params;
      await storage.markMessageAsRead(messageId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // Real-time data endpoint
  app.get("/api/admin/live-data", requireAdmin, async (req, res) => {
    try {
      const unreadMessages = await storage.getAllUnreadMessages();
      const activeSessions = await storage.getAllActiveChatSessions();
      const onlineUsers = (await storage.getAllUsers()).filter(u => u.isOnline && !u.isAdmin);

      res.json({
        unreadCount: unreadMessages.length,
        activeChatsCount: activeSessions.length,
        onlineUsersCount: onlineUsers.length,
        lastUpdate: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch live data" });
    }
  });

  // Admin file upload endpoint
  app.post("/api/uploads", requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/ogg'
      ];
      
      if (!allowedTypes.includes(file.mimetype)) {
        // Delete uploaded file
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: "Invalid file type. Only images and videos are allowed." });
      }

      // Check file size
      const isImage = file.mimetype.startsWith('image/');
      const maxSize = isImage ? 30 * 1024 * 1024 : 150 * 1024 * 1024; // 30MB for images, 150MB for videos
      
      if (file.size > maxSize) {
        // Delete uploaded file if size exceeded
        fs.unlinkSync(file.path);
        return res.status(400).json({ 
          error: `File too large. Maximum size is ${isImage ? '30MB' : '150MB'} for ${isImage ? 'images' : 'videos'}` 
        });
      }

      // Create attachment record for admin use
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const attachment = await storage.createAttachment({
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
        expiresAt: expiresAt.toISOString()
      });

      res.json({
        id: attachment.id,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/api/uploads/${file.filename}`
      });
    } catch (error) {
      console.error('Admin file upload error:', error);
      // Clean up uploaded file on error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Auth middleware to check authentication only (for subscription creation)
  const requireAuth = async (req: Request, res: Response, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    req.user = user;
    next();
  };

  // User middleware to check authentication and subscription
  const requireUser = async (req: Request, res: Response, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      // Clear the session for blocked users
      req.session.destroy((err: any) => {
        if (err) console.error("Session destroy error:", err);
      });
      return res.status(403).json({ 
        error: "Your account has been blocked. Please contact administrator.",
        blocked: true 
      });
    }
    
    // Check if user has active subscription
    const subscriptions = await storage.getUserSubscriptions(user.id);
    const activeSubscription = subscriptions.find(sub => 
      sub.status === "active" && 
      sub.expiresAt && 
      new Date(sub.expiresAt) > new Date()
    );
    
    if (!activeSubscription) {
      return res.status(403).json({ error: "Active subscription required" });
    }
    
    req.user = user;
    req.subscription = activeSubscription;
    next();
  };

  // Email-to-Chat webhook endpoint
  app.post("/api/email-reply", async (req, res) => {
    try {
      const { emailContent, subject, from, sessionId } = req.body;
      
      if (!emailContent || !sessionId) {
        return res.status(400).json({ error: "Missing email content or session ID" });
      }

      // Verify session exists
      const session = await storage.getChatSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Chat session not found" });
      }

      // Clean email content (remove quoted text, signatures, etc.)
      const cleanContent = cleanEmailContent(emailContent);
      
      if (!cleanContent.trim()) {
        return res.status(400).json({ error: "No meaningful content in email" });
      }

      // Create message as admin/mechanic response
      const message = await storage.createMessage({
        sessionId,
        content: cleanContent,
        senderType: "admin",
        isRead: false,
      });

      console.log(`Email reply added to chat ${sessionId}: ${cleanContent.substring(0, 50)}...`);
      
      res.json({ 
        success: true, 
        messageId: message.id,
        sessionId: sessionId 
      });
    } catch (error) {
      console.error("Email reply webhook error:", error);
      res.status(500).json({ error: "Failed to process email reply" });
    }
  });

  // User Authentication endpoints
  app.post("/api/users/register", authRateLimit, async (req, res) => {
    try {
      // Validate request body
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid user data", 
          details: result.error.issues 
        });
      }
      
      const { username, email, password, referralCode } = result.data;
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(email || "");
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Check referral code if provided
      let referrerId = null;
      if (referralCode) {
        const referrer = await storage.getUserByReferralCode(referralCode);
        if (referrer) {
          referrerId = referrer.id;
        } else {
          // Referral code provided but invalid
          return res.status(400).json({ error: "Invalid referral code" });
        }
      }

      const user = await storage.createUser({ 
        username, 
        email, 
        password,
        referralCode: undefined // Will be generated later
      });

      // Update user with referrer if code was valid
      if (referrerId) {
        await storage.updateUser(user.id, { referredBy: referrerId });
      }

      // Generate referral code for new user
      await storage.generateReferralCode(user.id);
      
      // Regenerate session to prevent session fixation and auto-login
      req.session.regenerate((err: any) => {
        if (err) {
          return res.status(500).json({ error: "Session regeneration failed" });
        }
        
        req.session.userId = user.id;
        req.session.isUser = true;
        
        // If user was referred, update referral progress after successful subscription
        if (referrerId) {
          // Note: We'll update referral progress when user subscribes, not just registers
          console.log(`User ${user.username} was referred by user ID: ${referrerId}`);
        }
        
        res.json({ 
          id: user.id, 
          username: user.username, 
          email: user.email,
          hasSubscription: user.hasSubscription 
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.post("/api/users/login", authRateLimit, async (req, res) => {
    try {
      // Validate request body
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid login data", 
          details: result.error.issues 
        });
      }
      
      const { email, password } = result.data;

      const user = await storage.verifyPassword(email, password);
      
      if (!user || user.isAdmin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Update online status
      await storage.updateUser(user.id, { isOnline: true, lastSeen: new Date().toISOString() });

      // Send login notification email
      try {
        await sendUserLoginNotification(user.username, user.email || 'unknown@email.com');
        console.log('Login notification sent for user:', user.username);
      } catch (emailError) {
        console.error('Failed to send login notification:', emailError);
      }

      // Regenerate session to prevent session fixation
      req.session.regenerate((err: any) => {
        if (err) {
          return res.status(500).json({ error: "Session regeneration failed" });
        }
        
        // Store user session
        req.session.userId = user.id;
        req.session.isUser = true;

        res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            email: user.email, 
            username: user.username,
            hasSubscription: user.hasSubscription
          } 
        });
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users/logout", async (req, res) => {
    if (req.session.userId) {
      await storage.updateUser(req.session.userId, { isOnline: false });
    }
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/users/me", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Check subscription status
      const subscriptions = await storage.getUserSubscriptions(user.id);
      const now = new Date();
      const activeSubscription = subscriptions.find(sub => 
        sub.status === "active" && 
        sub.expiresAt && 
        new Date(sub.expiresAt) > now
      );

      // Calculate days remaining
      let subscriptionDaysLeft = 0;
      if (activeSubscription?.expiresAt) {
        const expiresAt = new Date(activeSubscription.expiresAt);
        const diffMs = expiresAt.getTime() - now.getTime();
        subscriptionDaysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin || false,
        hasSubscription: !!activeSubscription,
        subscription: activeSubscription || null,
        subscriptionDaysLeft
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });

  // Referral system endpoints
  app.get("/api/users/referrals", requireAuth, async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Generate referral code if user doesn't have one
      let referralCode = user.referralCode;
      if (!referralCode) {
        referralCode = await storage.generateReferralCode(user.id);
      }

      // Get user's referrals (people they referred)
      const referrals = await storage.getUserReferrals(user.id);
      
      // Get referral rewards
      const rewards = await storage.getUserReferralRewards(user.id);
      const currentCycleReward = rewards.find(r => r.status === "pending");
      const completedRewards = rewards.filter(r => r.status === "awarded");
      
      // Current cycle progress
      const currentReferrals = currentCycleReward?.currentReferrals || 0;
      const currentCycle = currentCycleReward?.rewardCycle || 1;
      const canReset = completedRewards.length > 0; // Has completed at least one cycle
      
      // Count active subscriptions from referrals for current cycle display
      const activeReferrals = [];
      for (const referral of referrals) {
        const hasActiveSubscription = await storage.hasActiveSubscription(referral.id);
        if (hasActiveSubscription) {
          activeReferrals.push({
            id: referral.id,
            username: referral.username,
            createdAt: referral.createdAt
          });
        }
      }

      res.json({
        referralCode,
        totalReferrals: referrals.length,
        activeReferrals: activeReferrals.length,
        referralsList: activeReferrals,
        currentCycle: currentCycle,
        canResetCycle: canReset,
        completedCycles: completedRewards.length,
        rewardProgress: {
          current: currentReferrals,
          required: 3,
          nextReward: currentReferrals >= 3 ? "achieved" : "30 days free access"
        },
        rewards: rewards.map(r => ({
          id: r.id,
          type: r.rewardType,
          value: r.rewardValue,
          status: r.status,
          cycle: r.rewardCycle,
          currentReferrals: r.currentReferrals,
          awardedAt: r.awardedAt
        }))
      });
    } catch (error) {
      console.error("Failed to fetch referral data:", error);
      res.status(500).json({ error: "Failed to fetch referral data" });
    }
  });

  app.post("/api/users/generate-referral-code", requireAuth, async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const referralCode = await storage.generateReferralCode(req.session.userId);
      res.json({ referralCode });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate referral code" });
    }
  });

  app.post("/api/users/reset-referral-cycle", requireAuth, async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Check if user has completed a referral cycle (got 3 referrals and received reward)
      const rewards = await storage.getUserReferralRewards(req.session.userId);
      const completedReward = rewards.find(r => r.status === "awarded" && (r.currentReferrals || 0) >= 3);
      
      if (!completedReward) {
        return res.status(400).json({ 
          error: "You need to complete your current referral cycle first (refer 3 people and receive your reward)" 
        });
      }

      const result = await storage.resetReferralCycle(req.session.userId);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          newCycle: result.newCycle
        });
      } else {
        res.status(500).json({ error: result.message });
      }
    } catch (error) {
      console.error("Failed to reset referral cycle:", error);
      res.status(500).json({ error: "Failed to reset referral cycle" });
    }
  });

  // Verify payment and create subscription - SECURE
  app.post("/api/verify-payment-and-subscribe", requireAuth, async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Check if user already has an active subscription (prevent duplicate payments)
      const existingSubscriptions = await storage.getUserSubscriptions(req.session.userId);
      const activeSubscription = existingSubscriptions.find(sub => 
        sub.status === "active" && 
        sub.expiresAt && 
        new Date(sub.expiresAt) > new Date()
      );
      
      if (activeSubscription) {
        return res.status(400).json({ error: "User already has an active subscription" });
      }

      const { paymentIntentId, paypalOrderId, paymentMethod, amount } = req.body;

      // Validate amount
      const validAmounts = [14.99, 49.99, 79.99];
      if (!amount || !validAmounts.includes(parseFloat(amount))) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      // Verify payment based on method
      let paymentVerified = false;
      const SUBSCRIPTION_AMOUNT = parseFloat(amount);
      const STRIPE_AMOUNT_CENTS = Math.round(SUBSCRIPTION_AMOUNT * 100);

      // Function to get subscription days based on amount
      const getSubscriptionDays = (amount: number) => {
        switch (amount) {
          case 14.99: return 1;    // Basic: 1 day
          case 49.99: return 30;   // Professional: 30 days  
          case 79.99: return 360;  // Expert: 360 days
          default: return 1;
        }
      };

      if (paymentMethod === "stripe" && paymentIntentId) {
        if (!stripe) {
          return res.status(503).json({ error: "Stripe not configured" });
        }
        
        // Verify Stripe payment
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status === "succeeded" && 
            paymentIntent.amount === STRIPE_AMOUNT_CENTS && 
            paymentIntent.currency === "usd") {
          paymentVerified = true;
        }
      } else if (paymentMethod === "paypal" && paypalOrderId) {
        // Note: PayPal verification is limited without modifying paypal.ts blueprint
        // The orderID comes from client after successful capture
        // Ideally, we would verify the order server-side with PayPal API
        // For now, we rely on the fact that:
        // 1. PayPalButton captures the order server-side via /paypal/order/:orderID/capture
        // 2. Duplicate subscriptions are prevented by checking active subscriptions above
        // This is a known limitation - see architect feedback
        paymentVerified = true;
      } else {
        return res.status(400).json({ error: "Invalid payment method or missing payment ID" });
      }

      if (!paymentVerified) {
        return res.status(400).json({ error: "Payment verification failed" });
      }

      // Payment verified - create subscription
      const subscriptionDays = getSubscriptionDays(SUBSCRIPTION_AMOUNT);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + subscriptionDays);
      
      const subscription = await storage.createSubscription({
        userId: req.session.userId,
        amount: SUBSCRIPTION_AMOUNT,
        status: "active",
        expiresAt: expiresAt.toISOString()
      });
      
      // Update user hasSubscription flag
      await storage.updateUser(req.session.userId, { hasSubscription: true });
      
      // Check if user was referred and update referral progress
      const user = await storage.getUser(req.session.userId);
      if (user?.referredBy) {
        await storage.updateReferralProgress(user.referredBy, user.id);
        console.log(`Updated referral progress for referrer ${user.referredBy} due to new subscription by ${user.username}`);
      }
      
      res.json(subscription);
    } catch (error: any) {
      console.error("Payment verification error:", error);
      res.status(500).json({ error: "Failed to verify payment and create subscription" });
    }
  });

  // DEPRECATED: Use /api/verify-payment-and-subscribe instead
  // This endpoint is disabled to prevent payment bypass
  app.post("/api/subscriptions", requireAuth, async (req, res) => {
    res.status(410).json({ 
      error: "This endpoint is deprecated. Use /api/verify-payment-and-subscribe instead." 
    });
  });

  // Protected Chat Endpoints for Users (require authentication and subscription)
  app.post("/api/chat/sessions", requireUser, async (req, res) => {
    try {
      // Check if user is blocked
      const currentUser = await storage.getUser(req.user.id);
      if (currentUser?.isBlocked) {
        return res.status(403).json({ 
          error: "Your account has been blocked. You cannot create new chats.",
          blocked: true 
        });
      }

      const { vehicleInfo } = req.body;
      
      const session = await storage.createChatSession({
        userId: req.user.id, // Use authenticated user ID from session
        vehicleInfo: JSON.stringify(vehicleInfo || {}),
        status: "active"
      });
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to create chat session" });
    }
  });

  // Get user's chat sessions
  app.get("/api/chat/sessions", requireUser, async (req, res) => {
    try {
      const sessions = await storage.getUserChatSessions(req.user.id);

      // Get preview message and computed data for each session
      const sessionsWithPreviews = await Promise.all(
        sessions.map(async (session) => {
          const messages = await storage.getSessionMessages(session.id);
          const lastMessage = messages[messages.length - 1];
          
          // Compute the actual last activity time with safe timestamp conversions
          const sessionLastActivity = session.lastActivity ? new Date(session.lastActivity).getTime() : 0;
          const sessionCreated = session.createdAt ? new Date(session.createdAt).getTime() : 0;
          const messageCreated = lastMessage?.createdAt ? new Date(lastMessage.createdAt).getTime() : 0;
          
          const computedLastActivity = new Date(Math.max(sessionLastActivity, messageCreated, sessionCreated) || Date.now());

          // Count unread messages from non-user senders
          const unreadCount = messages.filter(msg => 
            !msg.isRead && msg.senderType !== 'user'
          ).length;
          
          return {
            ...session,
            lastActivity: computedLastActivity,
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              senderType: lastMessage.senderType
            } : null,
            messageCount: messages.length,
            unreadCount
          };
        })
      );

      // Sort by computed last activity (most recent first)
      const sortedSessions = sessionsWithPreviews.sort((a, b) => {
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      });
      
      res.json(sortedSessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });

  app.get("/api/chat/sessions/:sessionId/messages", requireUser, async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Verify user owns this session
      const session = await storage.getChatSession(sessionId);
      if (!session || session.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied to this chat session" });
      }
      
      const messages = await storage.getSessionMessages(sessionId);
      
      // Enrich with sender data (sanitized)
      const enrichedMessages = await Promise.all(
        messages.map(async (message) => {
          const sender = message.senderId ? await storage.getUser(message.senderId) : null;
          return {
            ...message,
            sender: toPublicUser(sender)
          };
        })
      );
      
      res.json(enrichedMessages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/sessions/:sessionId/messages", requireUser, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Content required" });
      }

      // Check if user is blocked
      const currentUser = await storage.getUser(req.user.id);
      if (currentUser?.isBlocked) {
        return res.status(403).json({ 
          error: "Your account has been blocked. You cannot send messages.",
          blocked: true 
        });
      }

      // Check if user has active subscription
      const hasActiveSub = await storage.hasActiveSubscription(req.user.id);
      if (!hasActiveSub) {
        return res.status(403).json({ 
          error: "Your subscription has expired. Please renew your subscription to continue chatting.",
          subscriptionExpired: true 
        });
      }
      
      // Verify user owns this session
      const session = await storage.getChatSession(sessionId);
      if (!session || session.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied to this chat session" });
      }
      
      // Check if this is the first user message in this session
      const existingMessages = await storage.getSessionMessages(sessionId);
      const userMessages = existingMessages.filter(msg => msg.senderType === "user");
      const isFirstMessage = userMessages.length === 0;
      
      const message = await storage.createMessage({
        sessionId,
        senderId: req.user.id, // Use authenticated user ID from session
        senderType: "user", // Always "user" for authenticated user messages
        content,
        isRead: false
      });
      
      // Send email notifications
      try {
        const messageCount = userMessages.length + 1;
        const now = Date.now();
        const lastNotification = sessionNotificationTimestamps.get(sessionId) || 0;
        const timeSinceLastNotification = now - lastNotification;
        
        if (isFirstMessage) {
          // First message - send immediate notification
          console.log('Sending first message notification for user:', req.user.username);
          await sendFirstMessageNotification(
            req.user.username,
            req.user.email || 'unknown@email.com',
            content,
            sessionId
          );
          sessionNotificationTimestamps.set(sessionId, now);
          console.log('Email notification sent for first message from user:', req.user.username);
        } else if (timeSinceLastNotification >= NOTIFICATION_INTERVAL_MS) {
          // 15 minutes passed - send activity notification
          const sessionStartTime = session.createdAt ? new Date(session.createdAt).getTime() : now;
          const durationMinutes = Math.round((now - sessionStartTime) / (1000 * 60));
          
          await sendChatActivityNotification(
            req.user.username,
            req.user.email || 'unknown@email.com',
            sessionId,
            messageCount,
            durationMinutes
          );
          sessionNotificationTimestamps.set(sessionId, now);
          console.log(`Chat activity notification sent (${durationMinutes}min) for user:`, req.user.username);
        }
      } catch (emailError) {
        // Log error but don't fail the message creation
        console.error('Failed to send email notification:', emailError);
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Get messages for chat session (user endpoint)
  app.get("/api/chat/sessions/:sessionId/messages", requireUser, async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Verify user owns this session
      const session = await storage.getChatSession(sessionId);
      if (!session || session.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied to this chat session" });
      }
      
      const messages = await storage.getSessionMessages(sessionId);
      
      // Enrich with sender data and attachments
      const enrichedMessages = await Promise.all(
        messages.map(async (message) => {
          const sender = message.senderId ? await storage.getUser(message.senderId) : null;
          const attachments = await storage.getMessageAttachments(message.id);
          
          return {
            ...message,
            sender: toPublicUser(sender),
            attachments: attachments
          };
        })
      );

      res.json(enrichedMessages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Upload file for chat message
  app.post("/api/chat/sessions/:sessionId/upload", requireUser, upload.single('file'), async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Check if user is blocked
      const currentUser = await storage.getUser(req.user.id);
      if (currentUser?.isBlocked) {
        return res.status(403).json({ 
          error: "Your account has been blocked. You cannot upload files.",
          blocked: true 
        });
      }

      // Check if user has active subscription
      const hasActiveSub = await storage.hasActiveSubscription(req.user.id);
      if (!hasActiveSub) {
        return res.status(403).json({ 
          error: "Your subscription has expired. Please renew your subscription to continue uploading files.",
          subscriptionExpired: true 
        });
      }
      
      // Verify user owns this session
      const session = await storage.getChatSession(sessionId);
      if (!session || session.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied to this chat session" });
      }
      
      // Check file size limits based on type
      const isImage = req.file.mimetype.startsWith('image/');
      const isVideo = req.file.mimetype.startsWith('video/');
      const maxSize = isImage ? 30 * 1024 * 1024 : 150 * 1024 * 1024; // 30MB for images, 150MB for videos
      
      if (req.file.size > maxSize) {
        // Delete uploaded file if size exceeded
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          error: `File too large. Maximum size is ${isImage ? '30MB' : '150MB'} for ${isImage ? 'images' : 'videos'}` 
        });
      }
      
      // Create message with file content indicator
      const message = await storage.createMessage({
        sessionId,
        senderId: req.user.id,
        senderType: "user",
        content: `[File: ${req.file.originalname}]`,
        isRead: false
      });
      
      // Create attachment record
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
      
      const attachment = await storage.createAttachment({
        messageId: message.id,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        filePath: req.file.path,
        expiresAt: expiresAt.toISOString(),
      });
      
      res.json({ message, attachment });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Serve uploaded files
  app.get("/api/uploads/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join('uploads', filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }
      
      // Get attachment info to verify access
      const attachment = await storage.getAttachmentByFilename(filename);
      if (!attachment) {
        return res.status(404).json({ error: "File not found" });
      }
      
      // Check if file has expired
      if (attachment.expiresAt && new Date() > new Date(attachment.expiresAt)) {
        // Delete expired file
        fs.unlinkSync(filePath);
        await storage.deleteAttachment(attachment.id);
        return res.status(404).json({ error: "File has expired" });
      }
      
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      res.status(500).json({ error: "Failed to serve file" });
    }
  });

  // Serve favicon and other static uploads (with subfolder support)
  app.get("/api/uploads/:subfolder/:filename", async (req, res) => {
    try {
      const { subfolder, filename } = req.params;
      const filePath = path.join('uploads', subfolder, filename);
      
      // Security check: ensure we're only serving from uploads directory
      const resolvedPath = path.resolve(filePath);
      const uploadsDir = path.resolve('uploads');
      
      if (!resolvedPath.startsWith(uploadsDir)) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }
      
      // Set appropriate cache headers for favicon
      if (subfolder === 'favicons') {
        res.set({
          'Cache-Control': 'public, max-age=86400', // 1 day cache
          'Content-Type': filename.endsWith('.ico') ? 'image/x-icon' : 
                         filename.endsWith('.png') ? 'image/png' :
                         filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' :
                         filename.endsWith('.gif') ? 'image/gif' : 'application/octet-stream'
        });
      }
      
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      console.error('Error serving static file:', error);
      res.status(500).json({ error: "Failed to serve file" });
    }
  });

  // Generate CAPTCHA for contact form
  app.get("/api/captcha", (req, res) => {
    const num1 = Math.floor(Math.random() * 10) + 1; // 1-10
    const num2 = Math.floor(Math.random() * 10) + 1; // 1-10
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    let question, answer;
    if (operation === '+') {
      question = `${num1} + ${num2}`;
      answer = num1 + num2;
    } else {
      // Make sure we don't get negative numbers
      const larger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      question = `${larger} - ${smaller}`;
      answer = larger - smaller;
    }
    
    res.json({
      question,
      answer // In production, store this server-side and only send a token
    });
  });

  // Contact form endpoint with anti-spam protection
  app.post("/api/contact", contactRateLimit, async (req, res) => {
    try {
      const { name, email, subject, message, honeypot, captcha, captchaAnswer } = req.body;
      
      // Honeypot check (hidden field that should be empty)
      if (honeypot && honeypot.trim() !== '') {
        console.log('Spam detected: honeypot filled');
        return res.status(400).json({ error: "Invalid submission" });
      }
      
      // CAPTCHA validation
      if (!captcha || !captchaAnswer || parseInt(captchaAnswer) !== captcha.answer) {
        return res.status(400).json({ error: "Please solve the math problem correctly" });
      }
      
      // Basic validation
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      
      // Anti-spam checks
      if (containsSpamKeywords(name + ' ' + subject + ' ' + message)) {
        console.log('Spam detected: spam keywords found');
        return res.status(400).json({ error: "Message contains inappropriate content" });
      }
      
      // Human validation with specific error messages
      const allCaps = /^[A-Z\s!.?]+$/.test(message) && message.length > 20;
      const tooManyUrls = (message.match(/https?:\/\/\S+/g) || []).length > 2;
      const repeatedChars = /(.)\1{8,}/.test(message);
      const tooShort = message.trim().length < 5;
      const tooLong = message.length > 5000;
      const invalidName = name.length < 2 || /^\d+$/.test(name);
      const noWords = !message.trim().match(/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+/);
      
      if (tooShort) {
        return res.status(400).json({ error: "Message too short. Please provide at least 5 characters." });
      }
      if (tooLong) {
        return res.status(400).json({ error: "Message too long. Please keep it under 5000 characters." });
      }
      if (invalidName) {
        return res.status(400).json({ error: "Please provide a valid name (at least 2 characters, not just numbers)." });
      }
      if (noWords) {
        return res.status(400).json({ error: "Please provide a message with actual words." });
      }
      if (allCaps) {
        return res.status(400).json({ error: "Please don't write your entire message in CAPS." });
      }
      if (tooManyUrls) {
        return res.status(400).json({ error: "Too many URLs in message. Please limit to 2 URLs maximum." });
      }
      if (repeatedChars) {
        return res.status(400).json({ error: "Please avoid excessive repeated characters." });
      }
      
      // Additional email domain check
      const suspiciousDomains = ['tempmail', '10minutemail', 'guerrillamail', 'mailinator'];
      const emailDomain = email.split('@')[1]?.toLowerCase();
      if (suspiciousDomains.some(domain => emailDomain?.includes(domain))) {
        return res.status(400).json({ error: "Please use a valid email address" });
      }
      
      // Send email notification
      await sendContactFormEmail(name, email, subject, message);
      
      res.json({ 
        success: true, 
        message: "Your message has been sent successfully. We'll get back to you soon!" 
      });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ error: "Failed to send message. Please try again later." });
    }
  });

  // User heartbeat for online status (protected)
  app.post("/api/users/heartbeat", requireUser, async (req, res) => {
    try {
      const updatedUser = await storage.updateUser(req.user.id, { 
        isOnline: true, 
        lastSeen: new Date().toISOString() 
      });
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update heartbeat" });
    }
  });

  // Google Ads Configuration Endpoints
  app.get("/api/admin/google-ads-config", requireAdmin, async (req, res) => {
    try {
      const config = await storage.getGoogleAdsConfig();
      res.json(config || {
        conversionId: 'AW-CONVERSION_ID',
        purchaseLabel: 'PURCHASE_CONVERSION_LABEL',
        signupLabel: 'SIGNUP_CONVERSION_LABEL',
        enabled: false
      });
    } catch (error) {
      console.error("Failed to get Google Ads config:", error);
      res.status(500).json({ error: "Failed to get Google Ads configuration" });
    }
  });

  app.put("/api/admin/google-ads-config", requireAdmin, async (req, res) => {
    try {
      const { conversionId, purchaseLabel, signupLabel, enabled } = req.body;
      
      // Validate required fields
      if (!conversionId || !purchaseLabel || !signupLabel) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Validate conversion ID format
      if (!conversionId.startsWith('AW-')) {
        return res.status(400).json({ error: "Conversion ID must start with 'AW-'" });
      }

      const result = await storage.updateGoogleAdsConfig({
        conversionId,
        purchaseLabel,
        signupLabel,
        enabled: Boolean(enabled)
      });

      if (result.success) {
        res.json({ success: true, message: result.message });
      } else {
        res.status(500).json({ error: result.message });
      }
    } catch (error) {
      console.error("Failed to update Google Ads config:", error);
      res.status(500).json({ error: "Failed to update Google Ads configuration" });
    }
  });

  // Public endpoint to get Google Ads config (for frontend tracking)
  app.get("/api/google-ads-config", async (req, res) => {
    try {
      const config = await storage.getGoogleAdsConfig();
      
      if (!config || !config.enabled) {
        return res.json({ enabled: false });
      }

      res.json({
        enabled: true,
        conversionId: config.conversionId,
        purchaseLabel: config.purchaseLabel,
        signupLabel: config.signupLabel
      });
    } catch (error) {
      console.error("Failed to get Google Ads config:", error);
      res.json({ enabled: false });
    }
  });

  // Admin app configuration endpoint
  app.get("/api/admin/app-config", requireAdmin, async (req, res) => {
    try {
      const config = await storage.getAppConfig();
      res.json(config);
    } catch (error) {
      console.error("Failed to get app config:", error);
      res.status(500).json({ error: "Failed to get app configuration" });
    }
  });

  app.put("/api/admin/app-config", requireAdmin, async (req, res) => {
    try {
      const {
        appName,
        appUrl,
        stripePublishableKey,
        stripeSecretKey,
        stripeWebhookSecret,
        paypalClientId,
        paypalClientSecret,
        paypalWebhookId,
        paypalMode,
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpUser,
        smtpPass,
        emailFrom,
        emailFromName,
        supportEmail,
        faviconPath
      } = req.body;

      // Basic validation
      if (paypalMode && !['sandbox', 'live'].includes(paypalMode)) {
        return res.status(400).json({ error: "PayPal mode must be 'sandbox' or 'live'" });
      }

      if (smtpPort && (isNaN(smtpPort) || smtpPort < 1 || smtpPort > 65535)) {
        return res.status(400).json({ error: "SMTP port must be a valid port number" });
      }

      const config = {
        appName,
        appUrl,
        stripePublishableKey,
        stripeSecretKey,
        stripeWebhookSecret,
        paypalClientId,
        paypalClientSecret,
        paypalWebhookId,
        paypalMode: paypalMode || 'sandbox',
        smtpHost,
        smtpPort: smtpPort ? parseInt(smtpPort) : 587,
        smtpSecure: smtpSecure !== false,
        smtpUser,
        smtpPass,
        emailFrom,
        emailFromName: emailFromName || 'AutoMentor',
        supportEmail,
        faviconPath
      };

      const result = await storage.updateAppConfig(config);
      res.json(result);
    } catch (error) {
      console.error("Failed to update app config:", error);
      res.status(500).json({ error: "Failed to update app configuration" });
    }
  });

  // SMTP Test endpoint
  app.post("/api/admin/test-smtp", requireAdmin, async (req, res) => {
    try {
      const { testEmail } = req.body;
      
      if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
        return res.status(400).json({ error: "Valid test email is required" });
      }

      // Get current SMTP configuration
      const config = await storage.getAppConfig();
      
      if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
        return res.status(400).json({ 
          error: "SMTP configuration is incomplete. Please configure SMTP settings first." 
        });
      }

      // Import nodemailer dynamically
      const nodemailer = await import('nodemailer');

      // Create transporter with current config
      const transporter = nodemailer.default.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      });

      // Test connection first
      await transporter.verify();

      // Send test email
      const mailOptions = {
        from: `${config.emailFromName} <${config.emailFrom || config.smtpUser}>`,
        to: testEmail,
        subject: '✅ Test Email from AutoMentor',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4CAF50; text-align: center;">🎉 SMTP Test Successful!</h2>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px;">Congratulations! Your SMTP configuration is working correctly.</p>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; border-left: 4px solid #4CAF50;">
              <h3 style="margin-top: 0; color: #2e7d32;">Configuration Details:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>SMTP Host:</strong> ${config.smtpHost}</li>
                <li><strong>Port:</strong> ${config.smtpPort}</li>
                <li><strong>Security:</strong> ${config.smtpSecure ? 'TLS/SSL' : 'None'}</li>
                <li><strong>From:</strong> ${config.emailFromName} &lt;${config.emailFrom || config.smtpUser}&gt;</li>
              </ul>
            </div>
            
            <p style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
              This is an automated test email from AutoMentor Admin Panel.<br>
              Test sent at: ${new Date().toLocaleString()}
            </p>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="${config.appUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Visit AutoMentor
              </a>
            </div>
          </div>
        `,
        text: `
SMTP Test Successful!

Congratulations! Your SMTP configuration is working correctly.

Configuration Details:
- SMTP Host: ${config.smtpHost}
- Port: ${config.smtpPort}
- Security: ${config.smtpSecure ? 'TLS/SSL' : 'None'}
- From: ${config.emailFromName} <${config.emailFrom || config.smtpUser}>

This is an automated test email from AutoMentor Admin Panel.
Test sent at: ${new Date().toLocaleString()}
        `
      };

      const result = await transporter.sendMail(mailOptions);
      
      res.json({
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
        messageId: result.messageId
      });

    } catch (error: any) {
      console.error("SMTP test failed:", error);
      
      let errorMessage = "SMTP test failed";
      
      if (error.code === 'EAUTH') {
        errorMessage = "Authentication failed. Please check your SMTP username and password.";
      } else if (error.code === 'ECONNECTION' || error.code === 'ENOTFOUND') {
        errorMessage = "Connection failed. Please check your SMTP host and port.";
      } else if (error.code === 'ESECURE') {
        errorMessage = "Security error. Please check your TLS/SSL settings.";
      } else if (error.message) {
        errorMessage = `SMTP Error: ${error.message}`;
      }
      
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  });

  // Favicon upload endpoint
  app.post("/api/admin/upload-favicon", requireAdmin, upload.single('favicon'), async (req, res) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "No favicon file uploaded" });
      }

      // Validate file type
      const allowedMimeTypes = [
        'image/x-icon',
        'image/vnd.microsoft.icon', 
        'image/png',
        'image/jpeg',
        'image/gif'
      ];
      
      if (!allowedMimeTypes.includes(file.mimetype)) {
        // Delete uploaded file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({ 
          error: "Invalid file type. Only .ico, .png, .jpg, and .gif files are allowed." 
        });
      }

      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        // Delete uploaded file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({ 
          error: "File size too large. Maximum size is 1MB." 
        });
      }

      // Create favicons directory if it doesn't exist
      const faviconDir = path.join('uploads', 'favicons');
      if (!fs.existsSync(faviconDir)) {
        fs.mkdirSync(faviconDir, { recursive: true });
      }

      // Generate new filename for favicon
      const fileExtension = path.extname(file.originalname);
      const faviconFilename = `favicon-${Date.now()}${fileExtension}`;
      const faviconPath = path.join(faviconDir, faviconFilename);

      // Move file to favicons directory
      fs.renameSync(file.path, faviconPath);

      const relativePath = `favicons/${faviconFilename}`;

      // Remove old favicon if exists
      try {
        const currentConfig = await storage.getAppConfig();
        if (currentConfig.faviconPath) {
          const oldFaviconPath = path.join('uploads', currentConfig.faviconPath);
          if (fs.existsSync(oldFaviconPath)) {
            fs.unlinkSync(oldFaviconPath);
          }
        }
      } catch (error) {
        console.error('Error removing old favicon:', error);
        // Continue anyway
      }

      res.json({
        success: true,
        faviconPath: relativePath,
        message: "Favicon uploaded successfully",
        url: `/api/uploads/${relativePath}`
      });

    } catch (error) {
      console.error('Favicon upload error:', error);
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Failed to upload favicon" });
    }
  });

  // Favicon endpoint - serves current favicon
  app.get("/favicon.ico", async (req, res) => {
    try {
      const config = await storage.getAppConfig();
      
      if (config.faviconPath) {
        const faviconPath = path.join('uploads', config.faviconPath);
        
        if (fs.existsSync(faviconPath)) {
          res.set({
            'Cache-Control': 'public, max-age=86400',
            'Content-Type': 'image/x-icon'
          });
          return res.sendFile(path.resolve(faviconPath));
        }
      }
      
      // Fallback to default favicon if exists
      const defaultFavicon = path.join(__dirname, '../client/public/favicon.ico');
      if (fs.existsSync(defaultFavicon)) {
        res.set({
          'Cache-Control': 'public, max-age=86400',
          'Content-Type': 'image/x-icon'
        });
        return res.sendFile(path.resolve(defaultFavicon));
      }
      
      // Return 404 if no favicon found
      res.status(404).send('Favicon not found');
    } catch (error) {
      console.error('Error serving favicon:', error);
      res.status(500).send('Error serving favicon');
    }
  });

  // Public app configuration endpoint (returns only non-sensitive data)
  app.get("/api/app-config", async (req, res) => {
    try {
      const config = await storage.getAppConfig();
      
      // Return only public configuration
      res.json({
        appName: config.appName,
        appUrl: config.appUrl,
        paypalMode: config.paypalMode,
        supportEmail: config.supportEmail,
        emailFromName: config.emailFromName,
        stripePublishableKey: config.stripePublishableKey, // This is safe to expose
        faviconPath: config.faviconPath // Add favicon path for frontend
      });
    } catch (error) {
      console.error("Failed to get public app config:", error);
      res.json({
        appName: 'AutoMentor',
        appUrl: 'http://localhost:5000',
        paypalMode: 'sandbox',
        supportEmail: '',
        emailFromName: 'AutoMentor',
        stripePublishableKey: '',
        faviconPath: ''
      });
    }
  });

  // ===============================
  // ANALYTICS ENDPOINTS
  // ===============================

  // Get dashboard statistics
  app.get("/api/admin/analytics/dashboard", requireAdmin, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const stats = await storage.getDashboardStats(
        startDate as string, 
        endDate as string
      );
      res.json(stats);
    } catch (error) {
      console.error("Failed to get dashboard stats:", error);
      res.status(500).json({ error: "Failed to get dashboard statistics" });
    }
  });

  // Get revenue analytics
  app.get("/api/admin/analytics/revenue", requireAdmin, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const revenue = await storage.getRevenueAnalytics(
        startDate as string, 
        endDate as string
      );
      res.json(revenue);
    } catch (error) {
      console.error("Failed to get revenue analytics:", error);
      res.status(500).json({ error: "Failed to get revenue analytics" });
    }
  });

  // Get chart data for different metrics
  app.get("/api/admin/analytics/charts/:type", requireAdmin, async (req, res) => {
    try {
      const { type } = req.params;
      const { period = 'month' } = req.query;
      
      if (!['users', 'revenue', 'chats'].includes(type)) {
        return res.status(400).json({ error: "Invalid chart type" });
      }
      
      const chartData = await storage.getChartData(type, period as string);
      res.json(chartData);
    } catch (error) {
      console.error("Failed to get chart data:", error);
      res.status(500).json({ error: "Failed to get chart data" });
    }
  });

  // Track analytics event
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const {
        eventType,
        eventName,
        userId,
        sessionId,
        properties,
        pageUrl,
        referrer,
        userAgent,
        ipAddress
      } = req.body;

      await storage.trackEvent({
        eventType: eventType || 'page_view',
        eventName: eventName || 'unknown',
        userId,
        sessionId,
        properties: properties ? JSON.stringify(properties) : null,
        pageUrl,
        referrer,
        userAgent,
        ipAddress
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to track event:", error);
      res.status(500).json({ error: "Failed to track event" });
    }
  });

  // ===============================
  // CMS ENDPOINTS
  // ===============================

  // Get all content pages (admin)
  app.get("/api/admin/cms/pages", requireAdmin, async (req, res) => {
    try {
      const pages = await storage.getAllContentPages();
      res.json(pages);
    } catch (error) {
      console.error("Failed to get content pages:", error);
      res.status(500).json({ error: "Failed to get content pages" });
    }
  });

  // Get specific content page (public)
  app.get("/api/cms/pages/:pageKey", async (req, res) => {
    try {
      const { pageKey } = req.params;
      const page = await storage.getContentPage(pageKey);
      
      if (!page || !page.isPublished) {
        return res.status(404).json({ error: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Failed to get content page:", error);
      res.status(500).json({ error: "Failed to get content page" });
    }
  });

  // Update content page (admin)
  app.put("/api/admin/cms/pages/:pageKey", requireAdmin, async (req, res) => {
    try {
      const { pageKey } = req.params;
      const {
        title,
        metaDescription,
        metaKeywords,
        content,
        isPublished,
        seoTitle,
        canonicalUrl,
        ogTitle,
        ogDescription,
        ogImage
      } = req.body;

      const updatedPage = await storage.updateContentPage(pageKey, {
        title,
        metaDescription,
        metaKeywords,
        content: typeof content === 'object' ? JSON.stringify(content) : content,
        isPublished,
        seoTitle,
        canonicalUrl,
        ogTitle,
        ogDescription,
        ogImage,
        lastEditedBy: req.user?.id || 'admin',
        version: 1 // TODO: implement versioning
      });

      res.json(updatedPage);
    } catch (error) {
      console.error("Failed to update content page:", error);
      res.status(500).json({ error: "Failed to update content page" });
    }
  });

  // FAQ endpoints
  app.get("/api/cms/faqs", async (req, res) => {
    try {
      const faqs = await storage.getFaqs();
      res.json(faqs);
    } catch (error) {
      console.error("Failed to get FAQs:", error);
      res.status(500).json({ error: "Failed to get FAQs" });
    }
  });

  app.post("/api/admin/cms/faqs", requireAdmin, async (req, res) => {
    try {
      const { question, answer, category, isPublished, sortOrder } = req.body;
      
      if (!question || !answer) {
        return res.status(400).json({ error: "Question and answer are required" });
      }

      const newFaq = await storage.createFaq({
        question,
        answer,
        category: category || 'general',
        isPublished: isPublished !== false,
        sortOrder: sortOrder || 0
      });

      res.status(201).json(newFaq);
    } catch (error) {
      console.error("Failed to create FAQ:", error);
      res.status(500).json({ error: "Failed to create FAQ" });
    }
  });

  app.put("/api/admin/cms/faqs/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { question, answer, category, isPublished, sortOrder } = req.body;

      const updatedFaq = await storage.updateFaq(id, {
        question,
        answer,
        category,
        isPublished,
        sortOrder
      });

      res.json(updatedFaq);
    } catch (error) {
      console.error("Failed to update FAQ:", error);
      res.status(500).json({ error: "Failed to update FAQ" });
    }
  });

  app.delete("/api/admin/cms/faqs/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFaq(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete FAQ:", error);
      res.status(500).json({ error: "Failed to delete FAQ" });
    }
  });

  // Testimonial endpoints
  app.get("/api/cms/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials(true); // Only approved
      res.json(testimonials);
    } catch (error) {
      console.error("Failed to get testimonials:", error);
      res.status(500).json({ error: "Failed to get testimonials" });
    }
  });

  app.get("/api/admin/cms/testimonials", requireAdmin, async (req, res) => {
    try {
      const { approved } = req.query;
      const approvedFilter = approved === 'true' ? true : approved === 'false' ? false : undefined;
      const testimonials = await storage.getTestimonials(approvedFilter);
      res.json(testimonials);
    } catch (error) {
      console.error("Failed to get testimonials:", error);
      res.status(500).json({ error: "Failed to get testimonials" });
    }
  });

  app.post("/api/cms/testimonials", async (req, res) => {
    try {
      const { name, email, content, rating, company, position } = req.body;
      
      if (!name || !content) {
        return res.status(400).json({ error: "Name and content are required" });
      }

      const newTestimonial = await storage.createTestimonial({
        name,
        email,
        content,
        rating: rating || 5,
        company,
        position,
        isApproved: false, // Requires admin approval
        isPublished: false
      });

      res.status(201).json(newTestimonial);
    } catch (error) {
      console.error("Failed to create testimonial:", error);
      res.status(500).json({ error: "Failed to create testimonial" });
    }
  });

  app.put("/api/admin/cms/testimonials/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, content, rating, isApproved, isPublished, company, position } = req.body;

      const updatedTestimonial = await storage.updateTestimonial(id, {
        name,
        content,
        rating,
        isApproved,
        isPublished,
        company,
        position
      });

      res.json(updatedTestimonial);
    } catch (error) {
      console.error("Failed to update testimonial:", error);
      res.status(500).json({ error: "Failed to update testimonial" });
    }
  });

  app.delete("/api/admin/cms/testimonials/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTestimonial(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete testimonial:", error);
      res.status(500).json({ error: "Failed to delete testimonial" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
