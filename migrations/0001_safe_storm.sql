CREATE TABLE "referral_rewards" (
	"id" text PRIMARY KEY NOT NULL,
	"referrer_id" text,
	"referred_id" text,
	"reward_type" text NOT NULL,
	"reward_value" integer NOT NULL,
	"status" text DEFAULT 'pending',
	"required_referrals" integer DEFAULT 3,
	"current_referrals" integer DEFAULT 0,
	"created_at" text DEFAULT CURRENT_TIMESTAMP,
	"awarded_at" text,
	FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
	FOREIGN KEY ("referred_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE "users" ADD "is_blocked" integer DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD "referral_code" text;--> statement-breakpoint
ALTER TABLE "users" ADD "referred_by" text;--> statement-breakpoint
CREATE UNIQUE INDEX "users_referral_code_unique" ON "users" ("referral_code");