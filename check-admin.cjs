// Check all admin details
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

try {
  const db = new Database(dbPath);
  
  // Get all admin users
  const admins = db.prepare("SELECT * FROM users WHERE is_admin = 1").all();
  
  console.log('🔍 All admin users:');
  console.log('==================');
  
  admins.forEach((admin, index) => {
    console.log(`\n👑 Admin ${index + 1}:`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email || 'NO EMAIL'}`);
    console.log(`   Password hash: ${admin.password.substring(0, 20)}...`);
    console.log(`   Has subscription: ${admin.has_subscription ? '✅' : '❌'}`);
    console.log(`   Is blocked: ${admin.is_blocked ? '🚫' : '✅'}`);
    console.log(`   Created: ${admin.created_at}`);
  });
  
  // Test login combinations
  console.log('\n🧪 Login Test Combinations:');
  console.log('============================');
  
  const testCombinations = [
    { username: 'admin', password: 'admin' },
    { username: 'admin', password: 'AutoMentor2024!' },
    { username: 'admin', password: 'admin123' },
    { email: 'admin@automentor.com', password: 'admin' },
    { email: 'admin@automentor.com', password: 'AutoMentor2024!' },
    { email: 'admin@wp.pl', password: 'admin' },
  ];
  
  testCombinations.forEach(combo => {
    const field = combo.username ? 'username' : 'email';
    const value = combo.username || combo.email;
    console.log(`\n${field}: "${value}" + password: "${combo.password}"`);
    
    const user = db.prepare(`SELECT * FROM users WHERE ${field} = ? AND is_admin = 1`).get(value);
    if (user) {
      console.log(`   User found: ✅`);
      const bcrypt = require('bcryptjs');
      const isMatch = bcrypt.compareSync(combo.password, user.password);
      console.log(`   Password match: ${isMatch ? '✅ SUCCESS' : '❌ FAIL'}`);
    } else {
      console.log(`   User found: ❌`);
    }
  });
  
  db.close();
} catch (error) {
  console.error('❌ Error:', error.message);
}