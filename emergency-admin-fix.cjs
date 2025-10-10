const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

async function debugAdminSystem() {
    console.log('🔍 KOMPLETNA DIAGNOSTYKA ADMIN SYSTEM');
    console.log('=====================================');
    
    // 1. Sprawdź environment variables
    console.log('\n1. ENVIRONMENT VARIABLES:');
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ NOT SET');
    console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    // 2. Połącz z bazą
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    
    try {
        await client.connect();
        console.log('\n2. DATABASE CONNECTION: ✅ SUCCESS');
        
        // 3. Sprawdź wszystkich adminów
        console.log('\n3. WSZYSCY ADMIN USERS:');
        const adminUsers = await client.query(`
            SELECT id, username, email, is_admin, created_at 
            FROM users 
            WHERE is_admin = true
        `);
        
        if (adminUsers.rows.length === 0) {
            console.log('❌ BRAK ADMIN USERS!');
        } else {
            adminUsers.rows.forEach(admin => {
                console.log(`✅ Admin found: ${admin.email} (username: ${admin.username})`);
            });
        }
        
        // 4. Sprawdź wszystkich userów z email zawierającym 'admin'
        console.log('\n4. USERS Z "ADMIN" W EMAIL:');
        const adminEmails = await client.query(`
            SELECT id, username, email, is_admin 
            FROM users 
            WHERE email ILIKE '%admin%'
        `);
        
        adminEmails.rows.forEach(user => {
            console.log(`${user.is_admin ? '✅' : '❌'} ${user.email} (admin: ${user.is_admin})`);
        });
        
        // 5. Utwórz emergency admin
        console.log('\n5. TWORZĘ EMERGENCY ADMIN:');
        const emergencyEmail = 'emergency@admin.com';
        const emergencyPassword = 'admin123456';
        
        // Sprawdź czy emergency admin już istnieje
        const existingEmergency = await client.query(
            'SELECT * FROM users WHERE email = $1', 
            [emergencyEmail]
        );
        
        if (existingEmergency.rows.length > 0) {
            console.log('⚠️ Emergency admin already exists');
        } else {
            const hashedPassword = await bcrypt.hash(emergencyPassword, 12);
            const { v4: uuidv4 } = require('uuid');
            const adminId = uuidv4();
            const now = new Date().toISOString();
            
            await client.query(`
                INSERT INTO users (
                    id, username, password, email, is_admin, has_subscription, 
                    is_online, is_blocked, created_at, last_seen
                ) VALUES (
                    $1, 'emergency_admin', $2, $3, 
                    true, true, false, false, $6::timestamp, $7::timestamp
                )
            `, [adminId, hashedPassword, emergencyEmail, now, now]);
            
            console.log(`✅ Emergency admin created!`);
            console.log(`📧 Email: ${emergencyEmail}`);
            console.log(`🔑 Password: ${emergencyPassword}`);
        }
        
        // 6. Test logowania
        console.log('\n6. TEST EMERGENCY LOGIN:');
        const loginTest = await client.query(
            'SELECT * FROM users WHERE email = $1', 
            [emergencyEmail]
        );
        
        if (loginTest.rows.length > 0) {
            const user = loginTest.rows[0];
            console.log(`✅ User found: ${user.email}`);
            console.log(`✅ Is admin: ${user.is_admin}`);
            console.log(`✅ Password hash exists: ${!!user.password}`);
            
            // Test password
            const passwordMatch = await bcrypt.compare(emergencyPassword, user.password);
            console.log(`✅ Password matches: ${passwordMatch}`);
        }
        
    } catch (error) {
        console.error('❌ Database error:', error);
    } finally {
        await client.end();
    }
}

debugAdminSystem().catch(console.error);