// Debug login process
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

try {
  const db = new Database(dbPath);
  
  console.log('=== TESTING LOGIN FOR ADMIN ===');
  
  // Get admin user
  const admin = db.prepare("SELECT * FROM users WHERE username = ?").get('admin');
  
  if (!admin) {
    console.log('❌ Admin user not found!');
    db.close();
    return;
  }
  
  console.log('✅ Admin user found:');
  console.log('ID:', admin.id);
  console.log('Username:', admin.username);
  console.log('Email:', admin.email);
  console.log('Is Admin:', admin.is_admin);
  console.log('Password hash:', admin.password);
  
  // Test password
  const testPassword = 'admin';
  console.log('\n=== TESTING PASSWORD ===');
  console.log('Testing password:', testPassword);
  
  const isMatch = bcrypt.compareSync(testPassword, admin.password);
  console.log('Password match:', isMatch ? '✅ SUCCESS' : '❌ FAILED');
  
  if (!isMatch) {
    console.log('\n=== FIXING PASSWORD ===');
    const newHash = bcrypt.hashSync(testPassword, 12);
    console.log('New hash:', newHash);
    
    const result = db.prepare("UPDATE users SET password = ? WHERE username = 'admin'").run(newHash);
    console.log('Update result:', result.changes > 0 ? '✅ Updated' : '❌ Failed');
    
    // Test again
    const testAgain = bcrypt.compareSync(testPassword, newHash);
    console.log('New password test:', testAgain ? '✅ SUCCESS' : '❌ STILL FAILED');
  }
  
  // Check if user is blocked
  console.log('\n=== USER STATUS ===');
  console.log('Is blocked:', admin.is_blocked || false);
  console.log('Has subscription:', admin.has_subscription || false);
  console.log('Is online:', admin.is_online || false);
  
  db.close();
} catch (error) {
  console.error('❌ Error:', error.message);
}