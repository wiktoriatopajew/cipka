const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('Starting favicon migration...');

try {
  // Open database
  const db = new Database('./database.sqlite');
  
  console.log('Database opened successfully');
  
  // Check if favicon column already exists
  const tableInfo = db.prepare("PRAGMA table_info(app_config)").all();
  const faviconColumnExists = tableInfo.some(column => column.name === 'favicon_path');
  
  if (faviconColumnExists) {
    console.log('Favicon column already exists, skipping migration');
    process.exit(0);
  }
  
  // Add favicon column
  console.log('Adding favicon_path column to app_config table...');
  db.prepare(`
    ALTER TABLE app_config 
    ADD COLUMN favicon_path TEXT DEFAULT NULL
  `).run();
  
  console.log('Favicon column added successfully');
  
  db.close();
  console.log('Migration completed successfully!');
  
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}