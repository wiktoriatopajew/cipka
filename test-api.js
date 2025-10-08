// Test script to check if API works
console.log('Testing API connection...');

const API_BASE = 'https://auto-mentor-working-backup-2025-10-08-01-32-7ylnsszci.vercel.app';

async function testAPI() {
  try {
    console.log('Testing basic API...');
    const testResponse = await fetch(`${API_BASE}/api/test`);
    const testData = await testResponse.json();
    console.log('Test endpoint:', testData);
    
    console.log('Testing mechanics endpoint...');
    const mechanicsResponse = await fetch(`${API_BASE}/api/mechanics`);
    const mechanicsData = await mechanicsResponse.json();
    console.log('Mechanics endpoint:', mechanicsData);
    
    if (mechanicsData.success) {
      console.log(`✅ Found ${mechanicsData.onlineCount} available mechanics out of ${mechanicsData.totalOnline} online`);
    } else {
      console.log('❌ Mechanics endpoint failed');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testAPI();