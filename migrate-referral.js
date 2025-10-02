import { db } from './server/db.js';

async function runMigration() {
  console.log('Running referral system migration...');
  
  try {
    // Add referral columns to users table
    await db.run(`ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE`);
    console.log('Added referral_code column');
    
    await db.run(`ALTER TABLE users ADD COLUMN referred_by TEXT`);
    console.log('Added referred_by column');
    
    // Create referral_rewards table
    await db.run(`
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
    
    // Generate referral codes for existing users
    await db.run(`
      UPDATE users 
      SET referral_code = LOWER(HEX(RANDOMBLOB(4))) 
      WHERE referral_code IS NULL
    `);
    console.log('Generated referral codes for existing users');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();