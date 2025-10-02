import { db } from '../server/db.js';

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Try a simple query
    const result = await db.all('SELECT 1 as test');
    
    if (result) {
      console.log('✅ Database connection successful!');
      console.log('📊 Connection details:');
      console.log('- Database: Connected');
      console.log('- Query test: Passed');
    }
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
    process.exit(1);
  }
}

testDatabaseConnection();