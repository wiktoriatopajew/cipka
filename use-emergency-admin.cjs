// Use emergency admin promotion endpoint
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

async function useEmergencyAdmin() {
  console.log('🚨 Using Emergency Admin Promotion');
  console.log('==================================');
  
  try {
    // Wait a moment for deployment
    console.log('⏳ Waiting for Render deployment to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('1️⃣ Testing health endpoint...');
    const healthResult = await makeRequest('GET', '/api/health');
    console.log(`Health: ${healthResult.status} - ${JSON.stringify(healthResult.data)}`);
    
    if (healthResult.status !== 200) {
      console.log('❌ Server not ready, waiting more...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    // Try emergency promotion for wiktoriatopajew
    console.log('2️⃣ Promoting wiktoriatopajew to admin...');
    
    const promoteResult = await makeRequest('POST', '/api/emergency/promote-admin', {
      email: 'wiktoriatopajew@gmail.com',
      secretKey: 'EMERGENCY_ADMIN_2025_RENDER'
    });
    
    console.log(`Promotion Status: ${promoteResult.status}`);
    console.log(`Response: ${JSON.stringify(promoteResult.data, null, 2)}`);
    
    if (promoteResult.status === 200) {
      console.log('🎉 SUCCESS! User promoted to admin!');
      
      // Test admin login
      console.log('3️⃣ Testing admin login...');
      
      const loginResult = await makeRequest('POST', '/api/admin/login', {
        email: 'wiktoriatopajew@gmail.com',
        password: 'admin123'
      });
      
      console.log(`Login Status: ${loginResult.status}`);
      if (loginResult.status === 200) {
        console.log('✅ ADMIN LOGIN WORKS!');
        console.log('');
        console.log('🎯 Your admin credentials:');
        console.log('=========================');
        console.log('Email: wiktoriatopajew@gmail.com');
        console.log('Password: admin123');
        console.log('Admin Panel: https://cipka.onrender.com/admin/login');
        console.log('');
        console.log('🎉 You can now access the admin panel!');
      } else {
        console.log(`❌ Admin login failed: ${JSON.stringify(loginResult.data)}`);
      }
    } else {
      console.log('❌ Emergency promotion failed');
      if (promoteResult.status === 404) {
        console.log('User not found - trying to create first...');
        
        // Create user if not exists
        const createResult = await makeRequest('POST', '/api/users/register', {
          username: 'wiktoriatopajew',
          email: 'wiktoriatopajew@gmail.com',
          password: 'admin123'
        });
        
        console.log(`User creation: ${createResult.status}`);
        if (createResult.status === 200) {
          console.log('User created, retrying promotion...');
          
          // Retry promotion
          const retryResult = await makeRequest('POST', '/api/emergency/promote-admin', {
            email: 'wiktoriatopajew@gmail.com',
            secretKey: 'EMERGENCY_ADMIN_2025_RENDER'
          });
          
          console.log(`Retry Status: ${retryResult.status}`);
          console.log(`Response: ${JSON.stringify(retryResult.data, null, 2)}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

useEmergencyAdmin();