const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function updatePayPalConfig() {
  console.log('🔧 Updating PayPal configuration in database...');
  
  const paypalClientId = 'AQQRFqiUJuokmeHal83UnsJrb_oRoZ6ynJ2eBW1RA3tMKDojrT4y0KNa1SffdoE1MMG9HOFKCJpydUTB';
  const paypalClientSecret = 'EAkvlZmB_DqTu_KyBw2Fb_xupIJrt549e321Pd1bsWzmuAZrohQX10er1CFRiYjObtRiHpxfeoOyZRqU';
  
  try {
    // Check current config
    console.log('📋 Checking current PayPal configuration...');
    const currentResult = await pool.query('SELECT paypal_client_id, paypal_client_secret, paypal_mode FROM app_config WHERE id = 1');
    console.log('Current config:', currentResult.rows[0]);
    
    // Update config
    console.log('🔄 Updating PayPal configuration...');
    const updateResult = await pool.query(
      `UPDATE app_config 
       SET paypal_client_id = $1, paypal_client_secret = $2, paypal_mode = $3, updated_at = NOW()
       WHERE id = 1 
       RETURNING paypal_client_id, paypal_mode`,
      [paypalClientId, paypalClientSecret, 'sandbox']
    );
    
    console.log('✅ PayPal configuration updated successfully!');
    console.log('Updated config:', {
      paypalClientId: updateResult.rows[0].paypal_client_id.substring(0, 20) + '...',
      paypalMode: updateResult.rows[0].paypal_mode
    });
    
    await pool.end();
    console.log('🎉 Database connection closed. PayPal should work now!');
    
  } catch (error) {
    console.error('❌ Error updating PayPal config:', error);
    await pool.end();
    process.exit(1);
  }
}

updatePayPalConfig();