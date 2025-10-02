import { setupDatabase } from "./server/db.js";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "autoMentor.db");

async function migrate() {
  try {
    console.log("Initializing database...");
    
    // First setup the database with existing schema
    await setupDatabase();
    console.log("✅ Database initialized");
    
    // Now try to add the new column
    const db = new Database(dbPath);
    try {
      const alterSQL = `ALTER TABLE users ADD COLUMN is_blocked INTEGER DEFAULT 0;`;
      db.exec(alterSQL);
      console.log("✅ Added is_blocked column to users table");
    } catch (error) {
      if (error.message.includes("duplicate column")) {
        console.log("✅ Column is_blocked already exists, skipping");
      } else {
        throw error;
      }
    } finally {
      db.close();
    }
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
