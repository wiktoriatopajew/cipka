// Direct admin promotion via SQL endpoint if available
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

async function promoteUserDirectly() {
  console.log('🔧 Direct user promotion attempt');
  console.log('=================================');
  
  try {
    // Try to use update endpoint without session (public endpoint check)
    console.log('1️⃣ Checking available endpoints...');
    
    // Check if there's a health endpoint to confirm connection
    const healthResult = await makeRequest('GET', '/api/health');
    console.log(`Health check: ${healthResult.status} - ${JSON.stringify(healthResult.data)}`);
    
    // Check what endpoints are available
    console.log('2️⃣ Attempting direct user promotion...');
    
    // Try direct promotion (this will likely fail due to authentication)
    const promoteResult = await makeRequest('PATCH', `/api/admin/users/266a40ff-e7b0-41be-aaf6-e06e7c7cec96`, {
      isAdmin: true,
      hasSubscription: true
    });
    
    console.log(`Promotion attempt: ${promoteResult.status}`);
    console.log('Response:', JSON.stringify(promoteResult.data, null, 2));
    
    if (promoteResult.status === 200) {
      console.log('🎉 SUCCESS! User promoted to admin!');
    } else if (promoteResult.status === 401 || promoteResult.status === 403) {
      console.log('🔐 Authentication required - use web interface');
      console.log('');
      console.log('📋 Manual Steps:');
      console.log('================');
      console.log('1. Open: https://cipka.onrender.com/admin/login');
      console.log('2. Login: admin@wp.pl / admin');
      console.log('3. Go to User Management');
      console.log('4. Find user: wiktoriatopajew');
      console.log('5. Set as Admin + VIP');
      console.log('');
      console.log('🎯 Target user details:');
      console.log('   ID: 266a40ff-e7b0-41be-aaf6-e06e7c7cec96');
      console.log('   Username: wiktoriatopajew');
      console.log('   Email: wiktoriatopajew@gmail.com');
    } else {
      console.log('❌ Unexpected response');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

promoteUserDirectly();