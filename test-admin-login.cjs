const https = require('https');

// Test different admin login combinations
async function testAdminLogin() {
  const testCredentials = [
    { email: 'admin@wp.pl', password: 'admin' },
    { email: 'admin@yourdomain.com', password: 'your-admin-password' },
    { email: 'admin', password: 'admin' },
    { email: 'admin@example.com', password: 'admin123' }
  ];

  for (const creds of testCredentials) {
    console.log(`\n🧪 Testing: ${creds.email} / ${creds.password}`);
    
    try {
      const response = await makeRequest('POST', '/api/admin/login', creds);
      
      console.log(`Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('✅ SUCCESS! These credentials work');
        const data = JSON.parse(response.data);
        console.log('Response:', data);
        break;
      } else if (response.status === 401) {
        console.log('❌ Unauthorized - wrong credentials');
      } else {
        console.log('❌ Other error:', response.data);
      }
    } catch (error) {
      console.log('❌ Request error:', error.message);
    }
  }
}

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'cipka.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test Script'
      }
    };
    
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ 
          status: res.statusCode, 
          data: data,
          headers: res.headers
        });
      });
    });
    
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

console.log('🔍 Testing admin login credentials...');
testAdminLogin();