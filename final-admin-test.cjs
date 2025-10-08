// Final test - admin login
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

async function finalAdminTest() {
  console.log('🎉 FINAL ADMIN TEST');
  console.log('==================');
  
  try {
    const adminResult = await makeRequest('POST', '/api/admin/login', {
      email: 'wiktoriatopajew@gmail.com',
      password: 'admin123'
    });
    
    console.log(`Admin login status: ${adminResult.status}`);
    
    if (adminResult.status === 200) {
      console.log('🎊 SUCCESS! ADMIN LOGIN WORKS! 🎊');
      console.log('');
      console.log('🎯 YOUR ADMIN CREDENTIALS:');
      console.log('==========================');
      console.log('📧 Email: wiktoriatopajew@gmail.com');
      console.log('🔐 Password: admin123');
      console.log('🌐 Admin Panel: https://cipka.onrender.com/admin/login');
      console.log('');
      console.log('🚀 You can now access the full admin panel!');
      console.log('💎 Manage users, chat sessions, and all admin features');
    } else {
      console.log(`❌ Admin login failed: ${JSON.stringify(adminResult.data)}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

finalAdminTest();