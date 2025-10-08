// Simple test of Render database connection
const https = require('https');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'cipka.onrender.com',
      port: 443,
      path: path,
      method: 'GET',
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
    
    req.end();
  });
}

async function quickTest() {
  console.log('🔍 Quick Render Database Test');
  console.log('=============================');
  
  try {
    console.log('Testing: https://cipka.onrender.com/api/health');
    
    const result = await makeRequest('/api/health');
    
    console.log(`Status: ${result.status}`);
    console.log(`Response: ${JSON.stringify(result.data, null, 2)}`);
    
    if (result.status === 200 && result.data.database === 'connected') {
      console.log('✅ Database is working!');
      console.log('Problem might be with admin user existence');
    } else {
      console.log('❌ Database connection issue!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTest();