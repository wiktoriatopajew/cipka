CREATE TABLE IF NOT EXISTS referral_rewards (
	id text PRIMARY KEY NOT NULL,
	referrer_id text,
	referred_id text,
	reward_type text NOT NULL,
	reward_value integer NOT NULL,
	status text DEFAULT 'pending',
	required_referrals integer DEFAULT 3,
	current_referrals integer DEFAULT 0,
	created_at timestamp DEFAULT now(),
	awarded_at timestamp,
	FOREIGN KEY (referrer_id) REFERENCES users(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (referred_id) REFERENCES users(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code text;--> statement-breakpoint
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by text;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_unique ON users (referral_code);