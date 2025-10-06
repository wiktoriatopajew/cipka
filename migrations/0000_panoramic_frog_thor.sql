CREATE TABLE "attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"file_path" text NOT NULL,
	"uploaded_at" text DEFAULT CURRENT_TIMESTAMP,
	"expires_at" text NOT NULL,
	FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"vehicle_info" text,
	"status" text DEFAULT 'active',
	"created_at" text DEFAULT CURRENT_TIMESTAMP,
	"last_activity" text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text,
	"sender_id" text,
	"sender_type" text,
	"content" text NOT NULL,
	"is_read" integer DEFAULT false,
	"created_at" text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON UPDATE no action ON DELETE no action,
	FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS attachments (
	id text PRIMARY KEY NOT NULL,
	message_id text,
	file_name text NOT NULL,
	original_name text NOT NULL,
	file_size integer NOT NULL,
	mime_type text NOT NULL,
	file_path text NOT NULL,
	uploaded_at timestamp DEFAULT now(),
	expires_at timestamp NOT NULL,
	FOREIGN KEY (message_id) REFERENCES messages(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS chat_sessions (
	id text PRIMARY KEY NOT NULL,
	user_id text,
	vehicle_info text,
	status text DEFAULT 'active',
	created_at timestamp DEFAULT now(),
	last_activity timestamp DEFAULT now(),
	FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS messages (
	id text PRIMARY KEY NOT NULL,
	session_id text,
	sender_id text,
	sender_type text,
	content text NOT NULL,
	is_read boolean DEFAULT false,
	created_at timestamp DEFAULT now(),
	FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
	FOREIGN KEY (sender_id) REFERENCES users(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS subscriptions (
	id text PRIMARY KEY NOT NULL,
	user_id text,
	amount real,
	status text DEFAULT 'active',
	purchased_at timestamp DEFAULT now(),
	expires_at timestamp,
	FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS users (
	id text PRIMARY KEY NOT NULL,
	username text NOT NULL,
	password text NOT NULL,
	email text,
	is_admin boolean DEFAULT false,
	has_subscription boolean DEFAULT false,
	is_online boolean DEFAULT false,
	last_seen timestamp DEFAULT now(),
	created_at timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text,
	"is_admin" integer DEFAULT false,
	"has_subscription" integer DEFAULT false,
	"is_online" integer DEFAULT false,
	"last_seen" text DEFAULT CURRENT_TIMESTAMP,
	"created_at" text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" ("username");
