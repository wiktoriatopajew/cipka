
import { sql } from "drizzle-orm";
import { pgTable, text, integer, real, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  isAdmin: boolean("is_admin").default(false),
  hasSubscription: boolean("has_subscription").default(false),
  isOnline: boolean("is_online").default(false),
  isBlocked: boolean("is_blocked").default(false),
  referralCode: text("referral_code").unique(),
  referredBy: text("referred_by"),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").references(() => users.id),
  amount: real("amount"),
  status: text("status").default("active"),
  purchasedAt: timestamp("purchased_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const chatSessions = pgTable("chat_sessions", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").references(() => users.id),
  vehicleInfo: text("vehicle_info"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  lastActivity: timestamp("last_activity").defaultNow(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").references(() => chatSessions.id),
  senderId: text("sender_id").references(() => users.id),
  senderType: text("sender_type"), // user, admin, bot
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attachments = pgTable("attachments", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: text("message_id").references(() => messages.id),
  fileName: text("file_name").notNull(), // unique filename on server
  originalName: text("original_name").notNull(), // original filename from user
  fileSize: integer("file_size").notNull(), // size in bytes
  mimeType: text("mime_type").notNull(), // MIME type
  filePath: text("file_path").notNull(), // path on server
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // auto-delete date (30 days)
});

export const referralRewards = pgTable("referral_rewards", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: text("referrer_id").references(() => users.id), // Who referred
  referredId: text("referred_id").references(() => users.id), // Who was referred
  rewardType: text("reward_type").notNull(), // "free_month", "discount", etc.
  rewardValue: integer("reward_value").notNull(), // Reward value in days
  status: text("status").default("pending"), // pending, awarded, expired
  requiredReferrals: integer("required_referrals").default(3), // How many referrals needed
  currentReferrals: integer("current_referrals").default(0), // Current referral count
  rewardCycle: integer("reward_cycle").default(1), // Which reward cycle (1, 2, 3, etc.)
  createdAt: timestamp("created_at").defaultNow(),
  awardedAt: timestamp("awarded_at"), // When reward was granted
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  referralCode: true,
}).extend({
  password: z.string()
    .min(6, "Password must be at least 6 characters long"),
  email: z.string().email("Invalid email address").toLowerCase(),
  username: z.string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be no more than 20 characters long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  referralCode: z.string().optional(), // Referral code (optional)
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  purchasedAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  lastActivity: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
});

export const insertReferralRewardSchema = createInsertSchema(referralRewards).omit({
  id: true,
  createdAt: true,
});

export const googleAdsConfig = pgTable('google_ads_config', {
  id: serial('id').primaryKey(),
  conversionId: text('conversion_id'),
  purchaseLabel: text('purchase_label'),
  signupLabel: text('signup_label'),
  enabled: boolean('enabled').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const appConfig = pgTable('app_config', {
  id: serial('id').primaryKey(),
  // Stripe Configuration
  stripePublishableKey: text('stripe_publishable_key'),
  stripeSecretKey: text('stripe_secret_key'),
  stripeWebhookSecret: text('stripe_webhook_secret'),

  // PayPal Configuration
  paypalClientId: text('paypal_client_id'),
  paypalClientSecret: text('paypal_client_secret'),
  paypalWebhookId: text('paypal_webhook_id'),
  paypalMode: text('paypal_mode').default('sandbox'), // 'sandbox' or 'live'

  // SMTP Email Configuration
  smtpHost: text('smtp_host'),
  smtpPort: integer('smtp_port'),
  smtpSecure: boolean('smtp_secure').default(true),
  smtpUser: text('smtp_user'),
  smtpPass: text('smtp_pass'),
  emailFrom: text('email_from'),
  emailFromName: text('email_from_name').default('AutoMentor'),

  // General Settings
  appName: text('app_name').default('AutoMentor'),
  appUrl: text('app_url').default('http://localhost:5000'),
  supportEmail: text('support_email'),
  faviconPath: text('favicon_path'),

  updatedAt: timestamp('updated_at').defaultNow(),
});

// Analytics tables
export const analyticsEvents = pgTable('analytics_events', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  eventType: text('event_type').notNull(),
  eventName: text('event_name').notNull(),
  userId: text('user_id').references(() => users.id),
  sessionId: text('session_id'),
  properties: text('properties'), // JSON string
  pageUrl: text('page_url'),
  referrer: text('referrer'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  country: text('country'),
  city: text('city'),
  deviceType: text('device_type'),
  browser: text('browser'),
  os: text('os'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dailyStats = pgTable('daily_stats', {
  id: serial('id').primaryKey(),
  date: text('date').notNull().unique(),
  totalUsers: integer('total_users').default(0),
  newUsers: integer('new_users').default(0),
  activeUsers: integer('active_users').default(0),
  totalSessions: integer('total_sessions').default(0),
  totalChats: integer('total_chats').default(0),
  newSubscriptions: integer('new_subscriptions').default(0),
  totalRevenue: real('total_revenue').default(0),
  pageViews: integer('page_views').default(0),
  bounceRate: real('bounce_rate').default(0),
  avgSessionDuration: integer('avg_session_duration').default(0),
  conversionRate: real('conversion_rate').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const revenueAnalytics = pgTable('revenue_analytics', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').references(() => users.id),
  subscriptionId: text('subscription_id').references(() => subscriptions.id),
  amount: real('amount').notNull(),
  currency: text('currency').default('PLN'),
  paymentMethod: text('payment_method'),
  subscriptionType: text('subscription_type'),
  isRefund: boolean('is_refund').default(false),
  refundAmount: real('refund_amount').default(0),
  marketingSource: text('marketing_source'),
  conversionFunnelStep: integer('conversion_funnel_step'),
  customerLifetimeValue: real('customer_lifetime_value').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// CMS tables
export const contentPages = pgTable('content_pages', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  pageKey: text('page_key').notNull().unique(),
  title: text('title').notNull(),
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords'),
  content: text('content'), // JSON string
  isPublished: boolean('is_published').default(true),
  seoTitle: text('seo_title'),
  canonicalUrl: text('canonical_url'),
  ogTitle: text('og_title'),
  ogDescription: text('og_description'),
  ogImage: text('og_image'),
  lastEditedBy: text('last_edited_by'),
  version: integer('version').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const faqs = pgTable('faqs', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category').default('general'),
  isPublished: boolean('is_published').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const testimonials = pgTable('testimonials', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  email: text('email'),
  content: text('content').notNull(),
  rating: integer('rating').default(5),
  isApproved: boolean('is_approved').default(false),
  isPublished: boolean('is_published').default(false),
  avatar: text('avatar'),
  company: text('company'),
  position: text('position'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const mediaLibrary = pgTable('media_library', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  alt: text('alt'),
  title: text('title'),
  description: text('description'),
  tags: text('tags'), // JSON array
  uploadedBy: text('uploaded_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertGoogleAdsConfigSchema = createInsertSchema(googleAdsConfig);
export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents);
export const insertDailyStatsSchema = createInsertSchema(dailyStats);
export const insertRevenueAnalyticsSchema = createInsertSchema(revenueAnalytics);
export const insertContentPageSchema = createInsertSchema(contentPages);
export const insertFaqSchema = createInsertSchema(faqs);
export const insertTestimonialSchema = createInsertSchema(testimonials);
export const insertMediaLibrarySchema = createInsertSchema(mediaLibrary);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
export type Attachment = typeof attachments.$inferSelect;
export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;
export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertGoogleAdsConfig = z.infer<typeof insertGoogleAdsConfigSchema>;
export type GoogleAdsConfig = typeof googleAdsConfig.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
export type DailyStats = typeof dailyStats.$inferSelect;
export type InsertRevenueAnalytics = z.infer<typeof insertRevenueAnalyticsSchema>;
export type RevenueAnalytics = typeof revenueAnalytics.$inferSelect;
export type InsertContentPage = z.infer<typeof insertContentPageSchema>;
export type ContentPage = typeof contentPages.$inferSelect;
export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqs.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertMediaLibrary = z.infer<typeof insertMediaLibrarySchema>;
export type MediaLibrary = typeof mediaLibrary.$inferSelect;
