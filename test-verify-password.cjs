// Test verifyPassword function
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

// Mock storage.verifyPassword function
async function verifyPassword(emailOrUsername, password) {
  try {
    const db = new Database(dbPath);
    
    console.log('Searching for user with email/username:', emailOrUsername);
    
    // Try to find user by email or username
    const user = db.prepare(`
      SELECT * FROM users 
      WHERE email = ? OR username = ?
    `).get(emailOrUsername, emailOrUsername);
    
    if (!user) {
      console.log('❌ User not found');
      db.close();
      return null;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin
    });
    
    // Verify password
    const isValid = bcrypt.compareSync(password, user.password);
    console.log('Password valid:', isValid ? '✅ YES' : '❌ NO');
    
    db.close();
    
    if (!isValid) {
      return null;
    }
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.is_admin === 1
    };
  } catch (error) {
    console.error('❌ verifyPassword error:', error.message);
    return null;
  }
}

// Test login scenarios
async function testLogin() {
  console.log('=== TESTING ADMIN LOGIN ===');
  
  console.log('\n1. Testing with email: admin@wp.pl');
  const result1 = await verifyPassword('admin@wp.pl', 'admin');
  console.log('Result:', result1);
  
  console.log('\n2. Testing with username: admin');
  const result2 = await verifyPassword('admin', 'admin');
  console.log('Result:', result2);
  
  console.log('\n3. Testing with wrong password');
  const result3 = await verifyPassword('admin@wp.pl', 'wrongpassword');
  console.log('Result:', result3);
}

testLogin();