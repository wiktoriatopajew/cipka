
-- 0000_panoramic_frog_thor.sql
-- Basic idempotent creation of core tables used by the application

-- Create core tables if missing
CREATE TABLE IF NOT EXISTS public.users (
	-- REMOVED ON SERVER: original migration moved to backup. This file intentionally left blank to disable automatic migrations on the server.


	CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON public.users (username);
	CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_unique ON public.users (referral_code);

	CREATE TABLE IF NOT EXISTS public.chat_sessions (
		id text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
		user_id text,
		vehicle_info text,
		status text DEFAULT 'active',
		created_at timestamp DEFAULT now(),
		last_activity timestamp DEFAULT now()
	);

	CREATE TABLE IF NOT EXISTS public.messages (
		id text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
		session_id text,
		sender_id text,
		sender_type text,
		content text NOT NULL,
		is_read boolean DEFAULT false,
		created_at timestamp DEFAULT now()
	);

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

	CREATE TABLE IF NOT EXISTS public.subscriptions (
		id text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
		user_id text,
		amount real,
		status text DEFAULT 'active',
		purchased_at timestamp DEFAULT now(),
		expires_at timestamp
	);

	-- Add foreign keys where possible (ignore duplicates)
	DO $$
	BEGIN
		IF EXISTS (SELECT 1 FROM pg_class WHERE relname='attachments') AND EXISTS (SELECT 1 FROM pg_class WHERE relname='messages') THEN
			BEGIN
				ALTER TABLE public.attachments ADD CONSTRAINT attachments_message_id_messages_id_fk FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
			EXCEPTION WHEN duplicate_object THEN
				NULL;
			END;
		END IF;

		IF EXISTS (SELECT 1 FROM pg_class WHERE relname='chat_sessions') AND EXISTS (SELECT 1 FROM pg_class WHERE relname='users') THEN
			BEGIN
				ALTER TABLE public.chat_sessions ADD CONSTRAINT chat_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
			EXCEPTION WHEN duplicate_object THEN
				NULL;
			END;
		END IF;

		IF EXISTS (SELECT 1 FROM pg_class WHERE relname='messages') AND EXISTS (SELECT 1 FROM pg_class WHERE relname='chat_sessions') THEN
			BEGIN
				ALTER TABLE public.messages ADD CONSTRAINT messages_session_id_chat_sessions_id_fk FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
			EXCEPTION WHEN duplicate_object THEN
				NULL;
			END;
		END IF;
	END$$;
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON public.users (username);
