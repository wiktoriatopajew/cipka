const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'));

console.log('Running referral system migration...');

try {
  // Check if columns already exist
  const tableInfo = db.pragma('table_info(users)');
  const existingColumns = tableInfo.map(col => col.name);
  
  // Add referral_code column if it doesn't exist
  if (!existingColumns.includes('referral_code')) {
    db.exec(`ALTER TABLE users ADD COLUMN referral_code TEXT`);
    console.log('Added referral_code column');
  } else {
    console.log('referral_code column already exists');
  }
  
  // Add referred_by column if it doesn't exist
  if (!existingColumns.includes('referred_by')) {
    db.exec(`ALTER TABLE users ADD COLUMN referred_by TEXT`);
    console.log('Added referred_by column');
  } else {
    console.log('referred_by column already exists');
  }
  
  // Create referral_rewards table
  db.exec(`
    CREATE TABLE IF NOT EXISTS referral_rewards (
      id TEXT PRIMARY KEY,
      referrer_id TEXT REFERENCES users(id),
      referred_id TEXT REFERENCES users(id),
      reward_type TEXT NOT NULL,
      reward_value INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      required_referrals INTEGER DEFAULT 3,
      current_referrals INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      awarded_at TEXT
    )
  `);
  console.log('Created referral_rewards table');
  
  // Create unique index on referral_code
  try {
    db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_unique ON users (referral_code)`);
    console.log('Created unique index on referral_code');
  } catch (err) {
    console.log('Index already exists or error:', err.message);
  }
  
  // Generate referral codes for existing users who don't have them
  const usersWithoutCodes = db.prepare(`
    SELECT id FROM users WHERE referral_code IS NULL
  `).all();
  
  const updateCode = db.prepare(`
    UPDATE users SET referral_code = ? WHERE id = ?
  `);
  
  for (const user of usersWithoutCodes) {
    const code = 'REF' + Math.random().toString(36).substring(2, 8).toUpperCase();
    updateCode.run(code, user.id);
  }
  
  console.log(`Generated referral codes for ${usersWithoutCodes.length} users`);
  console.log('Migration completed successfully!');
  
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}