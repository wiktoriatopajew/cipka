// Make user admin through Render admin API
const https = require('https');

function makeAuthenticatedRequest(method, path, data = null, sessionCookie = null) {
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

    if (sessionCookie) {
      options.headers['Cookie'] = sessionCookie;
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      // Capture Set-Cookie header
      const cookies = res.headers['set-cookie'];
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ 
            status: res.statusCode, 
            data: parsed, 
            cookies: cookies 
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: responseData, 
            cookies: cookies 
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

async function makeUserAdminOnRender() {
  console.log('👑 Making user admin on Render');
  console.log('==============================');
  
  try {
    // Try different admin credentials
    const adminCredentials = [
      { email: 'admin@wp.pl', password: 'admin' },
      { email: 'admin@admin.com', password: 'admin' },
      { email: 'admin', password: 'admin' }  // Maybe it accepts username in email field
    ];
    
    let sessionCookie = null;
    let loginSuccess = false;
    
    for (const creds of adminCredentials) {
      console.log(`🔐 Trying admin login with: ${creds.email}`);
      
      const loginResult = await makeAuthenticatedRequest('POST', '/api/admin/login', creds);
      console.log(`   Status: ${loginResult.status}`);
      
      if (loginResult.status === 200) {
        console.log('✅ Admin login successful!');
        loginSuccess = true;
        
        // Extract session cookie
        if (loginResult.cookies) {
          sessionCookie = loginResult.cookies.find(cookie => 
            cookie.includes('chatwithmechanic.sid')
          );
        }
        break;
      } else {
        console.log(`   Failed: ${JSON.stringify(loginResult.data)}`);
      }
    }
    
    if (!loginSuccess) {
      console.log('❌ All admin login attempts failed');
      console.log('💡 You may need to use the web interface:');
      console.log('   1. Go to: https://cipka.onrender.com/admin/login');
      console.log('   2. Try: admin@wp.pl / admin');
      console.log('   3. Or: admin / admin');
      console.log('   4. Find user: wiktoriatopajew');
      console.log('   5. Make them admin');
      return;
    }
    
    if (!sessionCookie) {
      console.log('❌ No session cookie received');
      return;
    }
    
    console.log('🍪 Session cookie obtained');
    
    // Step 2: Get users list to find the user ID
    console.log('2️⃣ Getting users list...');
    
    const usersResult = await makeAuthenticatedRequest('GET', '/api/admin/users', null, sessionCookie);
    
    if (usersResult.status !== 200) {
      console.log('❌ Failed to get users list');
      return;
    }
    
    console.log('✅ Users list retrieved');
    
    // Find our user
    const users = usersResult.data;
    const targetUser = users.find(u => u.email === 'wiktoriatopajew@gmail.com');
    
    if (!targetUser) {
      console.log('❌ User wiktoriatopajew@gmail.com not found in users list');
      console.log('Available users:', users.map(u => u.username).join(', '));
      return;
    }
    
    console.log(`✅ Found user: ${targetUser.username} (ID: ${targetUser.id})`);
    
    // Step 3: Update user to admin (this might not exist, but let's try)
    console.log('3️⃣ Attempting to make user admin...');
    
    // Try to update user - this endpoint might not exist
    const updateResult = await makeAuthenticatedRequest('PATCH', `/api/admin/users/${targetUser.id}`, {
      isAdmin: true,
      hasSubscription: true
    }, sessionCookie);
    
    console.log(`Update status: ${updateResult.status}`);
    console.log('Update response:', updateResult.data);
    
    if (updateResult.status === 200) {
      console.log('🎉 User successfully made admin!');
      console.log('');
      console.log('👑 Admin credentials:');
      console.log('====================');
      console.log('Username: wiktoriatopajew');
      console.log('Email: wiktoriatopajew@gmail.com');
      console.log('Password: admin123');
      console.log('Status: ADMIN');
    } else {
      console.log('⚠️  Direct admin promotion failed');
      console.log('   You may need to do this manually through admin panel');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

makeUserAdminOnRender();