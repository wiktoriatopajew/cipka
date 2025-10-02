import Database from 'better-sqlite3';

// Migration to add Google Ads configuration table
async function addGoogleAdsConfig() {
  console.log('🔄 Adding Google Ads configuration table...');
  
  const db = new Database('./database.sqlite');
  
  try {
    // Check if table already exists
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='google_ads_config'
    `).get();
    
    if (tableExists) {
      console.log('✅ google_ads_config table already exists');
      return;
    }

    console.log('➕ Creating google_ads_config table...');
    
    // Create Google Ads configuration table
    db.prepare(`
      CREATE TABLE google_ads_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversion_id TEXT NOT NULL,
        purchase_label TEXT NOT NULL,
        signup_label TEXT NOT NULL,
        enabled BOOLEAN DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    // Insert default configuration (disabled until user provides real values)
    db.prepare(`
      INSERT INTO google_ads_config 
      (conversion_id, purchase_label, signup_label, enabled) 
      VALUES (?, ?, ?, ?)
    `).run('AW-CONVERSION_ID', 'PURCHASE_CONVERSION_LABEL', 'SIGNUP_CONVERSION_LABEL', 0);
    
    console.log('✅ Google Ads configuration table created successfully!');
    console.log('📊 Default configuration added (disabled)');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

addGoogleAdsConfig()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });