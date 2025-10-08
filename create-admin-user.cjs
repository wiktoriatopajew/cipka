// Create new admin user with wiktoriatopajew@gmail.com
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

try {
  const db = new Database(dbPath);
  
  const newEmail = 'wiktoriatopajew@gmail.com';
  const newUsername = 'wiktoriatopajew';
  const newPassword = 'admin123';
  
  console.log(`🆕 Creating new admin user: ${newEmail}`);
  console.log('==========================================');
  
  // Check if user already exists
  const existingUser = db.prepare(`
    SELECT username, email FROM users WHERE email = ? OR username = ?
  `).get(newEmail, newUsername);
  
  if (existingUser) {
    console.log(`❌ User already exists:`);
    console.log(`   Username: ${existingUser.username}`);
    console.log(`   Email: ${existingUser.email}`);
    return;
  }
  
  // Create new user
  const userId = crypto.randomUUID();
  const saltRounds = 10;
  const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);
  
  const insertResult = db.prepare(`
    INSERT INTO users (
      id, username, password, email, 
      is_admin, has_subscription, is_online, 
      is_blocked, last_seen, created_at
    ) VALUES (?, ?, ?, ?, 1, 1, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(userId, newUsername, hashedPassword, newEmail);
  
  if (insertResult.changes > 0) {
    console.log('✅ New admin user created successfully!');
    console.log('');
    console.log('🎯 Login credentials:');
    console.log('====================');
    console.log(`Username: ${newUsername}`);
    console.log(`Email: ${newEmail}`);
    console.log(`Password: ${newPassword}`);
    console.log('Status: 👑 ADMIN');
    console.log('Subscription: ✅ YES');
    console.log('Blocked: ✅ NO');
    
    console.log('');
    console.log('🌐 Login URLs:');
    console.log('==============');
    console.log('Local: http://localhost:5000/admin');
    console.log('Render: https://cipka.onrender.com/admin');
    
    console.log('');
    console.log('📊 All admin users now:');
    const admins = db.prepare(`
      SELECT username, email FROM users WHERE is_admin = 1 ORDER BY created_at
    `).all();
    
    admins.forEach((admin, i) => {
      console.log(`${i + 1}. ${admin.username} (${admin.email || 'NO EMAIL'})`);
    });
    
  } else {
    console.log('❌ Failed to create user');
  }
  
  db.close();
} catch (error) {
  console.error('❌ Error:', error.message);
}