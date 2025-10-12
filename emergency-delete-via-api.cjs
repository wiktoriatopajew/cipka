const axios = require('axios');
const qs = require('querystring');

async function emergencyDeleteViAPI() {
    console.log('🚨 EMERGENCY DELETE VIA API');
    console.log('============================\n');

    const baseURL = 'https://chatwithmechanic.com';
    
    // Step 1: Login as admin
    console.log('🔐 Step 1: Logging in as admin...');
    
    try {
        const loginResponse = await axios.post(`${baseURL}/api/users/login`, {
            email: 'admin@wp.pl',
            password: 'admin'
        }, {
            timeout: 10000,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log(`✅ Admin login: ${loginResponse.status}`);
        
        // Get cookies for authenticated requests
        const cookies = loginResponse.headers['set-cookie'];
        const cookieHeader = cookies ? cookies.join('; ') : '';
        
        console.log('🍪 Got session cookie for admin');

        // Step 2: Get all users to find bot user IDs
        console.log('\n📋 Step 2: Getting user list...');
        
        const usersResponse = await axios.get(`${baseURL}/api/admin/users`, {
            timeout: 10000,
            headers: {
                'Cookie': cookieHeader,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log(`✅ Got ${usersResponse.data.length} users`);
        
        // Find bot users
        const botUsernames = ['lolus123', '132312', 'dupa123'];
        const botEmails = ['cn23hindustrialpolska@gmail.com', 'hapsci2wsmak@o2.pl', 'hapsci222wsmak@o2.pl'];
        
        const botsToDelete = [];
        
        usersResponse.data.forEach(user => {
            if (botUsernames.includes(user.username) || botEmails.includes(user.email)) {
                botsToDelete.push(user);
                console.log(`🎯 Found bot: ${user.username} (${user.email}) - ID: ${user.id}`);
            }
        });

        console.log(`\n🗑️ Found ${botsToDelete.length} bot users to delete`);

        // Step 3: Delete each bot user
        console.log('\n💀 Step 3: Deleting bot users...');
        
        let deletedCount = 0;
        
        for (const bot of botsToDelete) {
            try {
                console.log(`\n🗑️ Deleting: ${bot.username} (ID: ${bot.id})`);
                
                const deleteResponse = await axios.delete(`${baseURL}/api/admin/users/${bot.id}`, {
                    timeout: 10000,
                    headers: {
                        'Cookie': cookieHeader,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (deleteResponse.status === 200) {
                    console.log(`   ✅ Successfully deleted ${bot.username}`);
                    deletedCount++;
                } else {
                    console.log(`   ⚠️ Unexpected response: ${deleteResponse.status}`);
                }
                
                // Small delay between deletions
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (deleteError) {
                console.log(`   ❌ Failed to delete ${bot.username}: ${deleteError.message}`);
            }
        }

        console.log(`\n✅ DELETION COMPLETE: ${deletedCount}/${botsToDelete.length} users deleted`);

        // Step 4: Verify deletion
        console.log('\n✔️ Step 4: Verifying deletion...');
        
        const verifyResponse = await axios.get(`${baseURL}/api/health`, { timeout: 5000 });
        console.log(`📊 Current user count: ${verifyResponse.data.usersCount}`);

        // Step 5: Monitor for recreation
        console.log('\n⏰ Step 5: Monitoring for recreation...');
        console.log('   Waiting 30 seconds to see if bots recreate...');
        
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        const monitorResponse = await axios.get(`${baseURL}/api/health`, { timeout: 5000 });
        console.log(`📊 User count after 30s: ${monitorResponse.data.usersCount}`);
        
        if (monitorResponse.data.usersCount > verifyResponse.data.usersCount) {
            console.log('🚨 WARNING: User count INCREASED! Bots are being recreated!');
            console.log('🔥 ACTIVE PROCESS IS CREATING USERS IN REAL-TIME!');
        } else {
            console.log('✅ Good: User count stable - no immediate recreation');
        }

    } catch (error) {
        console.error('❌ Emergency deletion failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }

    console.log('\n🚨 CRITICAL NEXT ACTIONS:');
    console.log('=========================');
    console.log('1. 🔍 CHECK RENDER LOGS NOW for creation pattern');
    console.log('2. 🛑 FIND THE ACTIVE SCRIPT creating these users');
    console.log('3. ⏰ MONITOR user count every few minutes');
    console.log('4. 🔒 IMPLEMENT rate limiting on registration endpoint');
    console.log('5. 🚫 TEMPORARILY DISABLE user registration if needed');
}

// Run emergency deletion
emergencyDeleteViAPI().catch(console.error);