// Check user with specific email
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

try {
  const db = new Database(dbPath);
  
  console.log('🔍 Searching for user: wiktoriatopajew@gmail.com');
  console.log('================================================');
  
  // Find user by email
  const user = db.prepare(`
    SELECT id, username, email, is_admin, has_subscription, is_blocked, is_online, created_at
    FROM users 
    WHERE email = ?
  `).get('wiktoriatopajew@gmail.com');
  
  if (user) {
    console.log('\n👤 User found:');
    console.log('==============');
    console.log(`ID: ${user.id}`);
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Is Admin: ${user.is_admin ? '✅ YES' : '❌ NO'}`);
    console.log(`Has Subscription: ${user.has_subscription ? '✅ YES' : '❌ NO'}`);
    console.log(`Is Blocked: ${user.is_blocked ? '🚫 YES' : '✅ NO'}`);
    console.log(`Is Online: ${user.is_online ? '🟢 YES' : '⚪ NO'}`);
    console.log(`Created: ${user.created_at}`);
    
    if (user.is_admin) {
      console.log('\n👑 This user IS an admin!');
      console.log('========================');
      
      // Check if we can update password
      console.log('\n🔧 Available actions:');
      console.log('1. Reset password to known value');
      console.log('2. Make admin if not already');
      console.log('3. Unblock if blocked');
      
    } else {
      console.log('\n⚠️  This user is NOT an admin');
      console.log('=============================');
      console.log('Would you like to:');
      console.log('1. Make this user an admin?');
      console.log('2. Reset their password?');
    }
    
  } else {
    console.log('\n❌ User not found with email: wiktoriatopajew@gmail.com');
    
    // Search for similar emails
    console.log('\n🔍 Searching for similar emails...');
    const similarUsers = db.prepare(`
      SELECT username, email, is_admin
      FROM users 
      WHERE email LIKE '%wiktoriatopajew%' OR email LIKE '%@gmail.com'
      ORDER BY is_admin DESC, created_at ASC
    `).all();
    
    if (similarUsers.length > 0) {
      console.log('\n📧 Found similar emails:');
      console.log('========================');
      similarUsers.forEach((u, i) => {
        console.log(`${i + 1}. ${u.username} (${u.email}) ${u.is_admin ? '👑' : '👤'}`);
      });
    }
    
    // Show all admin users
    console.log('\n👑 Current admin users:');
    console.log('======================');
    const admins = db.prepare(`
      SELECT username, email
      FROM users 
      WHERE is_admin = 1
      ORDER BY created_at ASC
    `).all();
    
    admins.forEach((admin, i) => {
      console.log(`${i + 1}. ${admin.username} (${admin.email || 'NO EMAIL'})`);
    });
  }
  
  db.close();
} catch (error) {
  console.error('❌ Error:', error.message);
}