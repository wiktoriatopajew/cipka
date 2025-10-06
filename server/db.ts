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
      // Attempt a safe, idempotent fix: create essential tables/columns used during startup
      try {
        console.log('⚠️  Attempting emergency SQL fixes (idempotent) to recover from failed migrations...');
        await client`ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS username text;`;
        await client`CREATE TABLE IF NOT EXISTS public.attachments (
          id text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          message_id text,
          file_name text NOT NULL,
          original_name text NOT NULL,
          file_size integer NOT NULL,
          mime_type text NOT NULL,
          file_path text NOT NULL,
          uploaded_at timestamp DEFAULT now(),
          expires_at timestamp
        );`;
        await client`CREATE TABLE IF NOT EXISTS public.chat_sessions (
          id text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          user_id text,
          vehicle_info text,
          status text DEFAULT 'active',
          created_at timestamp DEFAULT now(),
          last_activity timestamp DEFAULT now()
        );`;
        await client`CREATE TABLE IF NOT EXISTS public.messages (
          id text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          session_id text,
          sender_id text,
          sender_type text,
          content text NOT NULL,
          is_read boolean DEFAULT false,
          created_at timestamp DEFAULT now()
        );`;
        console.log('✅ Emergency SQL fixes applied (best-effort).');
      } catch (innerErr) {
        console.error('❌ Emergency fixes failed:', innerErr);
      }
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
