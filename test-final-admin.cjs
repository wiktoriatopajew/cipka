// Check if admin login works now
const https = require('https');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'cipka.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ 
            status: res.statusCode, 
            data: parsed
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAdminLogin() {
  console.log('🔍 Testing Admin Access');
  console.log('======================');
  
  try {
    // Test regular user login
    console.log('1️⃣ Testing wiktoriatopajew user login...');
    
    const userResult = await makeRequest('POST', '/api/users/login', {
      email: 'wiktoriatopajew@gmail.com',
      password: 'admin123'
    });
    
    console.log(`User login: ${userResult.status}`);
    if (userResult.status === 200) {
      console.log('✅ User exists and can login');
      console.log(`User data: ${JSON.stringify(userResult.data, null, 2)}`);
    } else {
      console.log(`❌ User login failed: ${JSON.stringify(userResult.data)}`);
    }
    
    // Test admin login
    console.log('2️⃣ Testing admin login...');
    
    const adminResult = await makeRequest('POST', '/api/admin/login', {
      email: 'wiktoriatopajew@gmail.com',
      password: 'admin123'
    });
    
    console.log(`Admin login: ${adminResult.status}`);
    if (adminResult.status === 200) {
      console.log('🎉 ADMIN LOGIN WORKS!');
      console.log(`Admin data: ${JSON.stringify(adminResult.data, null, 2)}`);
      console.log('');
      console.log('🎯 Your admin credentials:');
      console.log('=========================');
      console.log('Email: wiktoriatopajew@gmail.com');
      console.log('Password: admin123');
      console.log('Admin Panel: https://cipka.onrender.com/admin/login');
    } else {
      console.log(`❌ Admin login failed: ${JSON.stringify(adminResult.data)}`);
      console.log('User exists but is not admin yet');
      
      // Wait and try emergency endpoint
      console.log('3️⃣ Waiting and trying emergency promotion...');
      await new Promise(resolve => setTimeout(resolve, 65000)); // Wait 65 seconds for rate limit
      
      const emergencyResult = await makeRequest('POST', '/api/emergency/promote-admin', {
        email: 'wiktoriatopajew@gmail.com',
        secretKey: 'EMERGENCY_ADMIN_2025_RENDER'
      });
      
      console.log(`Emergency promotion: ${emergencyResult.status}`);
      console.log(`Response: ${JSON.stringify(emergencyResult.data, null, 2)}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminLogin();