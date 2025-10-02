-- Add referral columns to users table
ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN referred_by TEXT;

-- Create referral_rewards table
CREATE TABLE referral_rewards (
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
);

-- Generate referral codes for existing users
UPDATE users 
SET referral_code = LOWER(HEX(RANDOMBLOB(4))) 
WHERE referral_code IS NULL;