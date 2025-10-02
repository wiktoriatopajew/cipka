const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const db = new Database(path.join(__dirname, 'database.sqlite'));

console.log('Creating admin user...');

// Generate secure admin credentials
const adminUsername = 'admin';
const adminPassword = 'AutoMentor2024!'; // Change this!
const adminEmail = 'admin@automentor.com';

// Hash password
const saltRounds = 10;
const hashedPassword = bcrypt.hashSync(adminPassword, saltRounds);

// Generate unique ID
const adminId = crypto.randomUUID();

try {
  // Check if admin already exists
  const existingAdmin = db.prepare('SELECT * FROM users WHERE username = ? OR is_admin = 1').get(adminUsername);
  
  if (existingAdmin) {
    console.log('Admin user already exists. Updating password...');
    
    db.prepare(`
      UPDATE users 
      SET password = ?, email = ?, is_admin = 1, has_subscription = 1, created_at = CURRENT_TIMESTAMP 
      WHERE username = ?
    `).run(hashedPassword, adminEmail, adminUsername);
    
    console.log('Admin user updated successfully!');
  } else {
    console.log('Creating new admin user...');
    
    db.prepare(`
      INSERT INTO users (id, username, password, email, is_admin, has_subscription, is_online, last_seen, created_at, is_blocked, referral_code, referred_by) 
      VALUES (?, ?, ?, ?, 1, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, NULL, NULL)
    `).run(adminId, adminUsername, hashedPassword, adminEmail);
    
    console.log('Admin user created successfully!');
  }
  
  console.log('\n=== ADMIN CREDENTIALS ===');
  console.log(`Username: ${adminUsername}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`Email: ${adminEmail}`);
  console.log('========================\n');
  console.log('⚠️  IMPORTANT: Change the default password after first login!');
  console.log('🔐 Login at: /admin');
  
} catch (error) {
  console.error('Error creating admin user:', error);
} finally {
  db.close();
}