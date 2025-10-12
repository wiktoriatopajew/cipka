const { Pool } = require('pg');

async function emergencyDeleteBotUsers() {
    console.log('🚨 EMERGENCY: DELETING BOT USERS FROM DATABASE');
    console.log('===============================================\n');

    // Database connection
    const connectionString = 'postgresql://automentor_db_user:5VpcIDdEOOyvQWeE36f6nMir3ofwythZ@dpg-d3j3iojuibrs73dac2e0-a/automentor_db';
    
    const pool = new Pool({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        // First, let's see current users
        console.log('📊 CURRENT USERS IN DATABASE:');
        const allUsersResult = await pool.query(`
            SELECT id, username, email, created_at, is_admin 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 20
        `);
        
        console.log(`Found ${allUsersResult.rows.length} recent users:`);
        allUsersResult.rows.forEach((user, i) => {
            console.log(`   ${i+1}. ${user.username} (${user.email}) - ${user.created_at} - Admin: ${user.is_admin}`);
        });

        console.log('\n🎯 IDENTIFYING BOT USERS TO DELETE:');
        
        // Find the specific bot users
        const botUsers = [
            'lolus123',
            '132312', 
            'dupa123'
        ];
        
        const botEmails = [
            'cn23hindustrialpolska@gmail.com',
            'hapsci2wsmak@o2.pl',
            'hapsci222wsmak@o2.pl'
        ];

        // Delete by username and email
        let deletedCount = 0;
        
        for (let i = 0; i < botUsers.length; i++) {
            const username = botUsers[i];
            const email = botEmails[i];
            
            console.log(`\n🗑️ Deleting user: ${username} (${email})`);
            
            try {
                // First check if user exists
                const checkResult = await pool.query(
                    'SELECT id, username, email FROM users WHERE username = $1 OR email = $2',
                    [username, email]
                );
                
                if (checkResult.rows.length > 0) {
                    console.log(`   ✅ Found user: ${checkResult.rows[0].username} (${checkResult.rows[0].email})`);
                    
                    // Delete the user
                    const deleteResult = await pool.query(
                        'DELETE FROM users WHERE username = $1 OR email = $2',
                        [username, email]
                    );
                    
                    console.log(`   ✅ Deleted ${deleteResult.rowCount} user(s)`);
                    deletedCount += deleteResult.rowCount;
                } else {
                    console.log(`   ⚠️ User ${username} not found (might be already deleted)`);
                }
            } catch (error) {
                console.log(`   ❌ Error deleting ${username}: ${error.message}`);
            }
        }

        console.log(`\n✅ DELETION SUMMARY: ${deletedCount} bot users deleted`);

        // Check final user count
        const finalCountResult = await pool.query('SELECT COUNT(*) as count FROM users');
        console.log(`📊 Final user count: ${finalCountResult.rows[0].count}`);

        // Also delete any users with suspicious patterns
        console.log('\n🔍 CHECKING FOR OTHER SUSPICIOUS USERS:');
        
        const suspiciousResult = await pool.query(`
            SELECT id, username, email, created_at 
            FROM users 
            WHERE username LIKE '%123%' 
               OR email LIKE '%hapsci%' 
               OR email LIKE '%cn23%'
               OR username = '132312'
            ORDER BY created_at DESC
        `);
        
        if (suspiciousResult.rows.length > 0) {
            console.log(`⚠️ Found ${suspiciousResult.rows.length} additional suspicious users:`);
            suspiciousResult.rows.forEach((user, i) => {
                console.log(`   ${i+1}. ${user.username} (${user.email}) - ${user.created_at}`);
            });
            
            // Delete them too
            const cleanupResult = await pool.query(`
                DELETE FROM users 
                WHERE username LIKE '%123%' 
                   OR email LIKE '%hapsci%' 
                   OR email LIKE '%cn23%'
                   OR username = '132312'
            `);
            
            console.log(`🧹 Cleaned up ${cleanupResult.rowCount} additional suspicious users`);
        } else {
            console.log('✅ No additional suspicious users found');
        }

    } catch (error) {
        console.error('❌ Database operation failed:', error.message);
    } finally {
        await pool.end();
    }

    console.log('\n🚨 NEXT CRITICAL STEPS:');
    console.log('=======================');
    console.log('1. ⏰ MONITOR: Check if users recreate in next 5-10 minutes');
    console.log('2. 🔍 FIND SOURCE: We must find what creates these users!');
    console.log('3. 🛑 STOP PROCESS: Disable the automatic creation');
    console.log('4. 🔒 SECURE: Prevent this from happening again');
    
    console.log('\n💡 IF THEY RECREATE IMMEDIATELY:');
    console.log('   - There is an active loop/script creating them');
    console.log('   - We need to find and stop it ASAP');
    console.log('   - Check server logs, scheduled tasks, etc.');
}

// Run emergency deletion
emergencyDeleteBotUsers().catch(console.error);