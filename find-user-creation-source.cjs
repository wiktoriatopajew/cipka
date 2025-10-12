const axios = require('axios');

async function findUsersCreationSource() {
    console.log('🔍 SEARCHING FOR USER CREATION SOURCE');
    console.log('====================================\n');

    const suspiciousUsers = [
        "lolus123",
        "132312", 
        "dupa123"
    ];

    const suspiciousEmails = [
        "cn23hindustrialpolska@gmail.com",
        "hapsci2wsmak@o2.pl",
        "hapsci222wsmak@o2.pl"
    ];

    console.log('🎯 Suspicious users to investigate:');
    suspiciousUsers.forEach((user, i) => {
        console.log(`   ${i+1}. ${user} (${suspiciousEmails[i]})`);
    });
    
    console.log('\n🚨 POSSIBLE SOURCES TO CHECK:\n');

    console.log('1. 📊 ENVIRONMENT VARIABLES:');
    console.log('   Check if these credentials are stored in:');
    console.log('   - .env file');
    console.log('   - render.yaml');
    console.log('   - Environment variables on Render dashboard');
    console.log('   - Any config files\n');

    console.log('2. 🧪 TEST/DEBUG ENDPOINTS:');
    console.log('   Look for endpoints that might create test users:');
    console.log('   - /api/debug/create-test-users');
    console.log('   - /api/test/populate-users'); 
    console.log('   - /api/admin/init-demo-data');
    console.log('   - Any debug or test endpoints\n');

    console.log('3. 🔄 INITIALIZATION SCRIPTS:');
    console.log('   Check these files for user creation:');
    console.log('   - server/index.ts (startup scripts)');
    console.log('   - server/db.ts (database initialization)');
    console.log('   - Any migration files');
    console.log('   - package.json scripts\n');

    console.log('4. 📝 DATABASE SEEDING:');
    console.log('   Look for:');
    console.log('   - seed.js/seed.ts files');
    console.log('   - Demo data creation');
    console.log('   - Default user creation in init functions\n');

    console.log('5. 🤖 AUTOMATIC PROCESSES:');
    console.log('   Check for:');
    console.log('   - Scheduled tasks (cron, setInterval)');
    console.log('   - Health checks that create users');
    console.log('   - Monitoring scripts');
    console.log('   - Background processes\n');

    console.log('6. 🔐 HARDCODED CREDENTIALS:');
    console.log('   Search codebase for:');
    console.log('   - "lolus123" string');
    console.log('   - "dupa123" string'); 
    console.log('   - "132312" string');
    console.log('   - "hapsci" string');
    console.log('   - "cn23hindustrialpolska" string\n');

    console.log('⚡ IMMEDIATE ACTIONS:\n');

    console.log('🔍 1. SEARCH CODEBASE:');
    console.log('   Run these commands in your project folder:');
    console.log('   - grep -r "lolus123" .');
    console.log('   - grep -r "dupa123" .');
    console.log('   - grep -r "hapsci" .');
    console.log('   - grep -r "cn23hindustrialpolska" .\n');

    console.log('🌐 2. CHECK RENDER DASHBOARD:');
    console.log('   - Go to Environment Variables');
    console.log('   - Look for any variables with these usernames/emails');
    console.log('   - Check Deploy Logs for user creation messages\n');

    console.log('📧 3. CHECK .ENV FILES:');
    console.log('   Look in all .env files for:');
    console.log('   - TEST_USER_*');
    console.log('   - DEMO_USER_*'); 
    console.log('   - DEFAULT_USER_*');
    console.log('   - Any variables with these credentials\n');

    console.log('🗂️ 4. CHECK CONFIG FILES:');
    console.log('   Look in:');
    console.log('   - render.yaml');
    console.log('   - package.json');
    console.log('   - Any .config.js files');
    console.log('   - ecosystem.config.js\n');

    try {
        // Try to get current user count
        const response = await axios.get('https://chatwithmechanic.com/api/health', { timeout: 5000 });
        console.log(`📊 Current user count: ${response.data.usersCount}`);
        console.log('Monitor this number to see if it increases automatically!\n');
    } catch (error) {
        console.log('❌ Could not check current user count\n');
    }

    console.log('🚨 CRITICAL NEXT STEPS:');
    console.log('======================');
    console.log('1. Search your codebase for these exact strings');
    console.log('2. Check all environment variables on Render');
    console.log('3. Look at Render deployment logs');
    console.log('4. Monitor user count every few minutes');
    console.log('5. If found - remove the source and delete the users\n');

    console.log('💡 TIP: These users were created exactly at the same time,');
    console.log('   which suggests they are created by a script, not manual registration!');
}

// Run the investigation
findUsersCreationSource();