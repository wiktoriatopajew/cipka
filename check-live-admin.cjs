// Sprawdzenie admin users bezpośrednio przez API lub utworzenie nowego
const https = require('https');

async function checkAndCreateAdmin() {
    console.log('🔍 SPRAWDZANIE ADMIN USERS NA LIVE APLIKACJI');
    console.log('============================================');
    
    // Najpierw sprawdzmy czy możemy uzyskać jakiekolwiek informacje o userach
    console.log('\n1. Sprawdzam wszystkich users...');
    
    try {
        // Test czy mogę uzyskać informacje poprzez debug endpoint
        const response = await makeRequest('/api/users/count');
        console.log('✅ Users count:', response);
        
        console.log('\n2. Próbuję różne kombinacje admin credentials...');
        
        const credentials = [
            { email: 'admin@wp.pl', password: 'admin' },
            { email: 'admin@chatwithmechanic.com', password: 'admin' },
            { email: 'admin@example.com', password: 'admin123' },
            { email: 'admin', password: 'admin' },
            { email: 'administrator@wp.pl', password: 'admin' }
        ];
        
        for (const cred of credentials) {
            console.log(`\n🔐 Testing: ${cred.email} / ${cred.password}`);
            const result = await testLogin(cred.email, cred.password);
            console.log(`   Result: ${result}`);
            
            if (result.includes('SUCCESS')) {
                console.log(`🎉 ZNALAZŁEM DZIAŁAJĄCE CREDENTIALS: ${cred.email} / ${cred.password}`);
                return;
            }
        }
        
        console.log('\n❌ Żadne credentials nie działają!');
        console.log('\n3. Sprawdzam czy mogę utworzyć nowego admin poprzez API...');
        
        // Sprawdzenie czy istnieje endpoint do tworzenia admin
        await testCreateAdmin();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'chatwithmechanic.com',
            port: 443,
            path: path,
            method: 'GET'
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    resolve(data);
                }
            });
        });
        
        req.on('error', reject);
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
                    resolve(`❌ ${res.statusCode}: ${data.substring(0, 100)}`);
                }
            });
        });
        
        req.on('error', (e) => resolve(`❌ Error: ${e.message}`));
        req.write(postData);
        req.end();
    });
}

async function testCreateAdmin() {
    // Sprawdzenie czy mogę stworzyć admin user poprzez jakiś endpoint
    console.log('Sprawdzam dostępne admin endpoints...');
    
    const endpoints = [
        '/api/admin/create',
        '/api/setup/admin', 
        '/api/init/admin',
        '/api/debug/users'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const result = await makeRequest(endpoint);
            console.log(`${endpoint}: ${JSON.stringify(result).substring(0, 100)}`);
        } catch (e) {
            console.log(`${endpoint}: Error - ${e.message}`);
        }
    }
}

checkAndCreateAdmin().catch(console.error);