// Debug admin login to see response structure
const https = require('https');

function makeAuthenticatedRequest(method, path, data = null) {
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
      
      // Capture all headers including Set-Cookie
      console.log('📋 Response Headers:');
      console.log(JSON.stringify(res.headers, null, 2));
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ 
            status: res.statusCode, 
            data: parsed, 
            headers: res.headers
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: responseData, 
            headers: res.headers
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

async function debugAdminLogin() {
  console.log('🔍 Debugging admin login');
  console.log('=========================');
  
  try {
    const loginResult = await makeAuthenticatedRequest('POST', '/api/admin/login', {
      email: 'admin@wp.pl',
      password: 'admin'
    });
    
    console.log('Status:', loginResult.status);
    console.log('Data:', JSON.stringify(loginResult.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugAdminLogin();