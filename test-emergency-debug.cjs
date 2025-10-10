// Test emergency debug endpoint po deployment
const https = require('https');

async function testEmergencyDebug() {
    console.log('🚨 TESTING EMERGENCY DEBUG ENDPOINT');
    console.log('===================================');
    
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
        attempts++;
        console.log(`\n🔄 Attempt #${attempts} - ${new Date().toLocaleTimeString()}`);
        
        try {
            const result = await makeRequest('/api/debug/admin');
            console.log('✅ Emergency Debug Response:');
            console.log(JSON.stringify(result, null, 2));
            
            // Jeśli dostaliśmy response z credentials, przetestuj login
            if (result.credentials) {
                console.log('\n🔐 Testing emergency admin login...');
                const loginResult = await testLogin(result.credentials.email, result.credentials.password);
                console.log('Login result:', loginResult);
                
                if (loginResult.includes('SUCCESS')) {
                    console.log('🎉 EMERGENCY ADMIN DZIAŁA!');
                    console.log(`📧 Email: ${result.credentials.email}`);
                    console.log(`🔑 Password: ${result.credentials.password}`);
                    return;
                }
            } else if (result.adminUsers && result.adminUsers.length > 0) {
                console.log('\n✅ Admin users already exist:');
                result.adminUsers.forEach(admin => {
                    console.log(`   - ${admin.email} (${admin.username})`);
                });
                
                // Spróbuj standardowych credentials
                console.log('\n🔐 Testing standard credentials...');
                for (const admin of result.adminUsers) {
                    const loginTest = await testLogin(admin.email, 'admin');
                    console.log(`${admin.email}/admin: ${loginTest}`);
                    
                    if (loginTest.includes('SUCCESS')) {
                        console.log(`🎉 WORKING CREDENTIALS: ${admin.email} / admin`);
                        return;
                    }
                }
                return;
            }
            
            break;
            
        } catch (error) {
            console.log(`❌ Attempt ${attempts} failed:`, error.message);
            
            if (attempts < maxAttempts) {
                console.log('⏳ Waiting 30 seconds for deployment...');
                await new Promise(resolve => setTimeout(resolve, 30000));
            }
        }
    }
    
    console.log('❌ All attempts failed - deployment may have issues');
}

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'chatwithmechanic.com',
            port: 443,
            path: path,
            method: 'GET',
            timeout: 15000
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    if (res.statusCode === 200) {
                        resolve({ raw: data.substring(0, 200) });
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 100)}`));
                    }
                }
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Request timeout')));
        req.end();
    });
}

async function testLogin(email, password) {
    return new Promise((resolve) => {
        const postData = JSON.stringify({ email, password });
        
        const options = {
            hostname: 'chatwithmechanic.com',
            port: 443,
            path: '/api/admin/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve('✅ LOGIN SUCCESS');
                } else {
                    resolve(`❌ ${res.statusCode}: ${data.substring(0, 50)}`);
                }
            });
        });
        
        req.on('error', (e) => resolve(`❌ Error: ${e.message}`));
        req.write(postData);
        req.end();
    });
}

testEmergencyDebug().catch(console.error);