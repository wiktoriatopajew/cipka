// View Render PostgreSQL database content
const https = require('https');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'cipka.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ 
            status: res.statusCode, 
            data: parsed
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function viewRenderDatabase() {
  console.log('🗄️  RENDER PostgreSQL DATABASE VIEWER');
  console.log('=====================================');
  
  try {
    // First login as admin to get session
    console.log('🔐 Logging in as admin...');
    
    const loginResult = await makeRequest('POST', '/api/admin/login', {
      email: 'wiktoriatopajew@gmail.com',
      password: 'admin123'
    });
    
    if (loginResult.status !== 200) {
      console.log('❌ Admin login failed');
      return;
    }
    
    console.log('✅ Admin login successful!');
    console.log('');
    
    // Get users
    console.log('👥 USERS TABLE:');
    console.log('===============');
    
    const usersResult = await makeRequest('GET', '/api/admin/users');
    
    if (usersResult.status === 200) {
      const users = usersResult.data;
      console.log(`Total users: ${users.length}`);
      console.log('');
      
      users.forEach((user, index) => {
        const adminBadge = user.isAdmin ? '👑 ADMIN' : '👤 USER';
        const subBadge = user.hasSubscription ? '💎 VIP' : '🆓 FREE';
        
        console.log(`${index + 1}. ${user.username}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🎭 Status: ${adminBadge} ${subBadge}`);
        console.log(`   📅 Created: ${user.createdAt}`);
        console.log(`   🆔 ID: ${user.id}`);
        console.log('');
      });
    } else {
      console.log(`❌ Failed to get users: ${usersResult.status}`);
    }
    
    // Get chat sessions (if endpoint exists)
    console.log('💬 CHAT SESSIONS:');
    console.log('=================');
    
    const sessionsResult = await makeRequest('GET', '/api/admin/chat-sessions');
    
    if (sessionsResult.status === 200) {
      const sessions = sessionsResult.data;
      console.log(`Total chat sessions: ${sessions.length}`);
      console.log('');
      
      sessions.slice(0, 10).forEach((session, index) => { // Show first 10
        console.log(`${index + 1}. Session: ${session.id}`);
        console.log(`   👤 User: ${session.userId}`);
        console.log(`   🚗 Vehicle: ${session.vehicleInfo || 'N/A'}`);
        console.log(`   📅 Created: ${session.createdAt}`);
        console.log(`   💰 Status: ${session.sessionType || 'Unknown'}`);
        console.log('');
      });
      
      if (sessions.length > 10) {
        console.log(`... and ${sessions.length - 10} more sessions`);
      }
    } else {
      console.log(`❌ Failed to get chat sessions: ${sessionsResult.status}`);
    }
    
    // Get messages (if endpoint exists) 
    console.log('📨 RECENT MESSAGES:');
    console.log('===================');
    
    const messagesResult = await makeRequest('GET', '/api/admin/messages');
    
    if (messagesResult.status === 200) {
      const messages = messagesResult.data;
      console.log(`Total messages: ${messages.length}`);
      console.log('');
      
      messages.slice(0, 5).forEach((message, index) => { // Show first 5
        const senderType = message.isFromUser ? '👤 USER' : '🤖 AI';
        console.log(`${index + 1}. ${senderType}: ${message.content.substring(0, 100)}...`);
        console.log(`   📅 Sent: ${message.createdAt}`);
        console.log(`   🗨️  Session: ${message.sessionId}`);
        console.log('');
      });
      
      if (messages.length > 5) {
        console.log(`... and ${messages.length - 5} more messages`);
      }
    } else {
      console.log(`❌ Failed to get messages: ${messagesResult.status}`);
    }
    
    // Database statistics
    console.log('📊 DATABASE STATISTICS:');
    console.log('=======================');
    
    const statsResult = await makeRequest('GET', '/api/admin/stats');
    
    if (statsResult.status === 200) {
      const stats = statsResult.data;
      console.log(`👥 Total Users: ${stats.totalUsers || 'N/A'}`);
      console.log(`💬 Total Sessions: ${stats.totalSessions || 'N/A'}`);
      console.log(`📨 Total Messages: ${stats.totalMessages || 'N/A'}`);
      console.log(`👑 Admin Users: ${stats.adminUsers || 'N/A'}`);
      console.log(`💎 VIP Users: ${stats.vipUsers || 'N/A'}`);
    } else {
      console.log('ℹ️  Stats endpoint not available');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

viewRenderDatabase();