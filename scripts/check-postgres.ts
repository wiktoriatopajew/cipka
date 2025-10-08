import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function checkDatabase() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }
  
  console.log('🔍 Connecting to PostgreSQL...');
  console.log('Connection string exists:', !!connectionString);
  
  const client = postgres(connectionString);
  
  try {
    // Test basic connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to PostgreSQL successfully');
    console.log('Database version:', result[0].version);
    
    // Check which tables exist
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('\n📋 Tables in PostgreSQL database:');
    tables.forEach(table => console.log(`  - ${table.table_name}`));
    console.log(`\nTotal tables: ${tables.length}`);
    
    // Check row counts for each table
    console.log('\n📊 Row counts:');
    for (const table of tables) {
      try {
        const count = await client`SELECT COUNT(*) as count FROM ${client(table.table_name)}`;
        console.log(`  ${table.table_name}: ${count[0].count} rows`);
      } catch (error) {
        console.log(`  ${table.table_name}: Error counting rows`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await client.end();
  }
}

checkDatabase();