// Google Ads Configuration Script
// Sets up conversion tracking with provided conversion ID

const setup = async () => {
  try {
    console.log('🎯 Configuring Google Ads conversion tracking...');
    
    const config = {
      conversionId: 'AW-17646488974',
      purchaseLabel: 'purchase_conversion_label', // You need to get this from Google Ads
      signupLabel: 'signup_conversion_label',     // You need to get this from Google Ads
      enabled: true
    };
    
    const response = await fetch('/api/admin/google-ads-config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config)
    });
    
    if (response.ok) {
      console.log('✅ Google Ads configuration updated successfully!');
      console.log('🔧 Configuration:', config);
      
      // Test tracking
      console.log('🧪 Testing conversion tracking...');
      
      // Import the tracking library
      const { GoogleAdsConversions } = await import('./client/src/lib/googleAdsTracking');
      
      // Test purchase tracking
      await GoogleAdsConversions.trackPurchase({
        transactionId: 'test_' + Date.now(),
        value: 14.99,
        currency: 'USD',
        items: [{
          item_id: 'basic_plan',
          item_name: 'Basic Mechanic Consultation',
          category: 'Automotive Services',
          quantity: 1,
          price: 14.99
        }]
      });
      
      console.log('✅ Test conversion sent successfully!');
      
    } else {
      console.error('❌ Failed to update configuration:', await response.text());
    }
  } catch (error) {
    console.error('❌ Configuration error:', error);
  }
};

// Instructions for getting conversion labels
console.log(`
🎯 GOOGLE ADS SETUP INSTRUCTIONS:

1. Go to your Google Ads account (ads.google.com)
2. Navigate to Tools & Settings > Measurement > Conversions
3. Create two conversion actions:

   📊 PURCHASE CONVERSION:
   - Name: "Subscription Purchase"  
   - Category: "Purchase"
   - Value: "Use different values for each conversion"
   - Count: "One"
   - Attribution model: "Data-driven"
   
   📝 SIGNUP CONVERSION:
   - Name: "User Registration"
   - Category: "Sign-up" 
   - Value: "Don't use a value for this conversion action"
   - Count: "One"
   - Attribution model: "Data-driven"

4. Copy the conversion labels from each action
5. Replace 'purchase_conversion_label' and 'signup_conversion_label' in this script
6. Run this script to configure the system

Your Conversion ID: AW-17646488974 ✅
`);

// Run setup if this file is executed directly
if (require.main === module) {
  setup();
}

module.exports = { setup };