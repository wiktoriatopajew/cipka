const axios = require('axios');

async function debugUserCreation() {
    console.log('🔬 DEBUGGING AUTOMATIC USER CREATION');
    console.log('====================================\n');

    console.log('🎯 THEORY: The users are being created by some automatic process');
    console.log('   - All 3 users created at EXACT same time: 10/12/2025, 9:27:22 PM');
    console.log('   - This suggests automated script, not manual registration\n');

    console.log('🕒 TIMING ANALYSIS:');
    console.log('   Creation time: 10/12/2025, 9:27:22 PM');
    console.log('   Current time : ' + new Date().toLocaleString());
    console.log('   Time zone    : Local timezone');
    console.log('   Server time  : Production server timezone\n');

    try {
        // Check current user count multiple times to detect changes
        console.log('📊 MONITORING USER COUNT CHANGES:');
        
        for (let i = 0; i < 3; i++) {
            try {
                const response = await axios.get('https://chatwithmechanic.com/api/health', { 
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                const currentTime = new Date().toISOString();
                console.log(`   ${i + 1}. Count: ${response.data.usersCount} at ${currentTime}`);
                
                if (i < 2) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                }
            } catch (error) {
                console.log(`   ${i + 1}. Error: ${error.message}`);
            }
        }
    } catch (error) {
        console.log('❌ Could not monitor user count changes');
    }

    console.log('\n🔍 LIKELY CAUSES:');
    console.log('=================');
    
    console.log('1. 🤖 RENDER DEPLOYMENT SCRIPT:');
    console.log('   - Check if Render runs any init scripts on deploy');
    console.log('   - Look for scripts that create demo/test users');
    console.log('   - Check Render deploy logs for user creation\n');

    console.log('2. 📦 DATABASE MIGRATION:');
    console.log('   - PostgreSQL migration might create test data');
    console.log('   - Check drizzle migrations for user inserts');
    console.log('   - Look for seed data in migration files\n');

    console.log('3. 🔧 HEALTH CHECK ENDPOINT:');
    console.log('   - Some monitoring might trigger user creation');
    console.log('   - Check if /api/health or other endpoints create users');
    console.log('   - Look for side effects in API endpoints\n');

    console.log('4. 🕐 SCHEDULED TASK:');
    console.log('   - Some cron job or scheduled task creates users');
    console.log('   - Check for setInterval or scheduled functions');
    console.log('   - Look for background processes\n');

    console.log('5. 📊 ANALYTICS/MONITORING:');
    console.log('   - Analytics scripts might create fake user data');
    console.log('   - Check for demo data generation');
    console.log('   - Look for testing/monitoring tools\n');

    console.log('🚨 IMMEDIATE ACTION PLAN:');
    console.log('=========================');
    
    console.log('✅ 1. DELETE THE USERS FIRST (from admin panel):');
    console.log('   - Go to: https://chatwithmechanic.com/admin');
    console.log('   - Delete: lolus123, 132312, dupa123');
    console.log('   - This stops any potential damage\n');

    console.log('🔍 2. CHECK RENDER DASHBOARD:');
    console.log('   - Go to: https://dashboard.render.com');
    console.log('   - Check Deploy Logs around 9:27:22 PM today');
    console.log('   - Look for "User created" or "INSERT INTO users"');
    console.log('   - Check Environment Variables for test users\n');

    console.log('📊 3. MONITOR FOR RE-CREATION:');
    console.log('   - After deleting, wait 10-15 minutes');
    console.log('   - Check if users are created again');
    console.log('   - If yes - it\'s an active process!');
    console.log('   - If no - it was a one-time script\n');

    console.log('🔧 4. CHECK THESE FILES:');
    console.log('   - server/index.ts (startup processes)');
    console.log('   - Any migration files');
    console.log('   - package.json scripts');
    console.log('   - Render build/start commands\n');

    console.log('💡 DEBUGGING TIP:');
    console.log('   The exact same timestamp (9:27:22 PM) for all 3 users');
    console.log('   means they were created in a single operation/script,');
    console.log('   not individual registrations!\n');

    console.log('⚡ NEXT STEP: Delete users and monitor for recreation!');
}

// Run the debug analysis
debugUserCreation();