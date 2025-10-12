// Update Google Ads conversion label in database
// Sets the real conversion label: 32fyCMne66sbEI6bwN5B

const { storage } = require('./server/storage');

async function updateConversionLabel() {
  console.log('🎯 Updating Google Ads conversion label...');
  
  try {
    // Update configuration with real conversion label
    const result = await storage.updateGoogleAdsConfig({
      conversionId: 'AW-17646488974',
      purchaseLabel: '32fyCMne66sbEI6bwN5B',  // Your real conversion label
      signupLabel: null,
      enabled: true
    });
    
    if (result.success) {
      console.log('✅ Conversion label updated successfully!');
      
      // Verify the update
      const config = await storage.getGoogleAdsConfig();
      console.log('🔍 Updated configuration:', {
        conversionId: config.conversionId,
        purchaseLabel: config.purchaseLabel,
        enabled: config.enabled
      });
      
      console.log(`
🎯 GOOGLE ADS CONVERSION TRACKING READY!

✅ Full Conversion String: AW-17646488974/32fyCMne66sbEI6bwN5B
✅ Conversion ID: AW-17646488974
✅ Purchase Label: 32fyCMne66sbEI6bwN5B
✅ Status: ENABLED

📊 What will be tracked:
- Purchase conversions on Stripe payments
- Purchase conversions on PayPal payments  
- Subscription renewals
- Transaction values and details

🚀 PRODUCTION READY! 
Your system will now properly track conversions in Google Ads.
      `);
      
    } else {
      console.error('❌ Failed to update:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Update error:', error);
  }
}

updateConversionLabel();