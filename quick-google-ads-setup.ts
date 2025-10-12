// Quick Google Ads Setup Script
// Configures the system with your conversion ID: AW-17646488974

import { apiRequest } from './client/src/lib/queryClient.ts';

async function setupGoogleAds() {
  console.log('🎯 Setting up Google Ads conversion tracking...');
  
  const config = {
    conversionId: 'AW-17646488974',
    purchaseLabel: 'default_purchase',  // You'll need to replace this with actual label from Google Ads
    signupLabel: 'default_signup',      // You'll need to replace this with actual label from Google Ads  
    enabled: true
  };
  
  try {
    // First, let's check current config
    console.log('🔍 Checking current Google Ads configuration...');
    const currentConfig = await apiRequest('GET', '/api/admin/google-ads-config');
    console.log('Current config:', currentConfig);
    
    // Update with our config
    console.log('🔧 Updating Google Ads configuration...');
    const result = await apiRequest('PUT', '/api/admin/google-ads-config', config);
    
    console.log('✅ Google Ads configuration updated!');
    console.log('📊 New configuration:', config);
    
    console.log(`
🎯 NEXT STEPS TO COMPLETE SETUP:

1. Go to Google Ads (ads.google.com)
2. Navigate to Tools & Settings > Measurement > Conversions  
3. Create conversion actions and get the labels:

   🛒 PURCHASE CONVERSION ACTION:
   - Conversion name: "Subscription Purchase"
   - Category: "Purchase" 
   - Value: "Use different values for each conversion"
   - Count: "One"
   - Copy the conversion label (looks like: "abc123def/xyz789")
   
   👤 SIGNUP CONVERSION ACTION:  
   - Conversion name: "User Registration"
   - Category: "Sign-up"
   - Value: "Don't use a value"
   - Count: "One"
   - Copy the conversion label (looks like: "abc123def/xyz789")

4. Replace the labels in the database:
   - purchaseLabel: replace "default_purchase" with your actual purchase label
   - signupLabel: replace "default_signup" with your actual signup label

5. Test conversions in Google Ads to verify tracking is working

🚨 IMPORTANT: The system is configured with your conversion ID (AW-17646488974) 
but you need to update the conversion labels for proper tracking!
    `);
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Export for use in other scripts
export { setupGoogleAds };

// Run if called directly
if (import.meta.main) {
  setupGoogleAds();
}