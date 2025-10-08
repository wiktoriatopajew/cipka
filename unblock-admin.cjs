// Unblock admin user
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

try {
  const db = new Database(dbPath);
  
  console.log('🔧 Unblocking admin user...');
  
  // Unblock admin
  const result = db.prepare(`
    UPDATE users 
    SET is_blocked = 0 
    WHERE username = 'admin' AND is_admin = 1
  `).run();
  
  if (result.changes > 0) {
    console.log('✅ Admin user unblocked successfully!');
    
    // Verify
    const admin = db.prepare("SELECT username, email, is_admin, is_blocked, has_subscription FROM users WHERE username = 'admin'").get();
    console.log('\n👑 Updated admin details:');
    console.log('   Username:', admin.username);
    console.log('   Email:', admin.email);
    console.log('   Is Admin:', admin.is_admin ? '✅' : '❌');
    console.log('   Is Blocked:', admin.is_blocked ? '🚫 YES' : '✅ NO');
    console.log('   Has Subscription:', admin.has_subscription ? '✅' : '❌');
    
    console.log('\n🎯 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin');
    console.log('   Email: admin@wp.pl');
    
  } else {
    console.log('❌ No admin user found to unblock');
  }
  
  db.close();
} catch (error) {
  console.error('❌ Error:', error.message);
}