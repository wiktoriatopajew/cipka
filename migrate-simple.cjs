const { execSync } = require('child_process');
const path = require('path');

const dbPath = path.join(__dirname, "autoMentor.db");

try {
  console.log("Starting migration using sqlite3...");
  
  const command = `sqlite3 "${dbPath}" "ALTER TABLE users ADD COLUMN is_blocked INTEGER DEFAULT 0;"`;
  execSync(command, { stdio: 'inherit' });
  
  console.log("✅ Migration completed successfully!");
} catch (error) {
  if (error.message.includes("duplicate column")) {
    console.log("✅ Column is_blocked already exists, skipping migration");
  } else {
    console.error("Migration failed:", error.message);
  }
}
