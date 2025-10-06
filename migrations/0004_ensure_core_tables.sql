-- Idempotent migration: ensure core tables required by the app exist
-- This file is safe to run multiple times; it uses IF NOT EXISTS and checks for indexes.

CREATE TABLE IF NOT EXISTS "users" (
-- REMOVED ON SERVER: placeholder to disable this migration
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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'users_username_unique') THEN
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON "users" ("username")';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'users_referral_code_unique') THEN
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_unique ON "users" ("referral_code")';
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS "chat_sessions" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text,
  "vehicle_info" text,
  "status" text DEFAULT 'active',
  "created_at" timestamp DEFAULT now(),
  "last_activity" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" text,
  "sender_id" text,
  "sender_type" text,
  "content" text NOT NULL,
  "is_read" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text,
  "amount" real,
  "status" text DEFAULT 'active',
  "purchased_at" timestamp DEFAULT now(),
  "expires_at" timestamp
);

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
  -- attachments.message_id -> messages.id
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname='attachments') AND EXISTS (SELECT 1 FROM pg_class WHERE relname='messages') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attachments_message_id_messages_id_fk') THEN
      IF (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='attachments' AND column_name='message_id')
         = (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='id') THEN
        ALTER TABLE public.attachments ADD CONSTRAINT attachments_message_id_messages_id_fk FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
      ELSE
        RAISE NOTICE 'Skipping FK attachments.message_id -> messages.id due to incompatible types';
      END IF;
    END IF;
  END IF;

  -- chat_sessions.user_id -> users.id
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname='chat_sessions') AND EXISTS (SELECT 1 FROM pg_class WHERE relname='users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_sessions_user_id_users_id_fk') THEN
      IF (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='chat_sessions' AND column_name='user_id')
         = (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='id') THEN
        ALTER TABLE public.chat_sessions ADD CONSTRAINT chat_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
      ELSE
        RAISE NOTICE 'Skipping FK chat_sessions.user_id -> users.id due to incompatible types';
      END IF;
    END IF;
  END IF;

  -- messages.session_id -> chat_sessions.id
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname='messages') AND EXISTS (SELECT 1 FROM pg_class WHERE relname='chat_sessions') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_session_id_chat_sessions_id_fk') THEN
      IF (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='session_id')
         = (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='chat_sessions' AND column_name='id') THEN
        ALTER TABLE public.messages ADD CONSTRAINT messages_session_id_chat_sessions_id_fk FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
      ELSE
        RAISE NOTICE 'Skipping FK messages.session_id -> chat_sessions.id due to incompatible types';
      END IF;
    END IF;
  END IF;
END$$;
