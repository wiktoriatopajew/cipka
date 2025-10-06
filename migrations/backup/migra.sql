-- (removed duplicate non-idempotent CREATE TABLE for attachments)
-- migra.sql: consolidated migration file cleaned for Postgres
CREATE TABLE IF NOT EXISTS public.testimonials (
-- Create core tables if missing
CREATE TABLE IF NOT EXISTS public.users (
	id text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	username text NOT NULL,
	password text NOT NULL,
	email text,
	is_admin boolean DEFAULT false,
	has_subscription boolean DEFAULT false,
	is_online boolean DEFAULT false,
	is_blocked boolean DEFAULT false,
	referral_code text,
	referred_by text,
	last_seen timestamp DEFAULT now(),
	created_at timestamp DEFAULT now()
);

-- Ensure optional user columns exist before creating indexes
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS referral_code text;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS referred_by text;

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

-- REMOVED ON SERVER: consolidated migration neutralized to prevent automatic schema changes on this server.


-- attach basic foreign keys where possible
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
							-- check column types before adding FK (avoid incompatible types)
							IF (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='chat_sessions' AND column_name='user_id')
								 = (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='id')
							THEN
								ALTER TABLE public.chat_sessions ADD CONSTRAINT chat_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
							ELSE
								RAISE NOTICE 'Skipping FK chat_sessions.user_id -> users.id due to incompatible column types';
							END IF;
					EXCEPTION WHEN duplicate_object THEN
							NULL;
					END;
	END IF;
END$$;

-- Additional content tables
CREATE TABLE IF NOT EXISTS public.content_pages (
	id text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	page_key text NOT NULL,
	title text NOT NULL,
	meta_description text,
	meta_keywords text,
	content text,
	is_published boolean DEFAULT true,
	seo_title text,
	canonical_url text,
	og_title text,
	og_description text,
	og_image text,
	last_edited_by text,
	version integer DEFAULT 1,
	created_at timestamp DEFAULT now(),
	updated_at timestamp DEFAULT now(),
	CONSTRAINT content_pages_page_key_unique UNIQUE(page_key)
);

CREATE TABLE IF NOT EXISTS public.daily_stats (
	id serial PRIMARY KEY NOT NULL,
	date text NOT NULL,
	total_users integer DEFAULT 0,
	new_users integer DEFAULT 0,
	active_users integer DEFAULT 0,
	total_sessions integer DEFAULT 0,
	total_chats integer DEFAULT 0,
	new_subscriptions integer DEFAULT 0,
	total_revenue real DEFAULT 0,
	page_views integer DEFAULT 0,
	bounce_rate real DEFAULT 0,
	avg_session_duration integer DEFAULT 0,
	conversion_rate real DEFAULT 0,
	created_at timestamp DEFAULT now(),
	updated_at timestamp DEFAULT now(),
	CONSTRAINT daily_stats_date_unique UNIQUE(date)
);

CREATE TABLE IF NOT EXISTS public.faqs (
	id text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	question text NOT NULL,
	answer text NOT NULL,
	category text DEFAULT 'general',
	is_published boolean DEFAULT true,
	sort_order integer DEFAULT 0,
	created_at timestamp DEFAULT now(),
	updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.google_ads_config (
	id serial PRIMARY KEY NOT NULL,
	conversion_id text,
	purchase_label text,
	signup_label text,
	enabled boolean DEFAULT false,
	updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.media_library (
	id text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	filename text NOT NULL,
	original_name text NOT NULL,
	mime_type text NOT NULL,
	size integer NOT NULL,
	path text NOT NULL,
	alt text,
	title text,
	description text,
	tags text,
	uploaded_by text,
	created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
	id text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	name text NOT NULL,
	email text,
	content text NOT NULL,
	rating integer DEFAULT 5,
	is_approved boolean DEFAULT false,
	is_published boolean DEFAULT false,
	avatar text,
	company text,
	position text,
	created_at timestamp DEFAULT now(),
	updated_at timestamp DEFAULT now()
);
