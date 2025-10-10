// Test czy aplikacja w ogóle działa na Render
const https = require('https');

async function testRenderApp() {
    console.log('🌐 TESTING RENDER APP STATUS');
    console.log('============================');
    
    const endpoints = [
        '/',
        '/api/health', 
        '/api/users/count',
        '/admin',
        '/api/admin/login'
    ];
    
    for (const endpoint of endpoints) {
        console.log(`\n🔗 Testing: https://automentor.onrender.com${endpoint}`);
        
        try {
            const result = await makeGetRequest(endpoint);
            console.log(`✅ Response:`, result);
        } catch (error) {
            console.log(`❌ Error:`, error.message);
        }
    }
}

function makeGetRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'automentor.onrender.com',
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'User-Agent': 'Node.js Test Client'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const truncatedData = data.length > 200 ? 
                    data.substring(0, 200) + '...[truncated]' : data;
                resolve(`Status: ${res.statusCode}, Length: ${data.length}, Data: ${truncatedData}`);
            });
        });
        
        req.on('error', (e) => {
            reject(e);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.end();
    });
}

testRenderApp().catch(console.error);