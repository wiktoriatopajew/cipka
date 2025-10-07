// Reset admin password to "admin"
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

try {
  const db = new Database(dbPath);
  
  // Hash new password
  const newPassword = 'admin';
  const hashedPassword = bcrypt.hashSync(newPassword, 12);
  
  // Update admin password
  const result = db.prepare("UPDATE users SET password = ? WHERE username = 'admin'").run(hashedPassword);
  
  if (result.changes > 0) {
    console.log('✅ Admin password updated successfully!');
    console.log('New credentials:');
    console.log('Username: admin');
    console.log('Password: admin');
    
    // Verify the update
    const admin = db.prepare("SELECT username FROM users WHERE username = 'admin'").get();
    const isMatch = bcrypt.compareSync(newPassword, hashedPassword);
    console.log('Verification:', isMatch ? '✅ Password works' : '❌ Password failed');
  } else {
    console.log('❌ No admin user found to update');
  }
  
  db.close();
} catch (error) {
  console.error('❌ Error:', error.message);
}