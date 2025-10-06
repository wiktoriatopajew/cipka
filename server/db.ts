import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Database configuration based on environment
let db: any;

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  // Production: Use PostgreSQL
  const client = postgres(process.env.DATABASE_URL);
  db = drizzlePg(client, { schema });
  console.log('🐘 Connected to PostgreSQL database');
} else {
  // Development: Use SQLite
  const sqlite = new Database('./database.sqlite');
  db = drizzle(sqlite, { schema });
  console.log('📁 Connected to SQLite database');
}

export { db };
