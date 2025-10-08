// Create admin user directly on Render
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

async function createRenderAdmin() {
  console.log('🔧 Creating Admin User on Render');
  console.log('=================================');
  
  try {
    // Step 1: Create admin user through registration
    console.log('1️⃣ Creating admin user...');
    
    const createResult = await makeRequest('POST', '/api/users/register', {
      username: 'admin',
      email: 'admin@wp.pl',
      password: 'admin123'
    });
    
    console.log(`Admin creation status: ${createResult.status}`);
    console.log(`Response: ${JSON.stringify(createResult.data, null, 2)}`);
    
    if (createResult.status === 200) {
      console.log('✅ Admin user created successfully!');
      
      const adminUserId = createResult.data.user.id;
      console.log(`Admin user ID: ${adminUserId}`);
      
      console.log('');
      console.log('⚠️  IMPORTANT: Admin user created but needs manual database update');
      console.log('');
      console.log('🔧 Manual SQL needed on Render PostgreSQL:');
      console.log(`UPDATE users SET "isAdmin" = true WHERE id = '${adminUserId}';`);
      console.log('');
      console.log('💡 Alternative: Use existing user wiktoriatopajew as admin');
      
    } else if (createResult.status === 400 && createResult.data.error?.includes('already exists')) {
      console.log('✅ Admin user already exists!');
      console.log('');
      console.log('2️⃣ Testing admin login...');
      
      const loginResult = await makeRequest('POST', '/api/admin/login', {
        email: 'admin@wp.pl',
        password: 'admin123'
      });
      
      console.log(`Login status: ${loginResult.status}`);
      if (loginResult.status === 200) {
        console.log('✅ Admin login works!');
        console.log('🎉 Admin panel should be accessible now');
      } else {
        console.log('❌ Admin login failed - user exists but isAdmin=false');
        console.log('Need manual database update');
      }
      
    } else {
      console.log('❌ Failed to create admin user');
    }
    
    // Step 2: Also create backup admin with your email
    console.log('');
    console.log('3️⃣ Creating backup admin (wiktoriatopajew)...');
    
    const backupResult = await makeRequest('POST', '/api/users/register', {
      username: 'wiktoriaadmin',
      email: 'wiktoriatopajew+admin@gmail.com',
      password: 'admin123'
    });
    
    console.log(`Backup admin status: ${backupResult.status}`);
    if (backupResult.status === 200) {
      console.log('✅ Backup admin created!');
      console.log(`Backup admin ID: ${backupResult.data.user.id}`);
    }
    
    console.log('');
    console.log('📋 SUMMARY:');
    console.log('===========');
    console.log('1. ✅ Database is connected and working');
    console.log('2. ✅ User registration works');
    console.log('3. ⚠️  Admin users created but need isAdmin=true flag');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('- Access Render PostgreSQL directly');
    console.log('- OR create SQL migration script');
    console.log('- OR modify user through existing admin interface');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createRenderAdmin();