import Database from 'better-sqlite3';

const dbPath = './database.sqlite';

try {
  console.log("Starting migration...");
  
  const db = new Database(dbPath);
  
  try {
    const alterSQL = `ALTER TABLE users ADD COLUMN is_blocked INTEGER DEFAULT 0;`;
    db.exec(alterSQL);
    console.log("✅ Added is_blocked column to users table");
  } catch (error) {
    if (error.message.includes("duplicate column") || error.message.includes("already exists")) {
      console.log("✅ Column is_blocked already exists, skipping migration");
    } else {
      console.error("Migration error:", error.message);
    }
  } finally {
    db.close();
  }
  
  console.log("Migration completed!");
} catch (error) {
  console.error("Failed to connect to database:", error.message);
}
