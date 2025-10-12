#!/usr/bin/env node

// Detailed Render database analysis via available endpoints
const https = require('https');

async function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'chatwithmechanic.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Admin-Analysis-Script',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data, headers: res.headers });
      });
    });

    req.on('error', (error) => reject(error));
    req.end();
  });
}

async function analyzeRenderData() {
  console.log('🔬 DETAILED RENDER ANALYSIS');
  console.log('===========================\n');
  
  try {
    // Check debug/database endpoint for actual data
    console.log('🗄️ Checking database debug info...');
    const dbResult = await makeRequest('/api/debug/database');
    
    if (dbResult.status === 200) {
      console.log('✅ Database debug endpoint accessible');
      
      // Try to parse as JSON first
      try {
        const dbData = JSON.parse(dbResult.data);
        console.log('📊 Database Info:', JSON.stringify(dbData, null, 2));
        
        // Look for user counts or suspicious activity
        if (dbData.users) {
          console.log(`\n👥 Total users: ${dbData.users.total || 'Unknown'}`);
          if (dbData.users.recent) {
            console.log(`📅 Recent users: ${dbData.users.recent}`);
          }
        }
        
        if (dbData.stats) {
          console.log('\n📈 Database Stats:');
          Object.entries(dbData.stats).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
          });
        }
        
      } catch (parseError) {
        // If not JSON, check if it contains useful text
        const text = dbResult.data;
        console.log('📄 Database debug response (text):');
        console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
        
        // Look for patterns in the text
        const userMatches = text.match(/user[s]?\s*[:\-]\s*(\d+)/gi);
        if (userMatches) {
          console.log('👥 Found user counts:', userMatches);
        }
        
        const dateMatches = text.match(/\d{4}-\d{2}-\d{2}/g);
        if (dateMatches) {
          console.log('📅 Found dates:', [...new Set(dateMatches)].slice(0, 5));
        }
      }
    } else {
      console.log(`❌ Database debug: ${dbResult.status}`);
    }

    // Check stats endpoint
    console.log('\n📊 Checking stats endpoint...');
    const statsResult = await makeRequest('/api/stats');
    
    if (statsResult.status === 200) {
      try {
        const statsData = JSON.parse(statsResult.data);
        console.log('✅ Stats endpoint data:', JSON.stringify(statsData, null, 2));
      } catch (e) {
        console.log('📄 Stats response:', statsResult.data.substring(0, 300));
      }
    }

    // Try health endpoint for any additional info
    console.log('\n❤️ Checking health endpoint details...');
    const healthResult = await makeRequest('/api/health');
    
    if (healthResult.status === 200) {
      try {
        const healthData = JSON.parse(healthResult.data);
        console.log('✅ Health data:', JSON.stringify(healthData, null, 2));
      } catch (e) {
        console.log('📄 Health response:', healthResult.data);
      }
    }

    // Try to get any endpoint that might show recent activity
    console.log('\n🔍 Checking for other informational endpoints...');
    const infoEndpoints = [
      '/api/version',
      '/api/info',
      '/api/debug/stats',
      '/api/system/status'
    ];
    
    for (const endpoint of infoEndpoints) {
      try {
        const result = await makeRequest(endpoint);
        if (result.status === 200 && result.data.length < 1000) {
          console.log(`✅ ${endpoint}:`, result.data.substring(0, 200));
        } else if (result.status !== 404) {
          console.log(`⚠️ ${endpoint}: Status ${result.status}`);
        }
      } catch (error) {
        // Silent fail for exploratory requests
      }
    }

    console.log('\n🎯 AUTOMATED ANALYSIS RESULTS:');
    console.log('===============================');
    console.log('Based on available endpoints, here\'s what to check manually:');
    console.log('');
    console.log('1. 📧 CHECK YOUR GMAIL NOW:');
    console.log('   - Open: https://gmail.com');  
    console.log('   - Search for: "New User Login"');
    console.log('   - Count emails from today');
    console.log('   - Look for suspicious patterns in timestamps');
    console.log('');
    console.log('2. 🔐 ADMIN PANEL - IMMEDIATE CHECK:');
    console.log('   - Visit: https://chatwithmechanic.com/admin');
    console.log('   - Login: admin@wp.pl / admin');
    console.log('   - Look at recent users list');
    console.log('   - Check creation timestamps');
    console.log('');
    console.log('3. 📊 RENDER DASHBOARD:');
    console.log('   - Visit: https://dashboard.render.com');
    console.log('   - Go to Logs tab');
    console.log('   - Search for: "User created" or "registration"');

  } catch (error) {
    console.error('❌ Analysis error:', error.message);
  }

  console.log('\n⚡ NEXT STEP: Manual verification required');
  console.log('Visit the admin panel to see actual user data!');
}

analyzeRenderData();