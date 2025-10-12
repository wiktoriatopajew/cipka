#!/usr/bin/env node

// Check for automatic user creation patterns
import dotenv from 'dotenv';
dotenv.config();

async function checkUserCreationPatterns() {
  console.log('🔍 Checking for Automatic User Creation Patterns');
  console.log('=================================================\n');
  
  try {
    // Test database connection first
    console.log('📡 Testing database connection...');
    const response = await fetch('https://chatwithmechanic.com/api/health');
    if (!response.ok) {
      throw new Error(`Server not responding: ${response.status}`);
    }
    console.log('✅ Server is responsive\n');
    
    // Get recent users to analyze patterns
    console.log('👥 Fetching recent user data...');
    const usersResponse = await fetch('https://chatwithmechanic.com/api/debug/users');
    
    if (usersResponse.ok) {
      const userData = await usersResponse.json();
      console.log('✅ User data retrieved\n');
      
      // Analyze user creation patterns
      console.log('📊 USER ANALYSIS:');
      console.log('=================');
      console.log(`Total users: ${userData.totalUsers || 'Unknown'}`);
      
      if (userData.recentUsers && Array.isArray(userData.recentUsers)) {
        console.log(`Recent users (last 50): ${userData.recentUsers.length}`);
        console.log('');
        
        // Check for suspicious patterns
        let suspiciousUsers = 0;
        let botLikeUsers = 0;
        let todayUsers = 0;
        const today = new Date().toDateString();
        
        console.log('🕐 RECENT USER ACTIVITY:');
        console.log('Username'.padEnd(20), 'Email'.padEnd(25), 'Created'.padEnd(20), 'Flags');
        console.log('='.repeat(80));
        
        userData.recentUsers.slice(0, 20).forEach(user => {
          const createdDate = new Date(user.createdAt).toDateString();
          const isToday = createdDate === today;
          if (isToday) todayUsers++;
          
          // Check for suspicious patterns
          let flags = [];
          
          // Bot-like usernames
          if (user.username.match(/^(user|test|guest)\d+$/i)) {
            flags.push('BOT-LIKE');
            botLikeUsers++;
          }
          
          // Generic emails
          if (user.email && user.email.includes('test@') || user.email.includes('example.com')) {
            flags.push('TEST-EMAIL');
            suspiciousUsers++;
          }
          
          // Very recent creation (last hour)
          const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
          if (new Date(user.createdAt) > hourAgo) {
            flags.push('VERY-RECENT');
          }
          
          console.log(
            user.username.padEnd(20), 
            (user.email || 'NO-EMAIL').padEnd(25),
            createdDate.padEnd(20),
            flags.join(' ') || 'OK'
          );
        });
        
        console.log('');
        console.log('🚨 PATTERN ANALYSIS:');
        console.log('=====================');
        console.log(`👥 Users created today: ${todayUsers}`);
        console.log(`🤖 Bot-like usernames: ${botLikeUsers}`);
        console.log(`⚠️  Suspicious patterns: ${suspiciousUsers}`);
        
        if (todayUsers > 5) {
          console.log('🚨 WARNING: Many users created today - possible bot activity!');
        }
        
        if (botLikeUsers > 3) {
          console.log('🚨 WARNING: Multiple bot-like usernames detected!');
        }
        
      } else {
        console.log('❌ Could not retrieve user list for analysis');
      }
      
    } else {
      console.log(`❌ Failed to get user data: ${usersResponse.status}`);
      console.log('Trying alternative method...\n');
      
      // Try to get basic stats from health endpoint
      const healthResponse = await fetch('https://chatwithmechanic.com/api/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('📊 Basic server stats:', healthData);
      }
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('====================');
    console.log('1. Check admin panel for recent user activity');
    console.log('2. Monitor registration endpoint for unusual traffic');
    console.log('3. Consider adding CAPTCHA if bot activity detected');
    console.log('4. Check server logs for automated registration attempts');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    
    console.log('\n🛠️ MANUAL CHECKS:');
    console.log('==================');
    console.log('1. Check Render logs: https://dashboard.render.com');
    console.log('2. Check admin panel: https://chatwithmechanic.com/admin');
    console.log('3. Look for patterns in user registration times');
    console.log('4. Monitor for repeated IP addresses in logs');
  }
}

checkUserCreationPatterns();