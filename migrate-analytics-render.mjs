#!/usr/bin/env node

/**
 * Migration script for Render.com deployment
 * Adds analytics columns to existing database
 */

import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

async function runMigration() {
  console.log('🚀 Starting analytics migration on Render database...');
  console.log('📊 Database:', DATABASE_URL.split('@')[1]?.split('/')[0] || 'connected');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Render PostgreSQL
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if analytics_events table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'analytics_events'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ analytics_events table does not exist!');
      console.log('💡 Run: npm run db:push first to create all tables');
      process.exit(1);
    }

    console.log('✅ analytics_events table exists');

    // Add missing columns
    console.log('📝 Adding analytics columns...');

    const migrations = [
      {
        column: 'ip_address',
        sql: `ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS ip_address TEXT`
      },
      {
        column: 'country',
        sql: `ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS country TEXT`
      },
      {
        column: 'city',
        sql: `ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS city TEXT`
      },
      {
        column: 'device_type',
        sql: `ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS device_type TEXT`
      },
      {
        column: 'browser',
        sql: `ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS browser TEXT`
      },
      {
        column: 'os',
        sql: `ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS os TEXT`
      }
    ];

    for (const migration of migrations) {
      try {
        await client.query(migration.sql);
        console.log(`  ✅ Added column: ${migration.column}`);
      } catch (error) {
        console.log(`  ℹ️  Column ${migration.column} already exists or error: ${error.message}`);
      }
    }

    // Create indexes
    console.log('📊 Creating indexes...');

    const indexes = [
      {
        name: 'idx_analytics_events_type_date',
        sql: `CREATE INDEX IF NOT EXISTS idx_analytics_events_type_date 
              ON analytics_events(event_type, created_at)`
      },
      {
        name: 'idx_analytics_events_ip',
        sql: `CREATE INDEX IF NOT EXISTS idx_analytics_events_ip 
              ON analytics_events(ip_address)`
      },
      {
        name: 'idx_analytics_events_country',
        sql: `CREATE INDEX IF NOT EXISTS idx_analytics_events_country 
              ON analytics_events(country)`
      }
    ];

    for (const index of indexes) {
      try {
        await client.query(index.sql);
        console.log(`  ✅ Created index: ${index.name}`);
      } catch (error) {
        console.log(`  ℹ️  Index ${index.name} already exists`);
      }
    }

    // Verify columns
    console.log('\n🔍 Verifying schema...');
    const schemaCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'analytics_events'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Current analytics_events schema:');
    schemaCheck.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Next steps:');
    console.log('1. Deploy your app to Render');
    console.log('2. Visit your admin panel');
    console.log('3. Check "Statystyki Odwiedzin" tab');
    console.log('\n🎉 All done!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
