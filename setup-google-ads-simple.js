// Simple Google Ads Configuration via API
// Configures conversion tracking with AW-17646488974

async function setupGoogleAds() {
  console.log('🎯 Setting up Google Ads conversion tracking...');
  console.log('Conversion ID: AW-17646488974');
  
  const config = {
    conversionId: 'AW-17646488974',
    purchaseLabel: 'purchase_conversion',  // Replace with actual label from Google Ads
    signupLabel: null,                     // Not needed - registration only after purchase
    enabled: true
  };
  
  try {
    // Make API request to configure Google Ads
    const response = await fetch('http://localhost:5000/api/admin/google-ads-config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Note: In production you'll need proper authentication
      },
      body: JSON.stringify(config)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Google Ads configuration updated successfully!');
      console.log('📊 Configuration:', config);
      
      // Test the public endpoint
      const testResponse = await fetch('http://localhost:5000/api/google-ads-config');
      const testConfig = await testResponse.json();
      console.log('🔍 Public config verification:', testConfig);
      
      console.log(`
🎯 GOOGLE ADS TRACKING CONFIGURED!

✅ Conversion ID: ${config.conversionId}
✅ Purchase Label: ${config.purchaseLabel} (update with real label)  
✅ Signup Label: ${config.signupLabel} (update with real label)
✅ Tracking: ENABLED

📋 WHAT'S ALREADY IMPLEMENTED:
✅ gtag script loaded in HTML with your conversion ID
✅ Purchase tracking on successful payments (Stripe & PayPal)
✅ Signup tracking on account creation
✅ Begin checkout tracking when payment modal opens
✅ Add payment info tracking on payment method selection

🚨 NEXT STEPS:
1. Go to Google Ads > Conversions
2. Create "Purchase" and "Signup" conversion actions
3. Copy the conversion labels (format: "abc123def/xyz789")  
4. Update the labels in admin panel or database

🚀 READY TO TRACK CONVERSIONS!
      `);
      
    } else {
      const error = await response.text();
      console.error('❌ Failed to configure:', error);
    }
    
  } catch (error) {
    console.error('❌ Setup error:', error);
    console.log('💡 Make sure the server is running on localhost:5000');
  }
}

// Run setup
setupGoogleAds();