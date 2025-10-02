import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function createBackup() {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const backupDir = `backups/backup-${timestamp}`;
    
    console.log('🔄 Creating backup...');
    
    // Create backup directory
    fs.mkdirSync(backupDir, { recursive: true });
    
    // Backup database
    if (fs.existsSync('database.sqlite')) {
      fs.copyFileSync('database.sqlite', `${backupDir}/database.sqlite`);
      console.log('✅ Database backed up');
    }
    
    // Backup uploads
    if (fs.existsSync('uploads')) {
      execSync(`xcopy uploads ${backupDir}\\uploads /E /I /H /Y`, { stdio: 'inherit' });
      console.log('✅ Uploads backed up');
    }
    
    // Backup environment (without sensitive data)
    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf8');
      const safeEnv = envContent
        .split('\n')
        .map(line => {
          if (line.includes('SECRET') || line.includes('PASSWORD') || line.includes('KEY')) {
            const [key] = line.split('=');
            return `${key}="REDACTED"`;
          }
          return line;
        })
        .join('\n');
      
      fs.writeFileSync(`${backupDir}/.env.template`, safeEnv);
      console.log('✅ Environment template backed up');
    }
    
    // Create backup info
    const backupInfo = {
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      nodeVersion: process.version,
      platform: process.platform
    };
    
    fs.writeFileSync(`${backupDir}/backup-info.json`, JSON.stringify(backupInfo, null, 2));
    
    console.log(`✅ Backup completed: ${backupDir}`);
    console.log('📦 Backup contents:');
    console.log('- Database snapshot');
    console.log('- Uploaded files');
    console.log('- Environment template');
    console.log('- Backup metadata');
    
  } catch (error) {
    console.error('❌ Backup failed:');
    console.error(error);
    process.exit(1);
  }
}

createBackup();