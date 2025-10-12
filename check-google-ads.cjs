// Quick Google Ads Config Check
const path = require('path');
const fs = require('fs');

// Check if database exists
const dbPath = './database.sqlite';
if (!fs.existsSync(dbPath)) {
  console.log('❌ Database file not found:', dbPath);
  process.exit(1);
}

console.log('🔍 Checking Google Ads configuration...');

// Try to read using better-sqlite3 if available
try {
  const Database = require('better-sqlite3');
  const db = new Database(dbPath);
  
  try {
    const config = db.prepare('SELECT * FROM google_ads_config LIMIT 1').get();
    
    if (config) {
      console.log('✅ Google Ads Config FOUND:');
      console.log('   🎯 Conversion ID:', config.conversion_id);
      console.log('   💳 Purchase Label:', config.purchase_label);
      console.log('   📝 Signup Label:', config.signup_label);
      console.log('   🟢 Enabled:', config.enabled ? 'YES' : 'NO');
      console.log('   📅 Created:', config.created_at);
      console.log('   🔄 Updated:', config.updated_at);
    } else {
      console.log('❌ No Google Ads configuration found in database');
    }
  } catch (err) {
    if (err.message.includes('no such table')) {
      console.log('❌ Google Ads table does not exist yet');
    } else {
      console.log('❌ Database error:', err.message);
    }
  }
  
  db.close();
} catch (requireErr) {
  console.log('❌ better-sqlite3 not available, trying alternative method...');
  
  // Alternative: Check via API call (if server is running)
  console.log('💡 You can check via browser: http://localhost:3000/api/google-ads-config');
  console.log('💡 Or install dependencies and run setup script');
}