-- Ensure pgcrypto or functions for randomness are available (optional)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add referral columns to users table (use appropriate types for Postgres)
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- Create referral_rewards table (Postgres-friendly types)
CREATE TABLE IF NOT EXISTS referral_rewards (
  id TEXT PRIMARY KEY,
  referrer_id TEXT REFERENCES users(id),
  referred_id TEXT REFERENCES users(id),
  reward_type TEXT NOT NULL,
  reward_value INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  required_referrals INTEGER DEFAULT 3,
  current_referrals INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  awarded_at TIMESTAMP
);

-- Generate referral codes for existing users (Postgres-safe)
-- Use an MD5-based short hex string to avoid SQLite-specific RANDOMBLOB/HEX
UPDATE users
SET referral_code = lower(substring(md5(random()::text), 1, 8))
WHERE referral_code IS NULL;

-- Create unique index on referral_code
CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_unique ON users (referral_code);