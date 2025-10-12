const axios = require('axios');

async function investigateBotUsers() {
    console.log('🚨 BOT USERS DETECTED - EMERGENCY ANALYSIS');
    console.log('==========================================\n');

    const suspiciousUsers = [
        {
            name: "lolus123",
            email: "cn23hindustrialpolska@gmail.com",
            created: "10/12/2025, 9:27:22 PM"
        },
        {
            name: "132312", 
            email: "hapsci2wsmak@o2.pl",
            created: "10/12/2025, 9:27:22 PM"
        },
        {
            name: "dupa123",
            email: "hapsci222wsmak@o2.pl", 
            created: "10/12/2025, 9:27:22 PM"
        }
    ];

    console.log('🔍 ANALYSIS OF SUSPICIOUS USERS:');
    console.log('================================');
    
    suspiciousUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. 🤖 SUSPICIOUS USER:`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Created: ${user.created}`);
        
        // Analyze patterns
        console.log(`   🚩 RED FLAGS:`);
        if (user.name.includes('123')) {
            console.log(`      ❌ Username contains '123' (bot pattern)`);
        }
        if (user.name.includes('dupa')) {
            console.log(`      ❌ Inappropriate username (likely test/bot)`);
        }
        if (user.email.includes('hapsci')) {
            console.log(`      ❌ Similar email pattern to other bots`);
        }
        if (user.email.includes('o2.pl')) {
            console.log(`      ❌ Same email domain as other bot`);
        }
    });

    console.log('\n⏰ TIMESTAMP ANALYSIS:');
    console.log('======================');
    console.log('🚨 ALL 3 USERS CREATED AT EXACTLY THE SAME TIME!');
    console.log('   This is IMPOSSIBLE for human registration');
    console.log('   Timestamp: 10/12/2025, 9:27:22 PM');
    console.log('   Time difference: 0 seconds between registrations');
    console.log('   CONCLUSION: Automated bot registration system\n');

    console.log('🎯 POSSIBLE SOURCES:');
    console.log('====================');
    console.log('1. 🤖 External bot attack on registration endpoint');
    console.log('2. 🔧 Internal testing script running repeatedly');
    console.log('3. 📊 Analytics/monitoring tool creating fake users');
    console.log('4. 🐛 Bug in registration system causing duplicates');
    console.log('5. 🌐 Load balancer/proxy issue causing multiple requests\n');

    console.log('🛡️ IMMEDIATE ACTIONS REQUIRED:');
    console.log('==============================');
    console.log('1. ✅ BLOCK REGISTRATION ENDPOINT temporarily');
    console.log('2. ✅ DELETE these 3 bot users from database');
    console.log('3. ✅ CHECK Render logs for registration attacks');
    console.log('4. ✅ IMPLEMENT rate limiting on /api/auth/register');
    console.log('5. ✅ ADD CAPTCHA to registration form');
    console.log('6. ✅ CHECK for similar patterns in user database\n');

    console.log('🔍 INVESTIGATION STEPS:');
    console.log('=======================');
    console.log('Step 1: Check current database for more bots');
    console.log('Step 2: Analyze Render logs around 9:27:22 PM');
    console.log('Step 3: Look for IP addresses of these registrations');
    console.log('Step 4: Implement security measures');
    console.log('Step 5: Delete bot accounts\n');

    try {
        // Get current user count to see if more were created
        console.log('📊 CHECKING CURRENT USER COUNT...');
        const response = await axios.get('https://chatwithmechanic.com/api/health', { timeout: 10000 });
        console.log(`Current total users: ${response.data.usersCount}`);
        console.log('If this number increased since last check, more bots were created!\n');
        
    } catch (error) {
        console.log(`❌ Could not check current user count: ${error.message}\n`);
    }

    console.log('⚡ NEXT IMMEDIATE ACTIONS:');
    console.log('=========================');
    console.log('1. Tell admin to DELETE these users from admin panel');
    console.log('2. Check Render dashboard logs NOW');
    console.log('3. Implement emergency rate limiting');
    console.log('4. Block suspicious IP addresses');
    console.log('5. Add registration protection\n');

    console.log('🚨 THIS IS A SECURITY INCIDENT - ACT FAST!');
}

// Run investigation
investigateBotUsers();