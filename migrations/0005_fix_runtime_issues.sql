-- Idempotent migration: ensure username column and attachments table exist
-- Safe to run multiple times

-- Ensure users.username exists
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS username text;
--> statement-breakpoint

-- Create unique index on users.username if missing (concurrent-safe fallback)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'users') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'users_username_unique') THEN
      BEGIN
        -- CREATE INDEX CONCURRENTLY cannot run inside a transaction block; try CONCURRENTLY then fallback
        EXECUTE 'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS users_username_unique ON "users" ("username")';
      EXCEPTION WHEN others THEN
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON "users" ("username")';
      END;
    END IF;
  END IF;
END$$;
--> statement-breakpoint

-- Ensure attachments table exists (structure used by app cleanup)
CREATE TABLE IF NOT EXISTS public.attachments (
  id text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  message_id text,
  file_name text NOT NULL,
  original_name text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  file_path text NOT NULL,
  uploaded_at timestamp DEFAULT now(),
  expires_at timestamp
);
--> statement-breakpoint

-- Add FK from attachments.message_id -> messages.id if messages table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname='messages') THEN
    BEGIN
      ALTER TABLE IF EXISTS public.attachments ADD CONSTRAINT IF NOT EXISTS attachments_message_id_messages_id_fk FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
    EXCEPTION WHEN duplicate_object THEN
      -- ignore duplicate foreign key
    END;
  END IF;
END$$;
--> statement-breakpoint

-- Ensure chat_sessions and messages tables exist minimally (in case earlier migrations failed)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id text,
  vehicle_info text,
  status text DEFAULT 'active',
  created_at timestamp DEFAULT now(),
  last_activity timestamp DEFAULT now()
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS public.messages (
  id text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  session_id text,
  sender_id text,
  sender_type text,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);
--> statement-breakpoint
