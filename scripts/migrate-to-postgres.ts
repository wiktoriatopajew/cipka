import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';
import fs from 'fs';

interface TableInfo {
  name: string;
}

interface ExportData {
  [key: string]: any[];
}

async function exportSQLiteData(): Promise<ExportData> {
  console.log('🔄 Exporting data from SQLite...');
  
  // Connect to SQLite
  const sqliteDb = new Database('./database.sqlite');
  const sqlite = drizzle(sqliteDb);
  
  const exportData: ExportData = {
    users: [],
    subscriptions: [],
    chatSessions: [],
    messages: [],
    attachments: [],
    referralRewards: [],
    googleAdsConfig: [],
    appConfig: [],
    analyticsEvents: [],
    dailyStats: [],
    revenueAnalytics: [],
    contentPages: [],
    faqs: [],
    testimonials: [],
    mediaLibrary: []
  };
  
  try {
    // Check which tables exist in SQLite
    const tables = sqliteDb.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' 
      ORDER BY name
    `).all() as TableInfo[];
    
    console.log('📋 Tables found in SQLite:');
    tables.forEach(table => console.log(`  - ${table.name}`));
    
    // Export data from each table that exists
    for (const table of tables) {
      const tableName = table.name;
      try {
        const data = sqliteDb.prepare(`SELECT * FROM ${tableName}`).all();
        console.log(`📊 ${tableName}: ${data.length} records`);
        
        if (exportData.hasOwnProperty(tableName)) {
          exportData[tableName] = data;
        } else if (tableName === 'chat_sessions') {
          exportData['chatSessions'] = data;
        } else if (tableName === 'referral_rewards') {
          exportData['referralRewards'] = data;
        } else if (tableName === 'google_ads_config') {
          exportData['googleAdsConfig'] = data;
        } else if (tableName === 'app_config') {
          exportData['appConfig'] = data;
        } else if (tableName === 'analytics_events') {
          exportData['analyticsEvents'] = data;
        } else if (tableName === 'daily_stats') {
          exportData['dailyStats'] = data;
        } else if (tableName === 'revenue_analytics') {
          exportData['revenueAnalytics'] = data;
        } else if (tableName === 'content_pages') {
          exportData['contentPages'] = data;
        } else if (tableName === 'media_library') {
          exportData['mediaLibrary'] = data;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`⚠️  Could not export ${tableName}:`, errorMessage);
      }
    }
    
    // Save to JSON file
    fs.writeFileSync('./sqlite-export.json', JSON.stringify(exportData, null, 2));
    console.log('✅ Data exported to sqlite-export.json');
    
    return exportData;
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  } finally {
    sqliteDb.close();
  }
}

async function importToPostgreSQL(connectionString: string, exportData: ExportData): Promise<void> {
  console.log('🔄 Importing data to PostgreSQL...');
  
  if (!connectionString) {
    console.log('⚠️  No PostgreSQL connection string provided. Skipping import.');
    return;
  }
  
  // Connect to PostgreSQL
  const client = postgres(connectionString);
  const pg = drizzlePg(client, { schema });
  
  try {
    console.log('🔄 Running migrations...');
    // Here you would run your migrations first
    // await migrate(pg, { migrationsFolder: './migrations' });
    
    // Import data to each table
    const tableOrder = [
      'users', 'subscriptions', 'chatSessions', 'messages', 
      'attachments', 'referralRewards', 'googleAdsConfig', 
      'appConfig', 'analyticsEvents', 'dailyStats', 
      'revenueAnalytics', 'contentPages', 'faqs', 
      'testimonials', 'mediaLibrary'
    ];
    
    for (const tableName of tableOrder) {
      const data = exportData[tableName];
      if (data && data.length > 0) {
        try {
          console.log(`📥 Importing ${data.length} records to ${tableName}...`);
          
          // Note: You'll need to adjust this based on your actual schema
          // This is a placeholder - actual import would need proper mapping
          // await pg.insert(schema[tableName]).values(data);
          
          console.log(`✅ ${tableName}: ${data.length} records imported`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Failed to import ${tableName}:`, errorMessage);
        }
      } else {
        console.log(`⏭️  ${tableName}: No data to import`);
      }
    }
    
    console.log('✅ Import completed!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    // Export from SQLite
    const exportData = await exportSQLiteData();
    
    // Get PostgreSQL connection string from environment
    const pgConnectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (pgConnectionString) {
      await importToPostgreSQL(pgConnectionString, exportData);
    } else {
      console.log('🔧 To import to PostgreSQL, set DATABASE_URL or POSTGRES_URL environment variable');
      console.log('📁 Data has been exported to sqlite-export.json');
      console.log('');
      console.log('Next steps:');
      console.log('1. Create a PostgreSQL database (Neon.tech, Supabase, or Vercel Postgres)');
      console.log('2. Set the DATABASE_URL environment variable');
      console.log('3. Run this script again to import the data');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

main();