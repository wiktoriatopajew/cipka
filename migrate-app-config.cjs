const Database = require('better-sqlite3');
const path = require('path');

async function migrateAppConfig() {
  const dbPath = path.join(__dirname, 'database.sqlite');
  const db = new Database(dbPath);

  try {
    console.log('🔧 Creating app_config table...');
    
    // Create app_config table
    db.exec(`
      CREATE TABLE IF NOT EXISTS app_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        -- Stripe Configuration
        stripe_publishable_key TEXT,
        stripe_secret_key TEXT,
        stripe_webhook_secret TEXT,
        
        -- PayPal Configuration
        paypal_client_id TEXT,
        paypal_client_secret TEXT,
        paypal_webhook_id TEXT,
        paypal_mode TEXT DEFAULT 'sandbox',
        
        -- SMTP Email Configuration
        smtp_host TEXT,
        smtp_port INTEGER,
        smtp_secure INTEGER DEFAULT 1,
        smtp_user TEXT,
        smtp_pass TEXT,
        email_from TEXT,
        email_from_name TEXT DEFAULT 'AutoMentor',
        
        -- General Settings
        app_name TEXT DEFAULT 'AutoMentor',
        app_url TEXT DEFAULT 'http://localhost:5000',
        support_email TEXT,
        
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Insert default configuration if table is empty
    const existingConfig = db.prepare('SELECT COUNT(*) as count FROM app_config').get();
    
    if (existingConfig.count === 0) {
      console.log('📝 Inserting default app configuration...');
      
      // Get current env values if they exist
      require('dotenv').config();
      
      db.prepare(`
        INSERT INTO app_config (
          stripe_publishable_key,
          stripe_secret_key,
          paypal_client_id,
          paypal_client_secret,
          paypal_mode,
          smtp_host,
          smtp_port,
          smtp_secure,
          smtp_user,
          smtp_pass,
          email_from,
          app_url,
          support_email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        process.env.STRIPE_PUBLISHABLE_KEY || '',
        process.env.STRIPE_SECRET_KEY || '',
        process.env.PAYPAL_CLIENT_ID || '',
        process.env.PAYPAL_CLIENT_SECRET || '',
        process.env.PAYPAL_MODE || 'sandbox',
        process.env.SMTP_HOST || 'smtp.gmail.com',
        parseInt(process.env.SMTP_PORT) || 587,
        process.env.SMTP_SECURE === 'true' ? 1 : 0,
        process.env.SMTP_USER || '',
        process.env.SMTP_PASS || '',
        process.env.EMAIL_FROM || process.env.SMTP_USER || '',
        process.env.APP_URL || 'http://localhost:5000',
        process.env.SUPPORT_EMAIL || process.env.SMTP_USER || ''
      );
    }

    console.log('✅ App configuration table created successfully!');
    
    // Show current configuration (without sensitive data)
    const config = db.prepare('SELECT * FROM app_config WHERE id = 1').get();
    if (config) {
      console.log('\n📋 Current configuration:');
      console.log(`   App Name: ${config.app_name}`);
      console.log(`   App URL: ${config.app_url}`);
      console.log(`   Support Email: ${config.support_email || 'Not set'}`);
      console.log(`   Stripe Keys: ${config.stripe_secret_key ? 'SET' : 'NOT SET'}`);
      console.log(`   PayPal Keys: ${config.paypal_client_id ? 'SET' : 'NOT SET'}`);
      console.log(`   PayPal Mode: ${config.paypal_mode}`);
      console.log(`   SMTP Host: ${config.smtp_host || 'Not set'}`);
      console.log(`   SMTP User: ${config.smtp_user ? 'SET' : 'NOT SET'}`);
      console.log(`   Email From: ${config.email_from || 'Not set'}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

migrateAppConfig();