const Database = require('better-sqlite3');

const db = new Database('./database.sqlite', { readonly: true });

try {
  // Get all tables
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all();
  
  console.log(`📊 Found ${tables.length} tables in local database:\n`);
  
  for (const table of tables) {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
    const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
    
    console.log(`📋 Table: ${table.name}`);
    console.log(`   Records: ${count.count}`);
    console.log(`   Columns: ${columns.map(c => `${c.name} (${c.type})`).join(', ')}`);
    
    if (count.count > 0 && count.count <= 5) {
      console.log(`   Sample data:`);
      const sample = db.prepare(`SELECT * FROM ${table.name} LIMIT 3`).all();
      sample.forEach((row, idx) => {
        console.log(`     ${idx + 1}:`, JSON.stringify(row, null, 2).substring(0, 100) + '...');
      });
    }
    console.log('');
  }
  
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}