// Monitor deployment na Render - sprawdza co 30 sekund
const https = require('https');

let checkCount = 0;
const maxChecks = 20; // 10 minut maximum

async function monitorDeployment() {
    checkCount++;
    console.log(`\n🔄 CHECK #${checkCount} - ${new Date().toLocaleTimeString()}`);
    console.log('==========================================');
    
    if (checkCount > maxChecks) {
        console.log('⏰ Timeout - sprawdzenie przerwane po 10 minutach');
        return;
    }
    
    try {
        // Test głównej strony
        const homeTest = await makeRequest('/');
        console.log('🏠 Home page:', homeTest.status === 200 ? '✅ OK' : `❌ ${homeTest.status}`);
        
        // Test API health
        const healthTest = await makeRequest('/api/health');
        console.log('🏥 Health check:', healthTest.status === 200 ? '✅ OK' : `❌ ${healthTest.status}`);
        
        // Test users count  
        const usersTest = await makeRequest('/api/users/count');
        console.log('👥 Users count:', usersTest.status === 200 ? `✅ ${usersTest.data}` : `❌ ${usersTest.status}`);
        
        // Jeśli wszystko działa, sprawdź admin
        if (homeTest.status === 200 && healthTest.status === 200) {
            console.log('\n🎉 APLIKACJA DZIAŁA! Sprawdzam admin...');
            
            // Test admin login
            const adminTest = await testAdminLogin('admin@wp.pl', 'admin');
            console.log('🔐 Admin login test:', adminTest);
            
            console.log('\n✅ DEPLOYMENT SUCCESSFUL - aplikacja działa!');
            return; // Stop monitoring
        }
        
    } catch (error) {
        console.log('❌ Error during check:', error.message);
    }
    
    // Schedule next check
    console.log('⏳ Następne sprawdzenie za 30 sekund...');
    setTimeout(monitorDeployment, 30000);
}

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'automentor.onrender.com',
            port: 443,
            path: path,
            method: 'GET',
            timeout: 10000
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsedData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data.substring(0, 100) });
                }
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Timeout')));
        req.end();
    });
}

async function testAdminLogin(email, password) {
    try {
        const postData = JSON.stringify({ email, password });
        
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
        
        return new Promise((resolve, reject) => {
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
            
            req.on('error', reject);
            req.write(postData);
            req.end();
        });
        
    } catch (error) {
        return `❌ Error: ${error.message}`;
    }
}

console.log('🚀 STARTING RENDER DEPLOYMENT MONITOR');
console.log('Sprawdzam aplikację co 30 sekund...');
console.log('Naciśnij Ctrl+C żeby zatrzymać monitoring');

monitorDeployment();