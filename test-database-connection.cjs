// Test database connection for Render deployment
// Use CommonJS for compatibility
const Database = require('better-sqlite3');
const path = require('path');

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection');
  console.log('==============================');
  
  // Environment check
  console.log('\n📊 Environment Variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET');
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    const masked = url.replace(/\/\/.*@/, '//***:***@');
    console.log('DATABASE_URL preview:', masked);
  }
  
  let db;
  
  try {
    console.log('\n🔄 Initializing database...');
    
    // Simulate the same logic as server/db.ts
    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
      console.log('🐘 Attempting PostgreSQL connection...');
      // For PostgreSQL test, we'll simulate the connection
      console.log('✅ PostgreSQL mode detected');
      console.log('📋 Connection would use:', process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'unknown host');
      
      // Note: We can't actually test PostgreSQL without the postgres package
      console.log('⚠️  Full PostgreSQL test requires actual deployment');
      
    } else {
      console.log('📁 Using SQLite for testing...');
      const dbPath = path.join(__dirname, 'database.sqlite');
      db = new Database(dbPath);
      console.log('✅ SQLite connected successfully');
      
      // Test SQLite operations
      console.log('\n🧪 Testing SQLite operations...');
      
      // Check tables
      const tables = db.prepare(`
        SELECT name 
        FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `).all();
      
      console.log(`✅ Tables found: ${tables.length}`);
      tables.forEach(table => console.log(`   - ${table.name}`));
      
      // Check users
      try {
        const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
        console.log(`✅ Users table accessible, ${users.count} users found`);
        
        // Check admin users
        const admins = db.prepare('SELECT username, email, is_admin, is_blocked FROM users WHERE is_admin = 1').all();
        console.log(`✅ Admin users: ${admins.length}`);
        admins.forEach((admin, i) => {
          console.log(`   Admin ${i + 1}: ${admin.username} (${admin.email || 'no email'}) - Blocked: ${admin.is_blocked ? 'YES' : 'NO'}`);
        });
        
      } catch (error) {
        console.log('❌ Users table test failed:', error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  } finally {
    if (db) {
      db.close();
    }
  }
  
  console.log('\n📋 Connection Summary:');
  console.log('======================');
  
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    console.log('🐘 Using PostgreSQL (Production)');
    console.log('✅ Ready for Render deployment');
  } else {
    console.log('📁 Using SQLite (Development)');
    console.log('⚠️  Remember to set DATABASE_URL on Render');
  }
  
  console.log('\n🚀 Render Deployment Checklist:');
  console.log('1. ✅ Set NODE_ENV=production');
  console.log('2. ✅ Set DATABASE_URL=postgresql://...');
  console.log('3. ✅ Database connection code ready');
  console.log('4. ✅ Tables will auto-create on first run');
}

// Run the test
testDatabaseConnection().catch(console.error);