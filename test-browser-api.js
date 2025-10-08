// Test API connection after Render deployment
// Update RENDER_URL with your actual Render URL after deployment

const RENDER_URL = 'https://your-app-name.onrender.com'; // UPDATE THIS!

async function testRenderAPI() {
  console.log('🚀 Testing Render API Connection');
  console.log('==================================');
  
  const endpoints = [
    '/api/health',
    '/api/mechanics', 
    '/api/stripe-config',
    '/api/app-config'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔄 Testing: ${RENDER_URL}${endpoint}`);
      
      const response = await fetch(`${RENDER_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS - Status: ${response.status}`);
        console.log(`   Response:`, data);
      } else {
        console.log(`❌ FAILED - Status: ${response.status}`);
        const text = await response.text();
        console.log(`   Error: ${text.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📋 Connection Summary:');
  console.log('- Frontend: Same domain as backend on Render');
  console.log('- API calls: Relative paths (/api/*)');
  console.log('- CORS: Not needed (same domain)');
  console.log('- Sessions: Will work (same domain cookies)');
}

// Browser test (paste in console after deployment)
console.log(`
🌐 Browser Test Instructions:
1. Deploy to Render
2. Open your Render URL in browser
3. Open DevTools Console (F12)
4. Update RENDER_URL variable above
5. Run: testRenderAPI()
`);

// For browser usage
if (typeof window !== 'undefined') {
  window.testRenderAPI = testRenderAPI;
  console.log('💡 Run testRenderAPI() in browser console after deployment');
}