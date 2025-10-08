// Quick check for Stripe configuration on Render
console.log('=== STRIPE CONFIG CHECK ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET (length: ' + process.env.STRIPE_SECRET_KEY.length + ')' : 'NOT SET');
console.log('VITE_STRIPE_PUBLIC_KEY:', process.env.VITE_STRIPE_PUBLIC_KEY ? 'SET (length: ' + process.env.VITE_STRIPE_PUBLIC_KEY.length + ')' : 'NOT SET');
console.log('===========================');

// Test basic API endpoint
fetch('/api/health')
  .then(res => res.json())
  .then(data => console.log('Health check:', data))
  .catch(err => console.error('Health check failed:', err));