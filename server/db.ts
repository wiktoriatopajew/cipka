import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Database configuration based on environment
let db: any;

console.log('Database config check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);

async function initializeDatabase() {
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    // Production: Use PostgreSQL
    const client = postgres(process.env.DATABASE_URL);
    db = drizzlePg(client, { schema });
    
    // Run migrations on startup
    console.log('🔄 Running PostgreSQL migrations...');
    try {
      await migrate(db, { migrationsFolder: './migrations' });
      console.log('✅ PostgreSQL migrations completed!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
    }
    
    console.log('🐘 Connected to PostgreSQL database');
  } else {
    // Development: Use SQLite
    const sqlite = new Database('./database.sqlite');
    db = drizzle(sqlite, { schema });
    console.log('📁 Connected to SQLite database');
  }
}

// Initialize database

const dbReady = initializeDatabase().then(() => db);
export { db, dbReady };
