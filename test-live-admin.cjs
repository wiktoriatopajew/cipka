// Test admin login na live Render aplikacji
const https = require('https');

async function testLiveAdminLogin() {
    console.log('🌐 TESTING LIVE ADMIN LOGIN ON RENDER');
    console.log('=====================================');
    
    const credentials = [
        { email: 'admin@wp.pl', password: 'admin' },
        { email: 'admin@yourdomain.com', password: 'your-admin-password' },
        { email: 'admin', password: 'admin' },
        { email: 'admin@example.com', password: 'admin123' }
    ];
    
    for (const cred of credentials) {
        console.log(`\n🔐 Testing: ${cred.email} / ${cred.password}`);
        
        try {
            const result = await makeLoginRequest(cred.email, cred.password);
            console.log(`✅ Response:`, result);
        } catch (error) {
            console.log(`❌ Error:`, error.message);
        }
    }
}

function makeLoginRequest(email, password) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            email: email,
            password: password
        });
        
        const options = {
            hostname: 'automentor.onrender.com',
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
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(`Status: ${res.statusCode}, Data: ${JSON.stringify(response)}`);
                } catch (e) {
                    resolve(`Status: ${res.statusCode}, Raw: ${data}`);
                }
            });
        });
        
        req.on('error', (e) => {
            reject(e);
        });
        
        req.write(postData);
        req.end();
    });
}

testLiveAdminLogin().catch(console.error);