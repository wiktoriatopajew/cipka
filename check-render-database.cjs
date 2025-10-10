// Sprawdzenie bazy danych na Render - najpierw sprawdzimy environment variables
const https = require('https');

async function checkRenderDatabase() {
    console.log('🗄️ SPRAWDZANIE BAZY DANYCH NA RENDER');
    console.log('====================================');
    
    // Test czy możemy uzyskać informacje o bazie poprzez API endpoint
    console.log('\n1. Sprawdzam czy endpoint /api/users/count działa...');
    
    try {
        const usersCount = await makeAPIRequest('/api/users/count');
        console.log('✅ Users count response:', usersCount);
        
        console.log('\n2. Sprawdzam wszystkich adminów...');
        const admins = await makeAPIRequest('/api/admin/users');
        console.log('✅ Admin users:', admins);
        
    } catch (error) {
        console.log('❌ API Error:', error.message);
        
        // Jeśli API nie działa, sprawdzimy bezpośrednio
        console.log('\n🔧 API nie działa, spróbuję bezpośredniego dostępu...');
        
        // Sprawdzimy czy możemy uzyskać database connection string
        console.log('Potrzebuję sprawdzić Render dashboard dla DATABASE_URL');
    }
}

function makeAPIRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'automentor.onrender.com',
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Database Check Tool'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        resolve(response);
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
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

checkRenderDatabase().catch(console.error);