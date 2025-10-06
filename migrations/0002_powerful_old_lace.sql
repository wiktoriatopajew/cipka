CREATE TABLE IF NOT EXISTS public.analytics_events (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"event_name" text NOT NULL,
	"user_id" text,
	"session_id" text,
	"properties" text,
	"page_url" text,
	"referrer" text,
	"user_agent" text,
	"ip_address" text,
	"country" text,
	"city" text,
	"device_type" text,
	"browser" text,
	"os" text,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_config (
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

CREATE TABLE IF NOT EXISTS public.attachments (
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

CREATE TABLE IF NOT EXISTS public.chat_sessions (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"vehicle_info" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"last_activity" timestamp DEFAULT now()
);

-- REMOVED ON SERVER: placeholder to disable migrations
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_key" text NOT NULL,
	"title" text NOT NULL,
	"meta_description" text,
	"meta_keywords" text,
	"content" text,
	"is_published" boolean DEFAULT true,
	"seo_title" text,
	"canonical_url" text,
	"og_title" text,
	"og_description" text,
	"og_image" text,
	"last_edited_by" text,
	"version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "content_pages_page_key_unique" UNIQUE("page_key")
);

-- REMOVED ON SERVER: placeholder to disable migrations
	"id" serial PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"total_users" integer DEFAULT 0,
	"new_users" integer DEFAULT 0,
	"active_users" integer DEFAULT 0,
	"total_sessions" integer DEFAULT 0,
	"total_chats" integer DEFAULT 0,
	"new_subscriptions" integer DEFAULT 0,
	"total_revenue" real DEFAULT 0,
	"page_views" integer DEFAULT 0,
	"bounce_rate" real DEFAULT 0,
	"avg_session_duration" integer DEFAULT 0,
	"conversion_rate" real DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "daily_stats_date_unique" UNIQUE("date")
);

-- REMOVED ON SERVER: placeholder to disable migrations
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" text DEFAULT 'general',
	"is_published" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.google_ads_config (
	"id" serial PRIMARY KEY NOT NULL,
	"conversion_id" text,
	"purchase_label" text,
	"signup_label" text,
	"enabled" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.media_library (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"path" text NOT NULL,
	"alt" text,
	"title" text,
	"description" text,
	"tags" text,
	"uploaded_by" text,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text,
	"sender_id" text,
	"sender_type" text,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.referral_rewards (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" text,
	"referred_id" text,
	"reward_type" text NOT NULL,
	"reward_value" integer NOT NULL,
	"status" text DEFAULT 'pending',
	"required_referrals" integer DEFAULT 3,
	"current_referrals" integer DEFAULT 0,
	"reward_cycle" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"awarded_at" timestamp
);

CREATE TABLE IF NOT EXISTS public.revenue_analytics (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"subscription_id" text,
	"amount" real NOT NULL,
	"currency" text DEFAULT 'PLN',
	"payment_method" text,
	"subscription_type" text,
	"is_refund" boolean DEFAULT false,
	"refund_amount" real DEFAULT 0,
	"marketing_source" text,
	"conversion_funnel_step" integer,
	"customer_lifetime_value" real DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"amount" real,
	"status" text DEFAULT 'active',
	"purchased_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);

CREATE TABLE IF NOT EXISTS public.testimonials (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"content" text NOT NULL,
	"rating" integer DEFAULT 5,
	"is_approved" boolean DEFAULT false,
	"is_published" boolean DEFAULT false,
	"avatar" text,
	"company" text,
	"position" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.users (
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
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);

DO $$
BEGIN
	-- analytics_events.user_id -> users.id
	IF EXISTS (SELECT 1 FROM pg_class WHERE relname='analytics_events') AND EXISTS (SELECT 1 FROM pg_class WHERE relname='users') THEN
		IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'analytics_events_user_id_users_id_fk') THEN
			IF (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='analytics_events' AND column_name='user_id')
				 = (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='id') THEN
				ALTER TABLE public.analytics_events ADD CONSTRAINT analytics_events_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
			ELSE
				RAISE NOTICE 'Skipping FK analytics_events.user_id -> users.id due to incompatible types';
			END IF;
		END IF;
	END IF;

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

	-- messages.sender_id -> users.id
	IF EXISTS (SELECT 1 FROM pg_class WHERE relname='messages') AND EXISTS (SELECT 1 FROM pg_class WHERE relname='users') THEN
		IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_sender_id_users_id_fk') THEN
			IF (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='sender_id')
				 = (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='id') THEN
				ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
			ELSE
				RAISE NOTICE 'Skipping FK messages.sender_id -> users.id due to incompatible types';
			END IF;
		END IF;
	END IF;

	-- referral_rewards.referrer_id/referred_id -> users.id
	IF EXISTS (SELECT 1 FROM pg_class WHERE relname='referral_rewards') AND EXISTS (SELECT 1 FROM pg_class WHERE relname='users') THEN
		IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referral_rewards_referrer_id_users_id_fk') THEN
			IF (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='referral_rewards' AND column_name='referrer_id')
				 = (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='id') THEN
				ALTER TABLE public.referral_rewards ADD CONSTRAINT referral_rewards_referrer_id_users_id_fk FOREIGN KEY (referrer_id) REFERENCES public.users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
			ELSE
				RAISE NOTICE 'Skipping FK referral_rewards.referrer_id -> users.id due to incompatible types';
			END IF;
		END IF;
		IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referral_rewards_referred_id_users_id_fk') THEN
			IF (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='referral_rewards' AND column_name='referred_id')
				 = (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='id') THEN
				ALTER TABLE public.referral_rewards ADD CONSTRAINT referral_rewards_referred_id_users_id_fk FOREIGN KEY (referred_id) REFERENCES public.users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
			ELSE
				RAISE NOTICE 'Skipping FK referral_rewards.referred_id -> users.id due to incompatible types';
			END IF;
		END IF;
	END IF;

	-- revenue_analytics.user_id -> users.id
	IF EXISTS (SELECT 1 FROM pg_class WHERE relname='revenue_analytics') AND EXISTS (SELECT 1 FROM pg_class WHERE relname='users') THEN
		IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'revenue_analytics_user_id_users_id_fk') THEN
			IF (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='revenue_analytics' AND column_name='user_id')
				 = (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='id') THEN
				ALTER TABLE public.revenue_analytics ADD CONSTRAINT revenue_analytics_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
			ELSE
				RAISE NOTICE 'Skipping FK revenue_analytics.user_id -> users.id due to incompatible types';
			END IF;
		END IF;
		IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'revenue_analytics_subscription_id_subscriptions_id_fk') THEN
			IF (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='revenue_analytics' AND column_name='subscription_id')
				 = (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' AND column_name='id') THEN
				ALTER TABLE public.revenue_analytics ADD CONSTRAINT revenue_analytics_subscription_id_subscriptions_id_fk FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
			ELSE
				RAISE NOTICE 'Skipping FK revenue_analytics.subscription_id -> subscriptions.id due to incompatible types';
			END IF;
		END IF;
	END IF;

	-- subscriptions.user_id -> users.id
	IF EXISTS (SELECT 1 FROM pg_class WHERE relname='subscriptions') AND EXISTS (SELECT 1 FROM pg_class WHERE relname='users') THEN
		IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_user_id_users_id_fk') THEN
			IF (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' AND column_name='user_id')
				 = (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='id') THEN
				ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
			ELSE
				RAISE NOTICE 'Skipping FK subscriptions.user_id -> users.id due to incompatible types';
			END IF;
		END IF;
	END IF;
END$$;