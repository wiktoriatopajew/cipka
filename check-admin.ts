import Database from 'better-sqlite3';

const db = new Database('./database.sqlite');

// Check for admin user
const adminUser = db.prepare("SELECT * FROM users WHERE is_admin = 1").get();

if (adminUser) {
  console.log('✅ Admin user exists:');
  console.log('- Email:', adminUser.email);
  console.log('- Username:', adminUser.username);
  console.log('- ID:', adminUser.id);
} else {
  console.log('❌ No admin user found in database');
  
  // Show all users
  const allUsers = db.prepare("SELECT * FROM users").all();
  console.log('All users in database:', allUsers.length);
  allUsers.forEach(user => {
    console.log('- User:', user.username, 'Email:', user.email, 'Admin:', user.is_admin);
  });
}

db.close();
