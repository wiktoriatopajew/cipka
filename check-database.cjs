// Quick database checker
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check tables
  console.log('\n=== TABLES ===');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables found:', tables.map(t => t.name));
  
  // Check users table specifically
  if (tables.find(t => t.name === 'users')) {
    console.log('\n=== USERS TABLE ===');
    const users = db.prepare("SELECT id, username, email, is_admin FROM users").all();
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Admin: ${user.is_admin}`);
    });
    
    // Check for admin user specifically
    const adminUsers = db.prepare("SELECT * FROM users WHERE is_admin = 1").all();
    console.log('\nAdmin users:', adminUsers.length);
    adminUsers.forEach(admin => {
      console.log(`Admin: ${admin.username} (${admin.email})`);
    });
  } else {
    console.log('❌ Users table not found!');
  }
  
  db.close();
} catch (error) {
  console.error('❌ Database error:', error.message);
}