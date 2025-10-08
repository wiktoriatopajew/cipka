const Database = require('better-sqlite3');
const { Pool } = require('pg');
const fs = require('fs');

// Configuration
const LOCAL_DB_PATH = './database.sqlite';
const RENDER_DATABASE_URL = process.env.DATABASE_URL;

if (!RENDER_DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.log('Set it with: $env:DATABASE_URL="your_render_postgres_url"');
  process.exit(1);
}

async function migrateData() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL on Render...');
  
  // Connect to local SQLite
  const sqlite = new Database(LOCAL_DB_PATH, { readonly: true });
  
  // Connect to Render PostgreSQL
  const pg = new Pool({
    connectionString: RENDER_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Get all tables from SQLite
    const tables = sqlite.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();
    
    console.log(`📊 Found ${tables.length} tables in local SQLite:`, tables.map(t => t.name));
    
    let totalRecords = 0;
    
    for (const table of tables) {
      const tableName = table.name;
      console.log(`\n📋 Processing table: ${tableName}`);
      
      // Get table structure
      const columns = sqlite.prepare(`PRAGMA table_info(${tableName})`).all();
      console.log(`   Columns: ${columns.map(c => c.name).join(', ')}`);
      
      // Get all data from SQLite table
      const records = sqlite.prepare(`SELECT * FROM ${tableName}`).all();
      console.log(`   Records found: ${records.length}`);
      
      if (records.length === 0) {
        console.log(`   ⏭️  Skipping empty table`);
        continue;
      }
      
      // Create PostgreSQL table if it doesn't exist (basic structure)
      const columnDefs = columns.map(col => {
        let pgType = 'TEXT';
        if (col.type.includes('INT')) pgType = 'INTEGER';
        if (col.type.includes('REAL')) pgType = 'REAL';
        if (col.type.includes('BLOB')) pgType = 'BYTEA';
        if (col.type.includes('BOOLEAN')) pgType = 'BOOLEAN';
        
        let def = `"${col.name}" ${pgType}`;
        if (col.pk) def += ' PRIMARY KEY';
        if (col.notnull && !col.pk) def += ' NOT NULL';
        
        return def;
      }).join(', ');
      
      try {
        await pg.query(`CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefs})`);
        console.log(`   ✅ Table structure ready`);
      } catch (createError) {
        console.log(`   ⚠️  Table might already exist: ${createError.message}`);
      }
      
      // Clear existing data in PostgreSQL table
      try {
        const deleteResult = await pg.query(`DELETE FROM "${tableName}"`);
        console.log(`   🗑️  Cleared ${deleteResult.rowCount || 0} existing records`);
      } catch (deleteError) {
        console.log(`   ⚠️  Error clearing table: ${deleteError.message}`);
      }
      
      // Insert data batch by batch
      const batchSize = 100;
      let inserted = 0;
      
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        
        for (const record of batch) {
          const columnNames = Object.keys(record).map(k => `"${k}"`).join(', ');
          const placeholders = Object.keys(record).map((_, idx) => `$${idx + 1}`).join(', ');
          const values = Object.values(record);
          
          try {
            await pg.query(
              `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders})`,
              values
            );
            inserted++;
          } catch (insertError) {
            console.log(`   ❌ Error inserting record: ${insertError.message}`);
            console.log(`   📄 Record data:`, record);
          }
        }
        
        console.log(`   📈 Inserted ${inserted}/${records.length} records...`);
      }
      
      totalRecords += inserted;
      console.log(`   ✅ Completed table ${tableName}: ${inserted} records migrated`);
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Total records migrated: ${totalRecords}`);
    console.log(`📋 Tables processed: ${tables.length}`);
    
    // Verify migration
    console.log(`\n🔍 Verification:`);
    for (const table of tables) {
      try {
        const result = await pg.query(`SELECT COUNT(*) as count FROM "${table.name}"`);
        console.log(`   ${table.name}: ${result.rows[0].count} records in PostgreSQL`);
      } catch (verifyError) {
        console.log(`   ${table.name}: Error verifying - ${verifyError.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    sqlite.close();
    await pg.end();
  }
}

// Run migration
migrateData().catch(console.error);