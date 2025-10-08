// Check all users in database
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

try {
  const db = new Database(dbPath);
  
  console.log('👥 All Users in Database');
  console.log('========================');
  
  const users = db.prepare(`
    SELECT id, username, email, is_admin, has_subscription, is_blocked, is_online, created_at
    FROM users 
    ORDER BY is_admin DESC, created_at ASC
  `).all();
  
  console.log(`Total users: ${users.length}\n`);
  
  users.forEach((user, index) => {
    const status = [];
    if (user.is_admin) status.push('👑 ADMIN');
    if (user.has_subscription) status.push('💎 VIP');
    if (user.is_blocked) status.push('🚫 BLOCKED');
    if (user.is_online) status.push('🟢 ONLINE');
    
    console.log(`${index + 1}. ${user.username}`);
    console.log(`   Email: ${user.email || 'NO EMAIL'}`);
    console.log(`   Status: ${status.length > 0 ? status.join(' ') : '👤 Regular user'}`);
    console.log(`   Created: ${user.created_at}`);
    console.log('');
  });
  
  // Summary
  const stats = {
    total: users.length,
    admins: users.filter(u => u.is_admin).length,
    vip: users.filter(u => u.has_subscription).length,
    blocked: users.filter(u => u.is_blocked).length,
    online: users.filter(u => u.is_online).length,
  };
  
  console.log('📊 User Statistics:');
  console.log('===================');
  console.log(`Total Users: ${stats.total}`);
  console.log(`Admins: ${stats.admins}`);
  console.log(`VIP Users: ${stats.vip}`);
  console.log(`Blocked: ${stats.blocked}`);
  console.log(`Online: ${stats.online}`);
  
  // Login info for key users
  console.log('\n🔑 Key Login Credentials:');
  console.log('=========================');
  
  const keyUsers = users.filter(u => u.is_admin || u.username === 'test');
  keyUsers.forEach(user => {
    console.log(`\n${user.is_admin ? '👑 ADMIN' : '🧪 TEST'}: ${user.username}`);
    console.log(`   Email: ${user.email || 'NO EMAIL'}`);
    
    // For known users, show likely passwords
    if (user.username === 'admin') {
      console.log(`   Password: admin (confirmed)`);
    } else if (user.username === 'test') {
      console.log(`   Password: 123456 (likely)`);
    } else {
      console.log(`   Password: Unknown - check logs`);
    }
  });
  
  db.close();
} catch (error) {
  console.error('❌ Error:', error.message);
}