
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
    console.log(`Testing: ${test.name} (${test.email})`);
    
    const result = await makeRequest('POST', '/api/admin/login', {
      email: test.email,
      password: test.password
    });
    
    console.log(`Status: ${result.status}`);
    if (result.status === 200) {
      console.log('✅ SUCCESS! Admin login works');
      console.log(`Admin data: ${JSON.stringify(result.data, null, 2)}`);
      break;
    } else {
      console.log(`❌ Failed: ${JSON.stringify(result.data)}`);
    }
  }
}

testAdminLogin();
