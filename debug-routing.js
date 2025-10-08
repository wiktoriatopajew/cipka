// Debug routing issues
console.log('🔍 Debugging AutoMentor Routing');

// Check current URL
console.log('Current URL:', window.location.href);
console.log('Pathname:', window.location.pathname);
console.log('Search:', window.location.search);
console.log('Hash:', window.location.hash);

// Test API connectivity
async function testAPI() {
  try {
    const response = await fetch('/api/health');
    console.log('API Health Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('API Health Data:', data);
    }
  } catch (error) {
    console.error('API Test Error:', error);
  }
}

// Test route navigation
function testRoutes() {
  const testRoutes = [
    '/',
    '/admin', 
    '/contact',
    '/faq',
    '/api/health',
    '/nonexistent-page'
  ];
  
  console.log('Available routes to test:', testRoutes);
  console.log('Try: window.location.href = "/admin"');
}

testAPI();
testRoutes();

// Show React routing info if available
if (window.React) {
  console.log('React detected');
} else {
  console.log('React not detected in global scope');
}