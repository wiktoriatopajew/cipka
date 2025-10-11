// Update PayPal Configuration in Database
import { db } from './server/storage.js';

async function updatePayPalConfig() {
  console.log('🔧 Updating PayPal configuration...');
  
  const paypalClientId = process.env.PAYPAL_CLIENT_ID || 'AQQRFqiUJuokmeHal83UnsJrb_oRoZ6ynJ2eBW1RA3tMKDojrT4y0KNa1SffdoE1MMG9HOFKCJpydUTB';
  const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET || 'EAkvlZmB_DqTu_KyBw2Fb_xupIJrt549e321Pd1bsWzmuAZrohQX10er1CFRiYjObtRiHpxfeoOyZRqU';
  
  try {
    // Check current config
    const currentConfig = await db.getAppConfig();
    console.log('📋 Current PayPal config:', {
      paypalClientId: currentConfig.paypalClientId,
      paypalClientSecret: currentConfig.paypalClientSecret ? '[HIDDEN]' : 'EMPTY',
      paypalMode: currentConfig.paypalMode
    });
    
    // Update config
    const result = await db.updateAppConfig({
      paypalClientId,
      paypalClientSecret,
      paypalMode: 'sandbox'
    });
    
    console.log('✅ PayPal configuration updated successfully!');
    
    // Verify update
    const updatedConfig = await db.getAppConfig();
    console.log('📋 Updated PayPal config:', {
      paypalClientId: updatedConfig.paypalClientId ? updatedConfig.paypalClientId.substring(0, 20) + '...' : 'EMPTY',
      paypalClientSecret: updatedConfig.paypalClientSecret ? '[SET]' : 'EMPTY',
      paypalMode: updatedConfig.paypalMode
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating PayPal config:', error);
    process.exit(1);
  }
}

updatePayPalConfig();