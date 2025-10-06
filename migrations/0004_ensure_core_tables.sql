-- Idempotent migration: ensure core tables required by the app exist
-- This file is safe to run multiple times; it uses IF NOT EXISTS and checks for indexes.

CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "username" text NOT NULL,
  "password" text NOT NULL,
  "email" text,
  "is_admin" boolean DEFAULT false,
  "has_subscription" boolean DEFAULT false,
  "is_online" boolean DEFAULT false,
  "is_blocked" boolean DEFAULT false,
  "referral_code" text,
  "referred_by" text,
  "last_seen" timestamp DEFAULT now(),
  "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'users_username_unique') THEN
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON "users" ("username")';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'users_referral_code_unique') THEN
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_unique ON "users" ("referral_code")';
  END IF;
END$$;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "chat_sessions" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text,
  "vehicle_info" text,
  "status" text DEFAULT 'active',
  "created_at" timestamp DEFAULT now(),
  "last_activity" timestamp DEFAULT now()
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "messages" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" text,
  "sender_id" text,
  "sender_type" text,
  "content" text NOT NULL,
  "is_read" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "attachments" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "message_id" text,
  "file_name" text NOT NULL,
  "original_name" text NOT NULL,
  "file_size" integer NOT NULL,
  "mime_type" text NOT NULL,
  "file_path" text NOT NULL,
  "uploaded_at" timestamp DEFAULT now(),
  "expires_at" timestamp
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text,
  "amount" real,
  "status" text DEFAULT 'active',
  "purchased_at" timestamp DEFAULT now(),
  "expires_at" timestamp
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "referral_rewards" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "referrer_id" text,
  "referred_id" text,
  "reward_type" text NOT NULL,
  "reward_value" integer NOT NULL,
  "status" text DEFAULT 'pending',
  "required_referrals" integer DEFAULT 3,
  "current_referrals" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now(),
  "awarded_at" timestamp
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "app_config" (
  "id" serial PRIMARY KEY NOT NULL,
  "stripe_publishable_key" text,
  "stripe_secret_key" text,
  "stripe_webhook_secret" text,
  "paypal_client_id" text,
  "paypal_client_secret" text,
  "paypal_webhook_id" text,
  "paypal_mode" text DEFAULT 'sandbox',
  "smtp_host" text,
  "smtp_port" integer,
  "smtp_secure" boolean DEFAULT true,
  "smtp_user" text,
  "smtp_pass" text,
  "email_from" text,
  "email_from_name" text DEFAULT 'AutoMentor',
  "app_name" text DEFAULT 'AutoMentor',
  "app_url" text DEFAULT 'http://localhost:5000',
  "support_email" text,
  "favicon_path" text,
  "updated_at" timestamp DEFAULT now()
);

-- Add foreign keys if the referenced tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname='messages') AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname='attachments') THEN
    BEGIN
      ALTER TABLE IF EXISTS "attachments" ADD CONSTRAINT IF NOT EXISTS attachments_message_id_messages_id_fk FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN
      -- ignore
    END;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname='chat_sessions') AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname='users') THEN
    BEGIN
      ALTER TABLE IF EXISTS "chat_sessions" ADD CONSTRAINT IF NOT EXISTS chat_sessions_user_id_users_id_fk FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN
    END;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname='messages') AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname='chat_sessions') THEN
    BEGIN
      ALTER TABLE IF EXISTS "messages" ADD CONSTRAINT IF NOT EXISTS messages_session_id_chat_sessions_id_fk FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN
    END;
  END IF;
END$$;
