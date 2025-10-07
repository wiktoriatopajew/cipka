// Update admin email to admin@wp.pl
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

try {
  const db = new Database(dbPath);
  
  // Update admin email
  const result = db.prepare("UPDATE users SET email = ? WHERE username = 'admin'").run('admin@wp.pl');
  
  if (result.changes > 0) {
    console.log('✅ Admin email updated successfully!');
    
    // Show current admin details
    const admin = db.prepare("SELECT username, email, is_admin FROM users WHERE username = 'admin'").get();
    console.log('\nCurrent admin details:');
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('Is Admin:', admin.is_admin);
    console.log('\nLogin credentials:');
    console.log('Username: admin');
    console.log('Password: admin');
    console.log('Email: admin@wp.pl');
  } else {
    console.log('❌ No admin user found to update');
  }
  
  db.close();
} catch (error) {
  console.error('❌ Error:', error.message);
}