const https = require('https');

// Test add-days endpoint
async function testAddDays() {
  try {
    console.log('🧪 Testing add-days endpoint...');
    
    // First login as admin
    const loginResponse = await makeRequest('POST', '/api/admin/login', {
      email: 'admin@wp.pl', // Adjust if different
      password: 'admin'      // Adjust if different  
    });
    
    console.log('Login response:', loginResponse.status);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Admin login failed');
      return;
    }
    
    // Get session cookie
    const cookies = loginResponse.headers['set-cookie'] || [];
    const sessionCookie = cookies.find(cookie => cookie.startsWith('connect.sid='));
    
    if (!sessionCookie) {
      console.log('❌ No session cookie received');
      return;
    }
    
    console.log('✅ Admin logged in successfully');
    
    // Get users list first
    const usersResponse = await makeAuthenticatedRequest('GET', '/api/admin/users', null, sessionCookie);
    
    if (usersResponse.status !== 200) {
      console.log('❌ Failed to get users list');
      return;
    }
    
    const users = JSON.parse(usersResponse.data);
    console.log(`📋 Found ${users.length} users`);
    
    if (users.length === 0) {
      console.log('❌ No users to test with');
      return;
    }
    
    // Use first non-admin user
    const testUser = users.find(u => !u.isAdmin) || users[0];
    console.log(`🎯 Testing with user: ${testUser.username} (${testUser.id})`);
    
    // Test add days
    const addDaysResponse = await makeAuthenticatedRequest('POST', `/api/admin/users/${testUser.id}/add-days`, {
      days: 5
    }, sessionCookie);
    
    console.log('Add days response status:', addDaysResponse.status);
    console.log('Add days response data:', addDaysResponse.data);
    
    if (addDaysResponse.status === 200) {
      console.log('✅ Add days successful!');
    } else {
      console.log('❌ Add days failed');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
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

async function makeAuthenticatedRequest(method, path, data = null, cookie) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'cipka.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie,
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

// Run test
testAddDays();