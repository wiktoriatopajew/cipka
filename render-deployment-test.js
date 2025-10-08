// Quick render deployment test script
// Run this after deploying to Render

async function testRenderDeployment(renderUrl) {
  console.log('🚀 Testing AutoMentor on Render');
  console.log('===============================');
  console.log(`URL: ${renderUrl}\n`);

  const tests = [
    {
      name: 'Health Check',
      endpoint: '/api/health',
      method: 'GET'
    },
    {
      name: 'Frontend Loading',
      endpoint: '/',
      method: 'GET'
    },
    {
      name: 'Mechanics Count',
      endpoint: '/api/mechanics',
      method: 'GET'
    },
    {
      name: 'Stripe Config',
      endpoint: '/api/stripe-config',
      method: 'GET'
    },
    {
      name: 'Admin Login',
      endpoint: '/api/admin/login',
      method: 'POST',
      body: { username: 'admin', password: 'admin' }
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`🧪 Testing: ${test.name}`);
      
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(`${renderUrl}${test.endpoint}`, options);
      
      if (response.ok) {
        console.log(`   ✅ PASS (${response.status})`);
        passedTests++;
        
        // Try to show response for some endpoints
        if (test.endpoint === '/api/health') {
          try {
            const data = await response.json();
            console.log(`   📊 Response:`, data);
          } catch {}
        }
      } else {
        console.log(`   ❌ FAIL (${response.status})`);
        const text = await response.text();
        console.log(`   Error: ${text.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your app is working on Render!');
  } else if (passedTests > 0) {
    console.log('⚠️  Some tests passed. Check failed tests above.');
  } else {
    console.log('❌ No tests passed. Check your deployment.');
  }

  return { passed: passedTests, total: totalTests };
}

// Usage examples:
console.log(`
🎯 How to use this tester:

1. After deploying to Render, copy your app URL
2. Run one of these commands:

// In browser console (F12):
testRenderDeployment('https://your-app-name.onrender.com')

// In Node.js:
testRenderDeployment('https://your-app-name.onrender.com').then(console.log)

3. Or open: https://your-app-name.onrender.com/render-test.html
`);

// Export for browser use
if (typeof window !== 'undefined') {
  window.testRenderDeployment = testRenderDeployment;
}

// Export for Node.js use  
if (typeof module !== 'undefined') {
  module.exports = { testRenderDeployment };
}