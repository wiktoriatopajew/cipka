import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "autoMentor.db");
const db = new Database(dbPath);

try {
  console.log("Starting migration...");
  
  // Add is_blocked column to users table
  const addIsBlockedColumn = `
    ALTER TABLE users 
    ADD COLUMN is_blocked INTEGER DEFAULT 0;
  `;
  
  db.exec(addIsBlockedColumn);
  console.log("✅ Added is_blocked column to users table");
  
  console.log("Migration completed successfully!");
} catch (error) {
  if (error.message.includes("duplicate column name")) {
    console.log("✅ Column is_blocked already exists, skipping migration");
  } else {
    console.error("Migration failed:", error);
    process.exit(1);
  }
} finally {
  db.close();
}
