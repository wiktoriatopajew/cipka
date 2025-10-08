import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function importData() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found');
    return;
  }
  
  console.log('🔄 Loading exported data...');
  const exportData = JSON.parse(fs.readFileSync('./sqlite-export.json', 'utf8'));
  
  console.log('🔄 Connecting to PostgreSQL...');
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });
  
  try {
    // Import users first (other tables reference them)
    if (exportData.users && exportData.users.length > 0) {
      console.log(`📥 Importing ${exportData.users.length} users...`);
      
      // Convert SQLite boolean format to PostgreSQL
      const users = exportData.users.map(user => ({
        id: user.id,
        username: user.username,
        password: user.password,
        email: user.email,
        isAdmin: Boolean(user.is_admin),
        hasSubscription: Boolean(user.has_subscription),
        isOnline: Boolean(user.is_online),
        isBlocked: Boolean(user.is_blocked),
        referralCode: user.referral_code,
        referredBy: user.referred_by,
        lastSeen: user.last_seen ? new Date(user.last_seen) : null,
        createdAt: user.created_at ? new Date(user.created_at) : null,
      }));
      
      await db.insert(schema.users).values(users);
      console.log('✅ Users imported');
    }
    
    // Import subscriptions
    if (exportData.subscriptions && exportData.subscriptions.length > 0) {
      console.log(`📥 Importing ${exportData.subscriptions.length} subscriptions...`);
      
      const subscriptions = exportData.subscriptions.map(sub => ({
        id: sub.id,
        userId: sub.user_id,
        amount: sub.amount,
        status: sub.status,
        purchasedAt: sub.purchased_at ? new Date(sub.purchased_at) : null,
        expiresAt: sub.expires_at ? new Date(sub.expires_at) : null,
      }));
      
      await db.insert(schema.subscriptions).values(subscriptions);
      console.log('✅ Subscriptions imported');
    }
    
    // Import chat sessions  
    if (exportData.chatSessions && exportData.chatSessions.length > 0) {
      console.log(`📥 Importing ${exportData.chatSessions.length} chat sessions...`);
      
      const chatSessions = exportData.chatSessions.map((session: any) => ({
        id: session.id,
        userId: session.user_id,
        vehicleInfo: session.vehicle_info,
        status: session.status,
        createdAt: session.created_at ? new Date(session.created_at) : null,
        lastActivity: session.last_activity ? new Date(session.last_activity) : null,
      }));
      
      await db.insert(schema.chatSessions).values(chatSessions);
      console.log('✅ Chat sessions imported');
    }
    
    // Import messages
    if (exportData.messages && exportData.messages.length > 0) {
      console.log(`📥 Importing ${exportData.messages.length} messages...`);
      
      const messages = exportData.messages.map((msg: any) => ({
        id: msg.id,
        sessionId: msg.session_id,
        senderId: msg.sender_id,
        senderType: msg.sender_type,
        content: msg.content,
        isRead: Boolean(msg.is_read),
        createdAt: msg.created_at ? new Date(msg.created_at) : null,
      }));
      
      await db.insert(schema.messages).values(messages);
      console.log('✅ Messages imported');
    }
    
    // Import other tables if they have data
    const tableImports = [
      { key: 'attachments', table: schema.attachments, name: 'attachments' },
      { key: 'referralRewards', table: schema.referralRewards, name: 'referral rewards' },
      { key: 'googleAdsConfig', table: schema.googleAdsConfig, name: 'Google Ads config' },
      { key: 'appConfig', table: schema.appConfig, name: 'app config' },
      { key: 'analyticsEvents', table: schema.analyticsEvents, name: 'analytics events' },
      { key: 'dailyStats', table: schema.dailyStats, name: 'daily stats' },
      { key: 'revenueAnalytics', table: schema.revenueAnalytics, name: 'revenue analytics' },
      { key: 'contentPages', table: schema.contentPages, name: 'content pages' },
      { key: 'faqs', table: schema.faqs, name: 'FAQs' },
      { key: 'testimonials', table: schema.testimonials, name: 'testimonials' },
    ];
    
    for (const { key, table, name } of tableImports) {
      if (exportData[key] && exportData[key].length > 0) {
        console.log(`📥 Importing ${exportData[key].length} ${name}...`);
        try {
          // Convert field names from snake_case to camelCase and handle dates/booleans
          const convertedData = exportData[key].map(item => {
            const converted = {};
            for (const [sqliteKey, value] of Object.entries(item)) {
              // Convert snake_case to camelCase
              const camelKey = sqliteKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
              
              // Handle date fields
              if (camelKey.includes('At') || camelKey.includes('Date') || sqliteKey.includes('_at') || sqliteKey.includes('_date')) {
                converted[camelKey] = value ? new Date(value) : null;
              }
              // Handle boolean fields (SQLite uses 0/1)
              else if (camelKey.startsWith('is') || camelKey.startsWith('has')) {
                converted[camelKey] = Boolean(value);
              }
              else {
                converted[camelKey] = value;
              }
            }
            return converted;
          });
          
          await db.insert(table).values(convertedData);
          console.log(`✅ ${name} imported`);
        } catch (error) {
          console.error(`❌ Failed to import ${name}:`, error.message);
        }
      }
    }
    
    console.log('🎉 All data imported successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await client.end();
  }
}

importData();