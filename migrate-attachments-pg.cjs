const Database = require('better-sqlite3');
const { Client } = require('pg');

// PostgreSQL connection using Render external URL (no port needed)
const connectionString = 'postgresql://automentor_db_user:5VpcIDdEOOyvQWeE36f6nMir3ofwythZ@dpg-d3j3iojuibrs73dac2e0-a.oregon-postgres.render.com/automentor_db';

async function migrateAttachments() {
  console.log('🔄 Starting attachments migration with direct PostgreSQL...\n');
  
  let sqliteDb = null;
  let pgClient = null;
  
  try {
    // Connect to SQLite
    sqliteDb = new Database('./database.sqlite', { readonly: true });
    console.log('✅ Connected to SQLite');
    
    // Connect to PostgreSQL
    pgClient = new Client({ connectionString });
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Get all attachments from SQLite
    const attachments = sqliteDb.prepare('SELECT * FROM attachments ORDER BY uploaded_at').all();
    console.log(`📁 Found ${attachments.length} attachments in SQLite`);
    
    if (attachments.length === 0) {
      console.log('❌ No attachments to migrate');
      return;
    }
    
    // Check what's already in PostgreSQL
    const existingResult = await pgClient.query('SELECT id FROM attachments');
    const existingIds = new Set(existingResult.rows.map(r => r.id));
    console.log(`📊 ${existingIds.size} attachments already in PostgreSQL`);
    
    // Filter out already migrated attachments
    const toMigrate = attachments.filter(att => !existingIds.has(att.id));
    console.log(`🚀 Need to migrate ${toMigrate.length} new attachments`);
    
    if (toMigrate.length === 0) {
      console.log('✅ All attachments already migrated!');
      return;
    }
    
    // Prepare insert statement
    const insertQuery = `
      INSERT INTO attachments (id, message_id, file_name, original_name, file_size, mime_type, file_path, uploaded_at, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    
    // Migrate one by one for better error handling
    let migrated = 0;
    let errors = 0;
    
    for (const att of toMigrate) {
      try {
        const filePath = att.file_path.replace(/\\\\/g, '/'); // Fix Windows paths
        
        await pgClient.query(insertQuery, [
          att.id,
          att.message_id,
          att.file_name,
          att.original_name,
          att.file_size,
          att.mime_type,
          filePath,
          att.uploaded_at,
          att.expires_at
        ]);
        
        migrated++;
        
        if (migrated % 5 === 0) {
          console.log(`✅ Migrated ${migrated}/${toMigrate.length} attachments...`);
        }
        
      } catch (error) {
        errors++;
        console.error(`❌ Error migrating ${att.file_name}:`, error.message);
        
        if (errors > 5) {
          console.log('Too many errors, stopping migration');
          break;
        }
      }
    }
    
    console.log(`\n🎉 Migration completed! Migrated ${migrated} attachments (${errors} errors)`);
    
    // Verify specific file
    const specificResult = await pgClient.query(
      'SELECT * FROM attachments WHERE file_name = $1',
      ['file-1759338166036-139982218.jpg']
    );
    
    if (specificResult.rows.length > 0) {
      console.log('✅ Verified problematic file is now in PostgreSQL:', specificResult.rows[0].file_name);
    } else {
      console.log('❌ Problematic file still not found in PostgreSQL');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
  } finally {
    if (sqliteDb) sqliteDb.close();
    if (pgClient) await pgClient.end();
  }
}

migrateAttachments();