// Test connection to Render backend API
const https = require('https');
const http = require('http');

// Test URLs - update these when you deploy to Render
const TEST_URLS = [
  'http://localhost:5000/api/health',  // Local test
  'https://automentor.onrender.com/api/health',  // Replace with your actual Render URL
  'https://your-app-name.onrender.com/api/health'  // Template
];

async function testApiConnection(url) {
  return new Promise((resolve) => {
    console.log(`\n🔄 Testing: ${url}`);
    
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const startTime = Date.now();
    
    const req = client.get(url, { timeout: 10000 }, (res) => {
      const duration = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ SUCCESS (${duration}ms)`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Response:`, response);
          resolve({ success: true, status: res.statusCode, data: response, duration });
        } catch (e) {
          console.log(`⚠️  Response not JSON (${duration}ms)`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Data: ${data.substring(0, 100)}...`);
          resolve({ success: false, status: res.statusCode, error: 'Invalid JSON', duration });
        }
      });
    });
    
    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.log(`❌ ERROR (${duration}ms): ${error.message}`);
      resolve({ success: false, error: error.message, duration });
    });
    
    req.on('timeout', () => {
      const duration = Date.now() - startTime;
      console.log(`⏰ TIMEOUT (${duration}ms)`);
      req.destroy();
      resolve({ success: false, error: 'Timeout', duration });
    });
  });
}

async function testMultipleEndpoints(baseUrl) {
  const endpoints = [
    '/api/health',
    '/api/mechanics', 
    '/api/stripe-config',
    '/api/app-config'
  ];
  
  console.log(`\n🧪 Testing multiple endpoints for: ${baseUrl}`);
  
  for (const endpoint of endpoints) {
    const fullUrl = baseUrl + endpoint;
    await testApiConnection(fullUrl);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
  }
}

async function runAllTests() {
  console.log('🚀 AutoMentor API Connection Test');
  console.log('==================================');
  
  // Test each URL
  for (const url of TEST_URLS) {
    await testApiConnection(url);
  }
  
  // Test localhost extensively if available
  try {
    console.log('\n🏠 Testing localhost extensively...');
    await testMultipleEndpoints('http://localhost:5000');
  } catch (e) {
    console.log('❌ Localhost not available');
  }
  
  console.log('\n📋 Summary:');
  console.log('1. Make sure your Render app is deployed');
  console.log('2. Update TEST_URLS with your actual Render URL');
  console.log('3. Frontend will connect to same domain in production');
  console.log('4. CORS is configured for cross-origin requests');
  
  console.log('\n🔧 Next steps:');
  console.log('- Deploy to Render');
  console.log('- Update this script with real URL');
  console.log('- Test again after deployment');
}

// Run tests
runAllTests().catch(console.error);