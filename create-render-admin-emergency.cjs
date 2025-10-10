#!/usr/bin/env node

// Emergency script to create admin user on Render production

async function makeRequest(method, path, body = null) {
  const url = `https://cipka.onrender.com${path}`;
  console.log(`${method} ${url}`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'AdminCreator/1.0'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  console.log(`Status: ${response.status}`);
  console.log(`Response:`, data);
  
  return { status: response.status, data };
}

async function createAdminUser() {
  try {
    console.log('🚨 EMERGENCY: Creating admin user on Render production...');
    
    // Try to register admin user directly
    const result = await makeRequest('POST', '/api/users/register', {
      username: 'admin',
      email: 'admin@automentor.com',
      password: 'Admin123!'
    });
    
    if (result.status === 200 || result.status === 201) {
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@automentor.com');  
      console.log('Password: Admin123!');
      
      // Now try to promote to admin (this will fail but user is created)
      console.log('\n📋 User created. Now check manually if admin flags need to be set in database.');
      
    } else if (result.status === 400 && result.data.error === 'User already exists') {
      console.log('ℹ️  Admin user already exists.');
      console.log('Try logging in with existing credentials');
      
    } else {
      console.log('❌ Failed to create admin user');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser };