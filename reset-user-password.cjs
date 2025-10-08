// Reset password for wiktoriatop2ajew@gmail.com and make admin
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

try {
  const db = new Database(dbPath);
  
  const targetEmail = 'wiktoriatop2ajew@gmail.com';
  const newPassword = 'admin123'; // New password
  
  console.log(`🔧 Updating user: ${targetEmail}`);
  console.log('================================');
  
  // Find the user first
  const user = db.prepare(`
    SELECT id, username, email, is_admin, is_blocked
    FROM users 
    WHERE email = ?
  `).get(targetEmail);
  
  if (user) {
    console.log(`Found user: ${user.username}`);
    
    // Hash new password
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);
    
    // Update user: reset password, make admin, unblock
    const updateResult = db.prepare(`
      UPDATE users 
      SET password = ?, 
          is_admin = 1, 
          is_blocked = 0,
          has_subscription = 1
      WHERE email = ?
    `).run(hashedPassword, targetEmail);
    
    if (updateResult.changes > 0) {
      console.log('✅ User updated successfully!');
      console.log('');
      console.log('🎯 New login credentials:');
      console.log('=========================');
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${targetEmail}`);
      console.log(`Password: ${newPassword}`);
      console.log('Status: 👑 ADMIN');
      console.log('Blocked: ✅ NO');
      console.log('Subscription: ✅ YES');
      
      console.log('');
      console.log('🔑 You can now login with:');
      console.log(`Username: ${user.username}`);
      console.log(`Password: ${newPassword}`);
      console.log('OR');
      console.log(`Email: ${targetEmail}`);
      console.log(`Password: ${newPassword}`);
      
    } else {
      console.log('❌ Failed to update user');
    }
    
  } else {
    console.log(`❌ User not found with email: ${targetEmail}`);
    
    // Show available users with gmail
    console.log('\n📧 Available Gmail users:');
    const gmailUsers = db.prepare(`
      SELECT username, email, is_admin
      FROM users 
      WHERE email LIKE '%gmail.com'
      ORDER BY created_at ASC
    `).all();
    
    gmailUsers.forEach((u, i) => {
      console.log(`${i + 1}. ${u.username} (${u.email}) ${u.is_admin ? '👑' : '👤'}`);
    });
  }
  
  db.close();
} catch (error) {
  console.error('❌ Error:', error.message);
}