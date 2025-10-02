import Database from 'better-sqlite3';

const db = new Database('./database.sqlite');

// Get all table names
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();

console.log('📋 TABELE W BAZIE DANYCH:');
console.log('========================');

tables.forEach(table => {
  console.log(`\n🗂️ Tabela: ${table.name}`);
  
  // Get table schema
  const schema = db.prepare(`PRAGMA table_info(${table.name})`).all();
  console.log('   Kolumny:');
  schema.forEach(col => {
    const nullable = col.notnull ? 'NOT NULL' : 'NULLABLE';
    const defaultVal = col.dflt_value ? ` DEFAULT ${col.dflt_value}` : '';
    const pk = col.pk ? ' [PRIMARY KEY]' : '';
    console.log(`   - ${col.name}: ${col.type} ${nullable}${defaultVal}${pk}`);
  });
  
  // Get row count
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number };
  console.log(`   📊 Record count: ${count.count}`);
});

console.log('\n🔗 FOREIGN KEYS (Relacje):');
console.log('==========================');

tables.forEach(table => {
  const fks = db.prepare(`PRAGMA foreign_key_list(${table.name})`).all();
  if (fks.length > 0) {
    console.log(`\n📎 ${table.name}:`);
    fks.forEach(fk => {
      console.log(`   - ${fk.from} → ${fk.table}.${fk.to}`);
    });
  }
});

db.close();
