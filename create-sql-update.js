// Simple direct database update script
// Run this on the server via SSH or terminal access

const fs = require('fs');
const path = require('path');

// Create a simple SQL migration file
const sqlScript = `
-- Update Google Ads conversion label
-- Run this on your PostgreSQL database

UPDATE google_ads_config SET 
  purchase_label = '32fyCMne66sbEI6bwN5B',
  enabled = true,
  updated_at = NOW()
WHERE conversion_id = 'AW-17646488974';

-- If no record exists, insert it
INSERT INTO google_ads_config (conversion_id, purchase_label, signup_label, enabled, updated_at)
SELECT 'AW-17646488974', '32fyCMne66sbEI6bwN5B', NULL, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM google_ads_config WHERE conversion_id = 'AW-17646488974');

-- Verify the update
SELECT 
  'Google Ads Conversion Label Updated!' as status,
  conversion_id,
  purchase_label,
  enabled,
  updated_at
FROM google_ads_config
WHERE conversion_id = 'AW-17646488974';
`;

console.log('📝 SQL Script to update conversion label:');
console.log(sqlScript);

// Save to file
fs.writeFileSync('update-conversion-direct.sql', sqlScript);
console.log('💾 SQL script saved to: update-conversion-direct.sql');

console.log(`
🎯 How to execute this:

1. Connect to your Render PostgreSQL database:
   - Go to Render dashboard > Your database
   - Copy connection string
   
2. Use psql or database client:
   psql "postgresql://username:password@hostname:port/database"
   
3. Run the SQL:
   \\i update-conversion-direct.sql
   
4. Or copy-paste the SQL directly into database console

🚀 This will update your conversion label to: 32fyCMne66sbEI6bwN5B
`);