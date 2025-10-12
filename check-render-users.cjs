#!/usr/bin/env node

// Check Render production database for automatic user creation
const https = require('https');

async function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'chatwithmechanic.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Admin-Check-Script'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.end();
  });
}

async function checkRenderUsers() {
  console.log('🚀 Checking Render Production for Auto User Creation');
  console.log('===================================================\n');
  
  try {
    // Test basic connectivity
    console.log('📡 Testing Render server connectivity...');
    const healthCheck = await makeRequest('/api/health');
    console.log(`✅ Server status: ${healthCheck.status}`);
    
    if (healthCheck.status === 200) {
      console.log('✅ Render server is online and responding\n');
    } else {
      console.log('⚠️ Server responding but may have issues\n');
    }

    // Try to get debug info (if available)
    console.log('🔍 Checking for debug endpoints...');
    
    const endpoints = [
      '/api/debug/users',
      '/api/admin/dashboard', 
      '/api/debug/database',
      '/api/stats'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying: ${endpoint}`);
        const result = await makeRequest(endpoint);
        
        if (result.status === 200 && result.data) {
          console.log(`✅ ${endpoint}: Available`);
          
          // Analyze data if it's user-related
          if (endpoint.includes('users') || endpoint.includes('dashboard')) {
            console.log('📊 Data preview:', JSON.stringify(result.data).substring(0, 200) + '...');
          }
        } else {
          console.log(`❌ ${endpoint}: ${result.status} - ${typeof result.data === 'string' ? result.data.substring(0, 100) : 'No data'}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: Error - ${error.message}`);
      }
    }

    console.log('\n📈 ANALYSIS RECOMMENDATIONS:');
    console.log('=============================');
    console.log('Since direct database access is limited, here are ways to check:');
    console.log('');
    console.log('1. 🖥️  CHECK RENDER LOGS:');
    console.log('   - Go to: https://dashboard.render.com');
    console.log('   - Select your service');
    console.log('   - Click "Logs" tab');
    console.log('   - Look for patterns like:');
    console.log('     * "User created:" messages');
    console.log('     * "Login notification sent" repeatedly');
    console.log('     * "POST /api/auth/register" requests');
    console.log('');
    
    console.log('2. 📧 CHECK YOUR EMAIL:');
    console.log('   - Look at wiktoriatopajew@gmail.com');
    console.log('   - Count "New User Login" notifications today');
    console.log('   - Check timestamps for patterns');
    console.log('   - Suspicious: Many notifications in short time');
    console.log('');
    
    console.log('3. 🔐 ADMIN PANEL CHECK:');
    console.log('   - Visit: https://chatwithmechanic.com/admin');
    console.log('   - Login with admin credentials');  
    console.log('   - Check user list for recent registrations');
    console.log('   - Look for suspicious usernames/patterns');
    console.log('');
    
    console.log('4. 🤖 BOT DETECTION SIGNS:');
    console.log('   - Usernames like: user123, test456, guest789');
    console.log('   - Emails like: test@test.com, user@example.com'); 
    console.log('   - All created within minutes of each other');
    console.log('   - No actual chat activity after registration');
    
    console.log('\n⚡ QUICK MANUAL CHECK:');
    console.log('======================');
    console.log('Open these in browser:');
    console.log('1. https://chatwithmechanic.com/admin (login & check users)');
    console.log('2. https://dashboard.render.com (check logs for "User created")');
    console.log('3. Check your Gmail for spam user notifications');

  } catch (error) {
    console.error('❌ Check failed:', error.message);
    
    console.log('\n🛠️ FALLBACK ACTIONS:');
    console.log('=====================');
    console.log('1. Manually visit: https://chatwithmechanic.com/admin');
    console.log('2. Check Render dashboard logs');
    console.log('3. Monitor your email notifications');
    console.log('4. If you see suspicious activity, we can add CAPTCHA');
  }
}

checkRenderUsers();