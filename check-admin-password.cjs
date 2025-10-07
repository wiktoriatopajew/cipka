// Check admin password
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

try {
  const db = new Database(dbPath);
  
  const admin = db.prepare("SELECT username, password FROM users WHERE is_admin = 1").get();
  if (admin) {
    console.log('Admin user found:', admin.username);
    console.log('Password hash:', admin.password);
    
    // Test common passwords
    const testPasswords = ['admin', 'password', '123456', 'admin123'];
    
    for (const testPassword of testPasswords) {
      const isMatch = bcrypt.compareSync(testPassword, admin.password);
      console.log(`Password "${testPassword}": ${isMatch ? '✅ MATCH' : '❌ no match'}`);
    }
  } else {
    console.log('❌ No admin user found');
  }
  
  db.close();
} catch (error) {
  console.error('❌ Error:', error.message);
}