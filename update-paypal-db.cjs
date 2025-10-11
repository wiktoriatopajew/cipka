const { execSync } = require('child_process');

// Script to update PayPal configuration in database
console.log('🔧 Updating PayPal configuration in database...');

const paypalClientId = 'AQQRFqiUJuokmeHal83UnsJrb_oRoZ6ynJ2eBW1RA3tMKDojrT4y0KNa1SffdoE1MMG9HOFKCJpydUTB';
const paypalClientSecret = 'EAkvlZmB_DqTu_KyBw2Fb_xupIJrt549e321Pd1bsWzmuAZrohQX10er1CFRiYjObtRiHpxfeoOyZRqU';

// SQL to update app config
const sql = `
UPDATE app_config 
SET 
  paypal_client_id = '${paypalClientId}',
  paypal_client_secret = '${paypalClientSecret}',
  paypal_mode = 'sandbox'
WHERE id = 1;
`;

console.log('SQL Query to execute:');
console.log(sql);

console.log('\n🔥 IMPORTANT: Run this SQL on your Render PostgreSQL database:');
console.log('1. Go to Render Dashboard');
console.log('2. Find your PostgreSQL database');
console.log('3. Connect via psql or database client');
console.log('4. Execute the above SQL query');
console.log('\nOR run this script if you have database access...');