const axios = require('axios');

async function checkUserPatterns() {
    console.log('🔍 CHECKING USER REGISTRATION PATTERNS');
    console.log('=====================================\n');

    try {
        // Check multiple endpoints for user data
        const endpoints = [
            'https://chatwithmechanic.com/api/debug/database',
            'https://chatwithmechanic.com/api/health'
        ];

        for (const url of endpoints) {
            console.log(`🎯 Checking: ${url}`);
            try {
                const response = await axios.get(url, {
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (url.includes('health')) {
                    console.log(`✅ Users Count: ${response.data.usersCount}`);
                    console.log(`📅 Timestamp: ${response.data.timestamp}\n`);
                } else if (url.includes('debug')) {
                    const data = response.data;
                    if (data.connectionTest) {
                        console.log(`✅ ${data.connectionTest}`);
                        console.log(`🏢 Database Host: ${data.database?.DATABASE_URL_HOST || 'Unknown'}`);
                        console.log(`🔧 Environment: ${data.database?.NODE_ENV || 'Unknown'}\n`);
                    }
                }
            } catch (err) {
                console.log(`❌ Error accessing ${url}: ${err.message}\n`);
            }
        }

        // Generate monitoring recommendations
        console.log('🚨 MANUAL VERIFICATION REQUIRED:');
        console.log('================================');
        console.log('1. 📧 Gmail Check:');
        console.log('   - Open Gmail: wiktoriatopajew@gmail.com');
        console.log('   - Search: "New User Login"');
        console.log('   - Count today\'s notifications');
        console.log('   - Look for time patterns (every X minutes)\n');

        console.log('2. 🔐 Admin Panel Check:');
        console.log('   - URL: https://chatwithmechanic.com/admin');
        console.log('   - Login: admin@wp.pl / admin');
        console.log('   - Go to Users section');
        console.log('   - Sort by registration date (newest first)');
        console.log('   - Look for suspicious patterns:\n');
        console.log('     ❓ Similar email patterns');
        console.log('     ❓ Registration timestamps too close');
        console.log('     ❓ Fake-looking names');
        console.log('     ❓ No chat history\n');

        console.log('3. 📊 Render Logs Check:');
        console.log('   - URL: https://dashboard.render.com');
        console.log('   - Select your service');
        console.log('   - Go to Logs tab');
        console.log('   - Search for: "User created" or "POST /api/auth"');
        console.log('   - Look for burst patterns\n');

        console.log('4. 🤖 Bot Detection Signs:');
        console.log('   ⚠️  Multiple users registered within minutes');
        console.log('   ⚠️  Similar IP addresses');
        console.log('   ⚠️  Email patterns (test@, bot@, etc.)');
        console.log('   ⚠️  No interaction after registration');
        console.log('   ⚠️  Default or similar usernames\n');

        console.log('🔍 If you find suspicious patterns:');
        console.log('   1. Note the user IDs/emails');
        console.log('   2. Check their IP addresses');
        console.log('   3. Look at registration timestamps');
        console.log('   4. See if they have any chat history');
        console.log('   5. Consider implementing rate limiting\n');

    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
    }
}

// Run the analysis
checkUserPatterns();