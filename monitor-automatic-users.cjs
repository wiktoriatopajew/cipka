const axios = require('axios');
const fs = require('fs');

// Create a comprehensive monitoring script
async function monitorAutomaticUsers() {
    console.log('🚨 AUTOMATIC USER DETECTION SYSTEM');
    console.log('===================================\n');

    const baseUrl = 'https://chatwithmechanic.com';
    let detectedIssues = [];

    try {
        // 1. Get current user count
        console.log('📊 Step 1: Getting baseline user count...');
        const healthResponse = await axios.get(`${baseUrl}/api/health`, { timeout: 10000 });
        const currentUsers = healthResponse.data.usersCount;
        console.log(`✅ Current users: ${currentUsers}`);
        
        // Store timestamp for monitoring
        const timestamp = new Date().toISOString();
        console.log(`⏰ Check time: ${timestamp}\n`);

        // 2. Check database connection info
        console.log('🔍 Step 2: Database connection analysis...');
        try {
            const dbResponse = await axios.get(`${baseUrl}/api/debug/database`, { timeout: 10000 });
            const dbData = dbResponse.data;
            
            if (dbData.success && dbData.connectionTest) {
                console.log(`✅ ${dbData.connectionTest}`);
                console.log(`🎯 Database: ${dbData.database.DATABASE_URL_HOST}`);
                console.log(`🌍 Environment: ${dbData.database.NODE_ENV}\n`);
            }
        } catch (dbErr) {
            console.log(`⚠️ Database check failed: ${dbErr.message}\n`);
        }

        // 3. Save monitoring data to file
        const monitoringData = {
            timestamp: timestamp,
            userCount: currentUsers,
            checkType: 'automatic_user_detection',
            status: 'completed'
        };

        // Write to monitoring log
        const logEntry = `${timestamp},${currentUsers},check_completed\n`;
        fs.appendFileSync('user_monitoring.log', logEntry);

        // 4. Provide investigation steps
        console.log('🔍 INVESTIGATION CHECKLIST:');
        console.log('==========================');
        
        console.log('\n1. 📧 IMMEDIATE GMAIL CHECK:');
        console.log('   ➤ Open: https://gmail.com');
        console.log('   ➤ Login: wiktoriatopajew@gmail.com');
        console.log('   ➤ Search: "New User Login"');
        console.log('   ➤ Count emails from last 24 hours');
        console.log('   ➤ RED FLAGS: More than 5-10 notifications per day');
        
        console.log('\n2. 🎯 ADMIN PANEL DEEP DIVE:');
        console.log('   ➤ URL: https://chatwithmechanic.com/admin');
        console.log('   ➤ Login: admin@wp.pl / admin');
        console.log('   ➤ Navigate to Users section');
        console.log('   ➤ Sort by "Created At" (newest first)');
        console.log('   ➤ SUSPICIOUS PATTERNS TO LOOK FOR:');
        console.log('      🚩 Multiple users created within 1-2 minutes');
        console.log('      🚩 Email patterns: test@, bot@, random strings');
        console.log('      🚩 Similar usernames: user1, user2, etc.');
        console.log('      🚩 No chat messages after registration');
        console.log('      🚩 Same IP addresses for multiple accounts');
        
        console.log('\n3. 📈 RENDER DASHBOARD LOGS:');
        console.log('   ➤ URL: https://dashboard.render.com');
        console.log('   ➤ Select your Chat With Mechanic service');
        console.log('   ➤ Go to "Logs" tab');
        console.log('   ➤ Search terms to use:');
        console.log('      🔍 "User created"');
        console.log('      🔍 "POST /api/auth/register"');
        console.log('      🔍 "registration successful"');
        console.log('   ➤ LOOK FOR: Burst patterns (many registrations close together)');
        
        console.log('\n4. 🤖 AUTOMATED DETECTION SIGNS:');
        console.log('   🚨 HIGH RISK INDICATORS:');
        console.log('      ⚠️ 5+ users registered in 10 minutes');
        console.log('      ⚠️ Similar email domains (10minutemail, etc.)');
        console.log('      ⚠️ Sequential usernames or emails');
        console.log('      ⚠️ Zero chat activity after registration');
        console.log('      ⚠️ Same user agent strings');
        console.log('      ⚠️ Registration spikes at unusual hours');
        
        console.log('\n5. ⚡ IMMEDIATE ACTIONS IF BOTS DETECTED:');
        console.log('   ✅ Document suspicious user IDs');
        console.log('   ✅ Screenshot admin panel showing patterns');
        console.log('   ✅ Export user list with timestamps');
        console.log('   ✅ Check if they affect analytics/costs');
        console.log('   ✅ Consider implementing CAPTCHA');
        console.log('   ✅ Add rate limiting to registration endpoint');

        console.log('\n📊 MONITORING LOG CREATED:');
        console.log('   File: user_monitoring.log');
        console.log(`   Entry: ${logEntry.trim()}`);

        console.log('\n🎯 NEXT STEPS:');
        console.log('   1. Complete manual checks above');
        console.log('   2. Run this script again in 1-2 hours');
        console.log('   3. Compare user counts to detect increases');
        console.log('   4. Report findings for further analysis\n');

    } catch (error) {
        console.error('❌ Monitoring failed:', error.message);
        detectedIssues.push(`Monitoring error: ${error.message}`);
    }

    if (detectedIssues.length > 0) {
        console.log('\n🚨 ISSUES DETECTED:');
        detectedIssues.forEach(issue => console.log(`   ❌ ${issue}`));
    } else {
        console.log('\n✅ Monitoring completed successfully');
        console.log('   Continue with manual verification steps above');
    }
}

// Execute monitoring
monitorAutomaticUsers().then(() => {
    console.log('\n🏁 User monitoring check completed');
}).catch(err => {
    console.error('💥 Critical error:', err.message);
});