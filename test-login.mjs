// Test admin login
const response = await fetch('http://localhost:3015/api/admin/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'wiktoriatopajew@gmail.com',
    password: 'Xander12.'
  })
});

const data = await response.json();
console.log('Response status:', response.status);
console.log('Response data:', data);
