import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

try {
  // Check if users table exists
  const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  console.log('Users table exists:', !!tableInfo);

  if (tableInfo) {
    // Get table schema
    const schema = db.prepare("PRAGMA table_info(users)").all();
    console.log('\nUsers table schema:');
    schema.forEach(col => {
      console.log(`- ${col.name}: ${col.type} (nullable: ${!col.notnull})`);
    });

    // Get all users with available columns
    const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    console.log('\nUsers in database:');
    users.forEach(user => {
      console.log(`- Username: ${user.username}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Has subscription: ${user.has_subscription}`);
      console.log(`  Is admin: ${user.is_admin}`);
      console.log(`  Created: ${user.created_at}`);
      console.log(`  Is blocked: ${user.is_blocked}`);
      console.log('---');
    });
  }
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}