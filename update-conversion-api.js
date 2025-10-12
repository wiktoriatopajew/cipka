// Update Google Ads conversion label via API
// Run this in browser console on your live site or via fetch

async function updateConversionLabel() {
  console.log('🎯 Updating conversion label to: 32fyCMne66sbEI6bwN5B');
  
  const config = {
    conversionId: 'AW-17646488974',
    purchaseLabel: '32fyCMne66sbEI6bwN5B',  // Your real conversion label
    signupLabel: null,
    enabled: true
  };
  
  try {
    // Update via API (you'll need admin auth for this)
    const response = await fetch('/api/admin/google-ads-config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
      },
      body: JSON.stringify(config)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Conversion label updated successfully!', result);
      
      // Verify with public endpoint
      const verifyResponse = await fetch('/api/google-ads-config');
      const verifyConfig = await verifyResponse.json();
      console.log('🔍 Verification:', verifyConfig);
      
      console.log(`
🎯 GOOGLE ADS READY!
Complete conversion string: AW-17646488974/32fyCMne66sbEI6bwN5B
      `);
      
    } else {
      console.error('❌ Update failed:', await response.text());
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Execute the update
updateConversionLabel();