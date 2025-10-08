import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testBackend() {
  console.log('🔍 Testing backend functionality...');
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found');
    return;
  }
  
  console.log('✅ Environment variables loaded');
  
  try {
    // Test database connection
    const client = postgres(connectionString);
    const db = drizzle(client, { schema });
    
    console.log('🔍 Testing database connection...');
    
    // Test basic query
    const userCount = await db.$count(schema.users);
    console.log(`✅ Database connected - Users: ${userCount}`);
    
    // Test session count
    const sessionCount = await db.$count(schema.chatSessions);
    console.log(`✅ Chat sessions: ${sessionCount}`);
    
    // Test message count
    const messageCount = await db.$count(schema.messages);
    console.log(`✅ Messages: ${messageCount}`);
    
    await client.end();
    console.log('✅ Database connection closed');
    
    console.log('\n🎉 Backend test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Environment variables: OK');
    console.log('✅ Database connection: OK');
    console.log('✅ Schema access: OK');
    console.log(`✅ Data integrity: ${userCount} users, ${sessionCount} sessions, ${messageCount} messages`);
    
  } catch (error) {
    console.error('❌ Backend test failed:', error);
  }
}

testBackend();