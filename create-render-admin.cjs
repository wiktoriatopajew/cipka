// Create admin user directly on Render via API
const https = require('https');

const RENDER_URL = 'https://cipka.onrender.com';

// Function to make HTTP requests
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
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
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

async function createAdminOnRender() {
  console.log('🚀 Creating admin user directly on Render PostgreSQL');
  console.log('===================================================');
  
  try {
    // First, try to register the user
    console.log('1️⃣ Attempting to register new user...');
    
    const registerData = {
      username: 'wiktoriatopajew',
      email: 'wiktoriatopajew@gmail.com',
      password: 'admin123'
    };
    
    const registerResult = await makeRequest('POST', '/api/users/register', registerData);
    
    console.log(`Register response: ${registerResult.status}`);
    console.log('Response data:', registerResult.data);
    
    if (registerResult.status === 201 || registerResult.status === 200) {
      console.log('✅ User registered successfully!');
      console.log('');
      console.log('🎯 Login credentials for Render:');
      console.log('================================');
      console.log('Username: wiktoriatopajew');
      console.log('Email: wiktoriatopajew@gmail.com'); 
      console.log('Password: admin123');
      console.log('URL: https://cipka.onrender.com/admin');
      console.log('');
      console.log('⚠️  Note: This user is registered but NOT admin yet.');
      console.log('   You can make them admin through admin panel.');
      
    } else if (registerResult.status === 409) {
      console.log('⚠️  User already exists on Render');
      console.log('');
      console.log('🔑 Try logging in with:');
      console.log('Username: wiktoriatopajew');
      console.log('Password: admin123');
      console.log('URL: https://cipka.onrender.com/admin');
      
    } else {
      console.log(`❌ Registration failed: ${registerResult.status}`);
      console.log('Response:', registerResult.data);
    }
    
  } catch (error) {
    console.error('❌ Error creating user on Render:', error.message);
  }
  
  console.log('');
  console.log('🔧 Alternative options:');
  console.log('=======================');
  console.log('1. Register normally on website, then make admin via existing admin');
  console.log('2. Use existing admin account: admin / admin');
  console.log('3. Check Render database directly through console');
}

createAdminOnRender();