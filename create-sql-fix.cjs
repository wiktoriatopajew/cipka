// Create SQL script to fix admin user
const fs = require('fs');

const sqlScript = `
-- Fix admin users on Render PostgreSQL
-- Run this on your Render database

-- Option 1: Make admin@wp.pl an admin
UPDATE users 
SET "isAdmin" = true, "hasSubscription" = true 
WHERE email = 'admin@wp.pl';

-- Option 2: Make wiktoriatopajew@gmail.com an admin  
UPDATE users 
SET "isAdmin" = true, "hasSubscription" = true 
WHERE email = 'wiktoriatopajew@gmail.com';

-- Check results
SELECT id, username, email, "isAdmin", "hasSubscription", "createdAt"
FROM users 
WHERE "isAdmin" = true;

-- Show all users for verification
SELECT username, email, "isAdmin", "hasSubscription" 
FROM users 
ORDER BY "createdAt" DESC;
`;

console.log('🔧 SQL Script to Fix Admin Users');
console.log('=================================');
console.log(sqlScript);

// Save to file
fs.writeFileSync('fix-admin-render.sql', sqlScript);
console.log('✅ SQL script saved to: fix-admin-render.sql');

console.log('');
console.log('📋 How to apply this fix:');
console.log('========================');
console.log('1. Go to Render dashboard: https://dashboard.render.com');
console.log('2. Find your PostgreSQL database');
console.log('3. Connect via psql or web console');
console.log('4. Run the SQL commands above');
console.log('');
console.log('OR');
console.log('');
console.log('🔧 Alternative - create admin endpoint:');
console.log('We can add a special endpoint to set admin flag');

// Also create a simple test to verify the fix worked
const testScript = `
// Test admin login after SQL fix
const https = require('https');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'cipka.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => reject(error));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testAdminLogin() {
  console.log('🔍 Testing Admin Login After SQL Fix');
  console.log('====================================');
  
  const tests = [
    { email: 'admin@wp.pl', password: 'admin123', name: 'Default Admin' },
    { email: 'wiktoriatopajew@gmail.com', password: 'admin123', name: 'Your Admin' }
  ];
  
  for (const test of tests) {
    console.log(\`Testing: \${test.name} (\${test.email})\`);
    
    const result = await makeRequest('POST', '/api/admin/login', {
      email: test.email,
      password: test.password
    });
    
    console.log(\`Status: \${result.status}\`);
    if (result.status === 200) {
      console.log('✅ SUCCESS! Admin login works');
      console.log(\`Admin data: \${JSON.stringify(result.data, null, 2)}\`);
      break;
    } else {
      console.log(\`❌ Failed: \${JSON.stringify(result.data)}\`);
    }
  }
}

testAdminLogin();
`;

fs.writeFileSync('test-admin-after-fix.cjs', testScript);
console.log('✅ Test script saved to: test-admin-after-fix.cjs');

console.log('');
console.log('🎯 CURRENT STATUS:');
console.log('==================');
console.log('✅ Render app is running');
console.log('✅ Database is connected');  
console.log('✅ User registration works');
console.log('✅ Users exist in database');
console.log('❌ Admin flag not set in PostgreSQL');
console.log('');
console.log('🔧 NEXT STEP: Run SQL fix on Render PostgreSQL');