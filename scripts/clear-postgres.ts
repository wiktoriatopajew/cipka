import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function clearDatabase() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found');
    return;
  }
  
  console.log('🔄 Connecting to PostgreSQL...');
  const client = postgres(connectionString);
  
  try {
    console.log('🗑️ Clearing all data...');
    
    // Delete in reverse order to avoid foreign key constraints
    await client`DELETE FROM messages`;
    await client`DELETE FROM attachments`;
    await client`DELETE FROM chat_sessions`;
    await client`DELETE FROM subscriptions`;
    await client`DELETE FROM referral_rewards`;
    await client`DELETE FROM revenue_analytics`;
    await client`DELETE FROM analytics_events`;
    await client`DELETE FROM users`;
    await client`DELETE FROM content_pages`;
    await client`DELETE FROM faqs`;
    await client`DELETE FROM testimonials`;
    await client`DELETE FROM media_library`;
    await client`DELETE FROM daily_stats`;
    await client`DELETE FROM google_ads_config`;
    await client`DELETE FROM app_config`;
    
    console.log('✅ Database cleared');
    
  } catch (error) {
    console.error('❌ Clear failed:', error);
  } finally {
    await client.end();
  }
}

clearDatabase();