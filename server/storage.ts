import { 
  type User,
  type Subscription, type InsertSubscription,
  type ChatSession, type InsertChatSession,
  type Message, type InsertMessage,
  type Attachment, type InsertAttachment,
  type ReferralReward, type InsertReferralReward,
  type GoogleAdsConfig, type InsertGoogleAdsConfig,
  type AnalyticsEvent, type InsertAnalyticsEvent,
  type ContentPage, type InsertContentPage,
  type Faq, type InsertFaq,
  type Testimonial, type InsertTestimonial,
  users, subscriptions, chatSessions, messages, attachments, referralRewards, googleAdsConfig, appConfig,
  analyticsEvents, contentPages, faqs, testimonials, dailyStats, revenueAnalytics
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { db, dbReady } from "./db";
import { eq, and, desc, lt, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: typeof users.$inferInsert): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  verifyPassword(email: string, password: string): Promise<User | null>;
  
  // Subscription methods
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getUserSubscriptions(userId: string): Promise<Subscription[]>;
  getAllActiveSubscriptions(): Promise<Subscription[]>;
  hasActiveSubscription(userId: string): Promise<boolean>;
  
  // Chat session methods
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getUserChatSessions(userId: string): Promise<ChatSession[]>;
  getAllActiveChatSessions(): Promise<ChatSession[]>;
  updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getSessionMessages(sessionId: string): Promise<(Message & { attachments: Attachment[] })[]>;
  getAllUnreadMessages(): Promise<Message[]>;
  markMessageAsRead(messageId: string): Promise<void>;
  getRecentMessages(limit?: number): Promise<Message[]>;
  
  // Attachment methods
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  getMessageAttachments(messageId: string): Promise<Attachment[]>;
  getAttachment(id: string): Promise<Attachment | undefined>;
  getAttachmentByFilename(filename: string): Promise<Attachment | undefined>;
  deleteAttachment(id: string): Promise<void>;
  getExpiredAttachments(): Promise<Attachment[]>;
  deleteExpiredAttachments(): Promise<void>;
  linkAttachmentToMessage(attachmentId: string, messageId: string): Promise<void>;
  
  // Referral methods
  generateReferralCode(userId: string): Promise<string>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  createReferralReward(reward: InsertReferralReward): Promise<ReferralReward>;
  getUserReferrals(userId: string): Promise<User[]>;
  getUserReferralRewards(userId: string): Promise<ReferralReward[]>;
  updateReferralProgress(referrerId: string, newReferralId: string): Promise<void>;
  awardReferralReward(rewardId: string): Promise<void>;
  resetReferralCycle(userId: string): Promise<{ success: boolean; message: string; newCycle: number }>;
  
  // Google Ads configuration methods
  getGoogleAdsConfig(): Promise<GoogleAdsConfig | null>;
  updateGoogleAdsConfig(config: Partial<InsertGoogleAdsConfig>): Promise<{ success: boolean; message: string }>;
  
  // App configuration methods
  getAppConfig(): Promise<any>;
  updateAppConfig(config: any): Promise<any>;
  
  // Admin methods
  addSubscriptionDays(userId: string, days: number): Promise<{ success: boolean; message: string; newExpiryDate: string }>;
  
  // Analytics methods
  trackEvent(event: Omit<InsertAnalyticsEvent, 'id' | 'createdAt'>): Promise<void>;
  getDashboardStats(startDate?: string, endDate?: string): Promise<any>;
  getRevenueAnalytics(startDate?: string, endDate?: string): Promise<any>;
  getChartData(type: string, period: string): Promise<any>;
  
  // CMS methods
  getContentPage(pageKey: string): Promise<ContentPage | null>;
  updateContentPage(pageKey: string, content: Partial<InsertContentPage>): Promise<ContentPage>;
  getAllContentPages(): Promise<ContentPage[]>;
  getFaqs(): Promise<Faq[]>;
  createFaq(faq: Omit<InsertFaq, 'id' | 'createdAt' | 'updatedAt'>): Promise<Faq>;
  updateFaq(id: string, faq: Partial<InsertFaq>): Promise<Faq>;
  deleteFaq(id: string): Promise<void>;
  getTestimonials(approved?: boolean): Promise<Testimonial[]>;
  createTestimonial(testimonial: Omit<InsertTestimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<Testimonial>;
  updateTestimonial(id: string, testimonial: Partial<InsertTestimonial>): Promise<Testimonial>;
  deleteTestimonial(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private subscriptions: Map<string, Subscription>;
  private chatSessions: Map<string, ChatSession>;
  private messages: Map<string, Message>;
  private attachments: Map<string, Attachment>;

  constructor() {
    this.users = new Map();
    this.subscriptions = new Map();
    this.chatSessions = new Map();
    this.messages = new Map();
    this.attachments = new Map();
  }

  async initAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (adminEmail && adminPassword) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      const adminUser: User = {
        id: randomUUID(),
        username: "admin",
        password: hashedPassword,
        email: adminEmail,
        isAdmin: true,
        hasSubscription: true,
        isOnline: false,
        referralCode: null,
        referredBy: null,
        lastSeen: new Date(),
        createdAt: new Date(),
        isBlocked: false,
      };
      this.users.set(adminUser.id, adminUser);
      console.log(`Admin user created with email: ${adminEmail}`);
    } else {
      console.log("No admin credentials provided - admin user not created");
    }

    // Create test user without subscription
    const testPassword = await bcrypt.hash("123456", 12);
    const testUser: User = {
      id: randomUUID(),
      username: "test",
      password: testPassword,
      email: "test@example.com",
      isAdmin: false,
      hasSubscription: false,
      isOnline: false,
      referralCode: null,
      referredBy: null,
      lastSeen: new Date(),
      createdAt: new Date(),
      isBlocked: false,
    };
    this.users.set(testUser.id, testUser);
    console.log("Test user created: username=test, password=123456, no subscription");
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: typeof users.$inferInsert): Promise<User> {
    const id = randomUUID();
    
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 12);
    
    const user: User = { 
      ...insertUser,
      referralCode: insertUser.referralCode || null,
      password: hashedPassword,
      email: insertUser.email || null,
      id,
      isAdmin: false,
      hasSubscription: false,
      isOnline: false,
      referredBy: null,
      lastSeen: new Date(),
      createdAt: new Date(),
      isBlocked: false,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Subscription methods
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = {
      ...insertSubscription,
      id,
      status: insertSubscription.status || "active",
      userId: insertSubscription.userId || null,
      amount: insertSubscription.amount || null,
      purchasedAt: new Date(),
      expiresAt: insertSubscription.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
    this.subscriptions.set(id, subscription);
    
    // Update user subscription status
    if (insertSubscription.userId) {
      await this.updateUser(insertSubscription.userId, { hasSubscription: true });
    }
    
    return subscription;
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => sub.userId === userId,
    );
  }

  async getAllActiveSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => sub.status === "active",
    );
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const userSubs = Array.from(this.subscriptions.values()).filter(
      (sub) => sub.userId === userId && sub.status === "active"
    );
    
    // Check if any subscription is not expired
    const now = new Date();
    return userSubs.some(sub => {
      if (!sub.expiresAt) return false;
      const expiryDate = new Date(sub.expiresAt);
      return expiryDate > now;
    });
  }

  // Chat session methods
  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = {
      ...insertSession,
      id,
      status: insertSession.status || "active",
      userId: insertSession.userId || null,
      vehicleInfo: insertSession.vehicleInfo || null,
      createdAt: new Date(),
      lastActivity: new Date(),
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values()).filter(
      (session) => session.userId === userId,
    );
  }

  async getAllActiveChatSessions(): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values()).filter(
      (session) => session.status === "active",
    );
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates, lastActivity: new Date() };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      sessionId: insertMessage.sessionId || null,
      senderId: insertMessage.senderId || null,
      senderType: insertMessage.senderType || null,
      isRead: insertMessage.isRead || false,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    
    // Update session last activity
    if (insertMessage.sessionId) {
      await this.updateChatSession(insertMessage.sessionId, {});
    }
    
    return message;
  }

  async getSessionMessages(sessionId: string): Promise<(Message & { attachments: Attachment[] })[]> {
    const sessionMessages = Array.from(this.messages.values())
      .filter((msg) => msg.sessionId === sessionId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
    
    // Get attachments for each message
    const messagesWithAttachments = await Promise.all(
      sessionMessages.map(async (message) => {
        const messageAttachments = await this.getMessageAttachments(message.id);
        return {
          ...message,
          attachments: messageAttachments
        };
      })
    );
    
    return messagesWithAttachments;
  }

  async getAllUnreadMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (msg) => !msg.isRead && msg.senderType === "user",
    );
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      this.messages.set(messageId, { ...message, isRead: true });
    }
  }

  async getRecentMessages(limit: number = 50): Promise<Message[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  // Attachment methods
  async createAttachment(insertAttachment: InsertAttachment): Promise<Attachment> {
    const id = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
    
    const attachment: Attachment = {
      ...insertAttachment,
      id,
      messageId: insertAttachment.messageId || null,
      uploadedAt: new Date(),
      expiresAt: expiresAt,
    };
    this.attachments.set(id, attachment);
    return attachment;
  }

  async getMessageAttachments(messageId: string): Promise<Attachment[]> {
    return Array.from(this.attachments.values()).filter(
      (attachment) => attachment.messageId === messageId
    );
  }

  async getAttachment(id: string): Promise<Attachment | undefined> {
    return this.attachments.get(id);
  }

  async getAttachmentByFilename(filename: string): Promise<Attachment | undefined> {
    return Array.from(this.attachments.values()).find(
      (attachment) => attachment.fileName === filename
    );
  }

  async deleteAttachment(id: string): Promise<void> {
    this.attachments.delete(id);
  }

  async getExpiredAttachments(): Promise<Attachment[]> {
    const now = new Date();
    return Array.from(this.attachments.values()).filter(
      (attachment) => new Date(attachment.expiresAt!) < now
    );
  }

  async deleteExpiredAttachments(): Promise<void> {
    const expiredAttachments = await this.getExpiredAttachments();
    expiredAttachments.forEach(attachment => {
      this.attachments.delete(attachment.id);
    });
  }

  async linkAttachmentToMessage(attachmentId: string, messageId: string): Promise<void> {
    const attachment = this.attachments.get(attachmentId);
    if (attachment) {
      attachment.messageId = messageId;
      this.attachments.set(attachmentId, attachment);
    }
  }

  // Referral methods (stub implementations for MemStorage)
  async generateReferralCode(userId: string): Promise<string> {
    return `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.referralCode === code);
  }

  async createReferralReward(reward: InsertReferralReward): Promise<ReferralReward> {
    const id = randomUUID();
    const newReward: ReferralReward = {
      ...reward,
      id,
      status: reward.status || "pending",
      referrerId: reward.referrerId || null,
      referredId: reward.referredId || null,
      requiredReferrals: reward.requiredReferrals || 3,
      currentReferrals: reward.currentReferrals || 0,
      rewardCycle: reward.rewardCycle || 1,
      createdAt: new Date(),
      awardedAt: null,
    };
    return newReward;
  }

  async getUserReferrals(userId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.referredBy === userId);
  }

  async getUserReferralRewards(userId: string): Promise<ReferralReward[]> {
    return []; // Stub implementation
  }

  async updateReferralProgress(referrerId: string, newReferralId: string): Promise<void> {
    // Stub implementation
  }

  async awardReferralReward(rewardId: string): Promise<void> {
    // Stub implementation
  }

  async addSubscriptionDays(userId: string, days: number): Promise<{ success: boolean; message: string; newExpiryDate: string }> {
    // Stub implementation
    return { success: false, message: "Not implemented", newExpiryDate: "" };
  }

  async getGoogleAdsConfig(): Promise<GoogleAdsConfig | null> {
    // Stub implementation
    return null;
  }

  async updateGoogleAdsConfig(config: Partial<InsertGoogleAdsConfig>): Promise<{ success: boolean; message: string }> {
    // Stub implementation
    return { success: false, message: "Not implemented" };
  }

  async getAppConfig(): Promise<any> {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://cipka.onrender.com' 
      : 'http://localhost:5000';
      
    return {
      id: 1,
      appName: 'AutoMentor',
      appUrl: baseUrl,
      stripePublishableKey: '',
      stripeSecretKey: '',
      stripeWebhookSecret: '',
      paypalClientId: '',
      paypalClientSecret: '',
      paypalWebhookId: '',
      paypalMode: 'sandbox',
      smtpHost: '',
      smtpPort: 587,
      smtpSecure: true,
      smtpUser: '',
      smtpPass: '',
      emailFrom: '',
      emailFromName: 'AutoMentor',
      supportEmail: '',
      faviconPath: ''
    };
  }

  async updateAppConfig(config: any): Promise<any> {
    // For memory storage, just return the config
    return config;
  }

  async resetReferralCycle(userId: string): Promise<{ success: boolean; message: string; newCycle: number }> {
    // Stub implementation
    return { success: false, message: "Not implemented", newCycle: 0 };
  }

  // Analytics methods (stub implementations for MemStorage)
  async trackEvent(event: Omit<InsertAnalyticsEvent, 'id' | 'createdAt'>): Promise<void> {
    // Stub implementation - in memory storage doesn't persist analytics
    console.log('Analytics event tracked:', event);
  }

  async getDashboardStats(startDate?: string, endDate?: string): Promise<any> {
    // Calculate real revenue from in-memory subscriptions
    const subscriptionsArray = Array.from(this.subscriptions.values());
    const totalRevenue = subscriptionsArray.reduce((sum, sub) => {
      return sum + (parseFloat(String(sub.amount)) || 0);
    }, 0);

    return {
      totalUsers: this.users.size,
      activeUsers: Array.from(this.users.values()).filter(u => u.isOnline).length,
      totalRevenue: totalRevenue,
      newSubscriptions: this.subscriptions.size,
      totalSessions: this.chatSessions.size
    };
  }

  async getRevenueAnalytics(startDate?: string, endDate?: string): Promise<any> {
    // Calculate real revenue from in-memory subscriptions
    const subscriptionsArray = Array.from(this.subscriptions.values());
    const totalRevenue = subscriptionsArray.reduce((sum, sub) => {
      return sum + (parseFloat(String(sub.amount)) || 0);
    }, 0);

    return {
      totalRevenue: totalRevenue,
      revenueByPeriod: [],
      topCustomers: [],
      paymentMethods: {}
    };
  }

  async getChartData(type: string, period: string): Promise<any> {
    return { labels: [], data: [] };
  }

  // CMS methods (stub implementations for MemStorage)
  async getContentPage(pageKey: string): Promise<ContentPage | null> {
    return null;
  }

  async updateContentPage(pageKey: string, content: Partial<InsertContentPage>): Promise<ContentPage> {
    throw new Error("Not implemented in MemStorage");
  }

  async getAllContentPages(): Promise<ContentPage[]> {
    return [];
  }

  async getFaqs(): Promise<Faq[]> {
    return [];
  }

  async createFaq(faq: Omit<InsertFaq, 'id' | 'createdAt' | 'updatedAt'>): Promise<Faq> {
    throw new Error("Not implemented in MemStorage");
  }

  async updateFaq(id: string, faq: Partial<InsertFaq>): Promise<Faq> {
    throw new Error("Not implemented in MemStorage");
  }

  async deleteFaq(id: string): Promise<void> {
    throw new Error("Not implemented in MemStorage");
  }

  async getTestimonials(approved?: boolean): Promise<Testimonial[]> {
    return [];
  }

  async createTestimonial(testimonial: Omit<InsertTestimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<Testimonial> {
    throw new Error("Not implemented in MemStorage");
  }

  async updateTestimonial(id: string, testimonial: Partial<InsertTestimonial>): Promise<Testimonial> {
    throw new Error("Not implemented in MemStorage");
  }

  async deleteTestimonial(id: string): Promise<void> {
    throw new Error("Not implemented in MemStorage");
  }
}

// PostgreSQL Storage implementation using Drizzle ORM
export class PostgresStorage implements IStorage {


  /**
   * Tworzy wymagane tabele w bazie Postgres, jeśli nie istnieją
   */
  async createRequiredTables() {
    try {
      const database = await dbReady;
      
      // Skip table creation in development (SQLite) - tables are created via migrations
      if (process.env.NODE_ENV !== 'production') {
        console.log('⏭️  Skipping table creation in development mode (using SQLite)');
        return;
      }
      
      await database.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          email TEXT,
          is_admin BOOLEAN DEFAULT FALSE,
          has_subscription BOOLEAN DEFAULT FALSE,
          is_online BOOLEAN DEFAULT FALSE,
          is_blocked BOOLEAN DEFAULT FALSE,
          referral_code TEXT UNIQUE,
          referred_by TEXT,
          last_seen TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS subscriptions (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT REFERENCES users(id),
          amount REAL,
          status TEXT DEFAULT 'active',
          purchased_at TIMESTAMP DEFAULT NOW(),
          expires_at TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT REFERENCES users(id),
          vehicle_info TEXT,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW(),
          last_activity TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id TEXT REFERENCES chat_sessions(id),
          sender_id TEXT REFERENCES users(id),
          sender_type TEXT,
          content TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS attachments (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          message_id TEXT REFERENCES messages(id),
          file_name TEXT NOT NULL,
          original_name TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          mime_type TEXT NOT NULL,
          file_path TEXT NOT NULL,
          uploaded_at TIMESTAMP DEFAULT NOW(),
          expires_at TIMESTAMP
        );
      `);
      console.log('Wszystkie wymagane tabele utworzone automatycznie (startup).');
    } catch (error) {
      console.error('Błąd przy automatycznym tworzeniu tabel (startup):', error);
    }
  }
  


  // =================================================================
  // POSTGRESQL DATE HELPERS - Centralne funkcje do pracy z datami
  // =================================================================
  
  /**
   * Konwertuje wartość z bazy na obiekt Date
   * Drizzle PostgreSQL zwraca daty jako stringi ISO
   */
  private toDate(value: any): Date {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  }

  /**
   * Konwertuje Date na string ISO dla bazy danych
   * Bezpieczna konwersja która zawsze działa
   */
  private toISOString(date: any): string {
    if (!date) return new Date().toISOString();
    
    // Jeśli to już string, sprawdź czy to poprawny ISO
    if (typeof date === 'string') {
      try {
        return new Date(date).toISOString();
      } catch {
        return new Date().toISOString();
      }
    }
    
    // Jeśli to Date, konwertuj
    if (date instanceof Date) {
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    }
    
    // Fallback - nowa data
    return new Date().toISOString();
  }

  /**
   * Naprawia wszystkie pola dat w obiekcie użytkownika
   */
  private normalizeUserDates(user: any): any {
    if (!user) return user;
    
    const safeToDate = (value: any): Date => {
      if (!value || value === null || value === undefined) return new Date();
      if (value instanceof Date && !isNaN(value.getTime())) return value;
      if (typeof value === 'string') {
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
      }
      return new Date();
    };
    
    return {
      ...user,
      createdAt: safeToDate(user.createdAt),
      lastSeen: safeToDate(user.lastSeen)
    };
  }

  /**
   * Bezpieczne parsowanie timestamp z PostgreSQL RAW SQL
   */
  private parseTimestamp(value: any): Date {
    if (!value || value === null || value === undefined) {
      return new Date();
    }
    
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }
    
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    
    return new Date();
  }

  /**
   * Naprawia wszystkie pola dat w subskrypcji
   */
  private normalizeSubscriptionDates(sub: any): any {
    if (!sub) return sub;
    
    return {
      ...sub,
      purchasedAt: this.toDate(sub.purchasedAt),
      expiresAt: this.toDate(sub.expiresAt)
    };
  }

  // Function to fix all existing subscriptions with invalid dates
  async fixAllInvalidSubscriptions(): Promise<void> {
    try {
      console.log('🔍 Checking for subscriptions with invalid dates...');
      const allSubs = await db.select().from(subscriptions);
      
      for (const sub of allSubs) {
        let needsUpdate = false;
        const updates: any = {};
        
        // Check purchasedAt
        const purchasedDate = new Date(sub.purchasedAt);
        if (!sub.purchasedAt || sub.purchasedAt === 'Invalid Date' || isNaN(purchasedDate.getTime())) {
          updates.purchasedAt = new Date();
          needsUpdate = true;
          console.log(`🔧 Will fix purchasedAt for subscription ${sub.id}`);
        }
        
        // Check expiresAt  
        const expiresDate = new Date(sub.expiresAt);
        if (!sub.expiresAt || sub.expiresAt === 'Invalid Date' || isNaN(expiresDate.getTime())) {
          const daysToAdd = sub.amount === 14.99 ? 1 : (sub.amount === 49.99 ? 30 : 366);
          updates.expiresAt = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
          needsUpdate = true;
          console.log(`🔧 Will fix expiresAt for subscription ${sub.id}`);
        }
        
        if (needsUpdate) {
          await db.update(subscriptions)
            .set(updates)
            .where(eq(subscriptions.id, sub.id));
          console.log(`✅ Fixed subscription ${sub.id}`);
        }
      }
      
      console.log('✅ Finished checking/fixing subscription dates');
    } catch (error) {
      console.error('❌ Error fixing subscription dates:', error);
    }
  }



  async initAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (adminEmail && adminPassword) {
      const existingAdmin = await this.getUserByEmail(adminEmail);
      if (!existingAdmin) {
        try {
          // RAW SQL operation to create admin user
          const hashedPassword = await bcrypt.hash(adminPassword, 12);
          const adminId = randomUUID();
          const now = new Date().toISOString();
          
          await db.execute(sql`
            INSERT INTO users (
              id, username, password, email, is_admin, has_subscription, 
              is_online, is_blocked, created_at, last_seen
            ) VALUES (
              ${adminId}, 'admin', ${hashedPassword}, ${adminEmail}, 
              true, true, false, false, ${now}::timestamp, ${now}::timestamp
            )
          `);
          console.log(`✅ Admin user created with RAW SQL - email: ${adminEmail}`);
        } catch (error) {
          console.error(`❌ Failed to create admin user:`, error);
        }
      } else {
        console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
      }
    }

    // Create test user without subscription
    const existingTestUser = await this.getUserByUsername("test");
    if (!existingTestUser) {
      const testPassword = await bcrypt.hash("123456", 12);
      await db.insert(users).values({
        username: "test",
        password: testPassword,
        email: "test@example.com",
        isAdmin: false,
        hasSubscription: false,
        isOnline: false,
        isBlocked: false,
      });
      console.log("Test user created: username=test, password=123456, no subscription");
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      console.log(`🔥 RAW SQL getUser for ID: ${id}`);
      const result = await db.execute(sql`
        SELECT id, username, email, password, is_admin as "isAdmin", is_blocked as "isBlocked", 
               has_subscription as "hasSubscription", is_online as "isOnline",
               referral_code as "referralCode", referred_by as "referredBy", created_at, last_seen 
        FROM users 
        WHERE id = ${id} 
        LIMIT 1
      `);
      
      // Handle different PostgreSQL response structures
      let userData = null;
      if (result?.rows && result.rows.length > 0) {
        userData = result.rows[0];
      } else if (Array.isArray(result) && result.length > 0) {
        userData = result[0];
      }
      
      if (userData) {
        const rawUser = userData as any;
        console.log(`🔍 Raw PostgreSQL user for ${id}:`, {
          lastSeenRaw: rawUser.last_seen,
          lastSeenType: typeof rawUser.last_seen,
          createdAtRaw: rawUser.created_at,
          createdAtType: typeof rawUser.created_at
        });
        
        const user = {
          id: rawUser.id,
          username: rawUser.username,
          email: rawUser.email,
          password: rawUser.password,
          isAdmin: rawUser.isAdmin,
          isBlocked: rawUser.isBlocked,
          hasSubscription: rawUser.hasSubscription,
          isOnline: rawUser.isOnline,
          referralCode: rawUser.referralCode,
          referredBy: rawUser.referredBy,
          createdAt: this.parseTimestamp(rawUser.created_at),
          lastSeen: this.parseTimestamp(rawUser.last_seen)
        };
        
        console.log(`✅ User ${id} dates normalized:`, {
          lastSeen: user.lastSeen,
          createdAt: user.createdAt
        });
        return user;
      }
      return undefined;
    } catch (error) {
      console.error("❌ RAW SQL getUser error:", error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log(`🔥 RAW SQL getUserByUsername: ${username}`);
      const result = await db.execute(sql`
        SELECT id, username, email, password, is_admin as "isAdmin", is_blocked as "isBlocked", 
               has_subscription as "hasSubscription", is_online as "isOnline",
               referral_code as "referralCode", referred_by as "referredBy", created_at, last_seen 
        FROM users 
        WHERE username = ${username} 
        LIMIT 1
      `);
      
      // Handle different PostgreSQL response structures
      let userData = null;
      if (result?.rows && result.rows.length > 0) {
        userData = result.rows[0];
      } else if (Array.isArray(result) && result.length > 0) {
        userData = result[0];
      }
      
      if (userData) {
        const rawUser = userData as any;
        return {
          id: rawUser.id,
          username: rawUser.username,
          email: rawUser.email,
          password: rawUser.password,
          isAdmin: rawUser.isAdmin,
          isBlocked: rawUser.isBlocked,
          hasSubscription: rawUser.hasSubscription,
          isOnline: rawUser.isOnline,
          referralCode: rawUser.referralCode,
          referredBy: rawUser.referredBy,
          createdAt: this.parseTimestamp(rawUser.created_at),
          lastSeen: this.parseTimestamp(rawUser.last_seen)
        };
      }
      return undefined;
    } catch (error) {
      console.error("❌ RAW SQL getUserByUsername error:", error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      console.log(`� RAW SQL getUserByEmail: ${email}`);
      const result = await db.execute(sql`
        SELECT id, username, email, password, is_admin as "isAdmin", is_blocked as "isBlocked", 
               has_subscription as "hasSubscription", is_online as "isOnline",
               referral_code as "referralCode", referred_by as "referredBy", created_at, last_seen 
        FROM users 
        WHERE email = ${email} 
        LIMIT 1
      `);
      
      console.log(`🔍 PostgreSQL result structure:`, {
        result: typeof result,
        hasRows: !!result?.rows,
        rowsLength: result?.rows?.length,
        isArray: Array.isArray(result),
        resultLength: Array.isArray(result) ? result.length : 'not array'
      });
      
      // Handle different PostgreSQL response structures
      let userData = null;
      if (result?.rows && result.rows.length > 0) {
        userData = result.rows[0];
      } else if (Array.isArray(result) && result.length > 0) {
        userData = result[0];
      }
      
      if (userData) {
        const rawUser = userData as any;
        console.log(`✅ RAW SQL: Found user "${email}" - isAdmin: ${rawUser.isAdmin}`);
        return {
          id: rawUser.id,
          username: rawUser.username,
          email: rawUser.email,
          password: rawUser.password,
          isAdmin: rawUser.isAdmin,
          isBlocked: rawUser.isBlocked,
          hasSubscription: rawUser.hasSubscription,
          isOnline: rawUser.isOnline,
          referralCode: rawUser.referralCode,
          referredBy: rawUser.referredBy,
          createdAt: this.parseTimestamp(rawUser.created_at),
          lastSeen: this.parseTimestamp(rawUser.last_seen)
        };
      }
      
      console.log(`❌ No user found with email "${email}"`);
      return undefined;
      
    } catch (error) {
      console.error('❌ RAW SQL getUserByEmail error:', error);
      throw error;
    }
  }

  async createUser(user: typeof users.$inferInsert): Promise<User> {
    try {
      console.log(`� FIXED PostgreSQL createUser using RAW SQL`);
      
      const hashedPassword = await bcrypt.hash(user.password, 12);
      const userId = randomUUID();
      const now = new Date().toISOString(); // Direct ISO string creation
      
      // Use RAW SQL to avoid Drizzle ORM type issues
      const result = await db.execute(sql`
        INSERT INTO users (
          id, username, password, email, is_admin, has_subscription, 
          is_online, is_blocked, referral_code, referred_by, created_at, last_seen
        ) VALUES (
          ${userId}, ${user.username}, ${hashedPassword}, ${user.email}, 
          ${user.isAdmin ?? false}, ${user.hasSubscription ?? false},
          ${user.isOnline ?? false}, ${user.isBlocked ?? false}, 
          ${user.referralCode || null}, ${user.referredBy || null}, 
          ${now}::timestamp, ${now}::timestamp
        ) RETURNING *
      `);
      
      console.log(`✅ RAW SQL createUser successful for ${user.username}`);
      console.log(`🔍 Raw result structure:`, result);
      
      // Handle different result structures between PostgreSQL drivers
      let newUser: any;
      if (result.rows && result.rows.length > 0) {
        newUser = result.rows[0];
      } else if (Array.isArray(result) && result.length > 0) {
        newUser = result[0];
      } else if (result[0]) {
        newUser = result[0];
      } else {
        throw new Error('No user returned from INSERT query');
      }
      
      console.log(`👤 New user from DB:`, newUser);
      return this.normalizeUserDates(newUser as User);
    } catch (error: any) {
      console.error('SQL error podczas tworzenia użytkownika:', error?.message || error);
      // Spróbuj utworzyć wszystkie wymagane tabele jeśli nie istnieją
      if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
        try {
          await db.run(sql`
            CREATE TABLE IF NOT EXISTS users (
              id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
              username TEXT NOT NULL UNIQUE,
              password TEXT NOT NULL,
              email TEXT,
              is_admin BOOLEAN DEFAULT FALSE,
              has_subscription BOOLEAN DEFAULT FALSE,
              is_online BOOLEAN DEFAULT FALSE,
              is_blocked BOOLEAN DEFAULT FALSE,
              referral_code TEXT UNIQUE,
              referred_by TEXT,
              last_seen TIMESTAMP DEFAULT NOW(),
              created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS subscriptions (
              id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id TEXT REFERENCES users(id),
              amount REAL,
              status TEXT DEFAULT 'active',
              purchased_at TIMESTAMP DEFAULT NOW(),
              expires_at TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS chat_sessions (
              id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id TEXT REFERENCES users(id),
              vehicle_info TEXT,
              status TEXT DEFAULT 'active',
              created_at TIMESTAMP DEFAULT NOW(),
              last_activity TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS messages (
              id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
              session_id TEXT REFERENCES chat_sessions(id),
              sender_id TEXT REFERENCES users(id),
              sender_type TEXT,
              content TEXT NOT NULL,
              is_read BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS attachments (
              id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
              message_id TEXT REFERENCES messages(id),
              file_name TEXT NOT NULL,
              original_name TEXT NOT NULL,
              file_size INTEGER NOT NULL,
              mime_type TEXT NOT NULL,
              file_path TEXT NOT NULL,
              uploaded_at TIMESTAMP DEFAULT NOW(),
              expires_at TIMESTAMP
            );
          `);
          console.log('Wszystkie wymagane tabele utworzone automatycznie.');
        } catch (tableError) {
          console.error('Błąd przy automatycznym tworzeniu tabel:', tableError);
        }
      }
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      console.log(`🔄 PostgreSQL updateUser ${id} with:`, updates);
      
      // Bezpieczna konwersja wszystkich dat dla PostgreSQL
      const dbUpdates: any = { ...updates };
      
      // Konwertuj pola dat na ISO stringi dla bazy
      if (dbUpdates.lastSeen) {
        dbUpdates.lastSeen = this.toISOString(dbUpdates.lastSeen);
        console.log(`� Converted lastSeen to ISO: ${dbUpdates.lastSeen}`);
      }
      
      if (dbUpdates.createdAt) {
        dbUpdates.createdAt = this.toISOString(dbUpdates.createdAt);
        console.log(`📅 Converted createdAt to ISO: ${dbUpdates.createdAt}`);
      }
      
      console.log(`� Saving to PostgreSQL:`, dbUpdates);
      
      // ZASTĄPIONE RAW SQL - Drizzle ORM ma problemy z PostgreSQL timestamp
      const setParts: string[] = [];
      const values: any[] = [];
      
      Object.entries(dbUpdates).forEach(([key, value]) => {
        let dbColumnName = key;
        switch (key) {
          case 'isAdmin': dbColumnName = 'is_admin'; break;
          case 'hasSubscription': dbColumnName = 'has_subscription'; break;
          case 'isOnline': dbColumnName = 'is_online'; break;
          case 'isBlocked': dbColumnName = 'is_blocked'; break;
          case 'referralCode': dbColumnName = 'referral_code'; break;
          case 'referredBy': dbColumnName = 'referred_by'; break;
          case 'lastSeen': dbColumnName = 'last_seen'; break;
          case 'createdAt': dbColumnName = 'created_at'; break;
        }
        setParts.push(`${dbColumnName} = '${value}'${key.includes('Seen') || key.includes('At') ? '::timestamp' : ''}`);
      });
      
      const result = await db.execute(sql`
        UPDATE users 
        SET ${sql.raw(setParts.join(', '))}
        WHERE id = ${id}
        RETURNING *
      `);
      
      // Handle PostgreSQL result structure
      let updatedUser: any;
      if (result.rows && result.rows.length > 0) {
        updatedUser = result.rows[0];
      } else if (Array.isArray(result) && result.length > 0) {
        updatedUser = result[0];
      } else if (result[0]) {
        updatedUser = result[0];
      }
      
      if (updatedUser) {
        const normalizedUser = this.normalizeUserDates(updatedUser);
        console.log(`✅ RAW SQL User ${id} updated, dates normalized`);
        return normalizedUser;
      }
      
      return undefined;
    } catch (error) {
      console.error(`❌ PostgreSQL updateUser error for ${id}:`, error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      console.log("🔥 RAW SQL getAllUsers");
      const result = await db.execute(sql`
        SELECT id, username, email, password, is_admin as "isAdmin", is_blocked as "isBlocked", 
               has_subscription as "hasSubscription", is_online as "isOnline",
               referral_code as "referralCode", referred_by as "referredBy", created_at, last_seen 
        FROM users 
        ORDER BY created_at DESC
      `);
      
      console.log(`🔍 getAllUsers PostgreSQL result:`, {
        result: typeof result,
        hasRows: !!result?.rows,
        rowsLength: result?.rows?.length,
        isArray: Array.isArray(result)
      });
      
      // Handle different PostgreSQL response structures
      let usersData = [];
      if (result?.rows && Array.isArray(result.rows)) {
        usersData = result.rows;
      } else if (Array.isArray(result)) {
        usersData = result;
      }
      
      return usersData.map((rawUser: any) => ({
        id: rawUser.id,
        username: rawUser.username,
        email: rawUser.email,
        password: rawUser.password,
        isAdmin: rawUser.isAdmin,
        isBlocked: rawUser.isBlocked,
        hasSubscription: rawUser.hasSubscription,
        isOnline: rawUser.isOnline,
        referralCode: rawUser.referralCode,
        referredBy: rawUser.referredBy,
        createdAt: this.parseTimestamp(rawUser.created_at),
        lastSeen: this.parseTimestamp(rawUser.last_seen)
      }));
    } catch (error) {
      console.error("❌ RAW SQL getAllUsers error:", error);
      throw error;
    }
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Subscription methods
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    try {
      console.log(`🔥 RAW SQL createSubscription for user ${subscription.userId}`);
      
      const subscriptionId = randomUUID();
      const now = new Date().toISOString(); // Direct ISO string
      
      // Calculate expires based on amount - FIXED LOGIC
      let expiresAt: string;
      if (subscription.expiresAt) {
        expiresAt = subscription.expiresAt instanceof Date 
          ? subscription.expiresAt.toISOString() 
          : new Date(subscription.expiresAt).toISOString();
      } else {
        // Set proper expiration based on amount
        const daysToAdd = subscription.amount === 14.99 ? 1 : (subscription.amount === 49.99 ? 30 : 366);
        expiresAt = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
      }
      
      console.log(`💳 Creating subscription: amount=${subscription.amount}, expires=${expiresAt}`);
      
      // Use RAW SQL for subscription creation
      const result = await db.execute(sql`
        INSERT INTO subscriptions (
          id, user_id, amount, status, purchased_at, expires_at
        ) VALUES (
          ${subscriptionId}, ${subscription.userId}, ${subscription.amount}, 
          ${subscription.status || 'active'}, ${now}::timestamp, ${expiresAt}::timestamp
        ) RETURNING *
      `);
      
      // Handle result structure
      let createdSub: any;
      if (result.rows && result.rows.length > 0) {
        createdSub = result.rows[0];
      } else if (Array.isArray(result) && result.length > 0) {
        createdSub = result[0];
      } else if (result[0]) {
        createdSub = result[0];
      } else {
        throw new Error('No subscription returned from INSERT');
      }
      
      console.log(`✅ RAW SQL createSubscription successful: ${subscriptionId}`);
      return this.normalizeSubscriptionDates(createdSub);
    } catch (error) {
      console.error('❌ RAW SQL createSubscription error:', error);
      throw error;
    }
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      console.log(`🔥 RAW SQL getUserSubscriptions for: ${userId}`);
      const result = await db.execute(sql`
        SELECT id, user_id as "userId", amount, status, purchased_at, expires_at
        FROM subscriptions 
        WHERE user_id = ${userId} 
        ORDER BY purchased_at DESC
      `);
      
      // Handle different PostgreSQL response structures
      let subsData = [];
      if (result?.rows && Array.isArray(result.rows)) {
        subsData = result.rows;
      } else if (Array.isArray(result)) {
        subsData = result;
      }
      
      return subsData.map((sub: any) => ({
        id: sub.id,
        userId: sub.userId,
        amount: sub.amount,
        status: sub.status,
        purchasedAt: this.parseTimestamp(sub.purchased_at),
        expiresAt: this.parseTimestamp(sub.expires_at)
      }));
    } catch (error) {
      console.error("❌ RAW SQL getUserSubscriptions error:", error);
      throw error;
    }
  }

  async getAllActiveSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions)
      .where(eq(subscriptions.status, "active"));
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    // getUserSubscriptions już normalizuje daty, więc sub.expiresAt to zawsze Date
    const userSubscriptions = await this.getUserSubscriptions(userId);
    
    const now = new Date();
    const hasActive = userSubscriptions.some((sub: Subscription) => {
      if (sub.status !== "active") return false;
      if (!sub.expiresAt) return false;
      
      // sub.expiresAt to już Date dzięki normalizeSubscriptionDates
      const expiresDate = sub.expiresAt;
      const isActive = expiresDate > now;
      
      console.log(`📅 PostgreSQL subscription check for ${userId}: ${sub.id} expires ${this.toISOString(expiresDate)}, active: ${isActive}`);
      return isActive;
    });
    
    console.log(`🔍 hasActiveSubscription result for user ${userId}:`, hasActive);
    return hasActive;
  }

  // Chat session methods
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    try {
      console.log('🔥 RAW SQL createChatSession for user:', session.userId);
      
      const sessionId = randomUUID();
      const now = new Date().toISOString(); // Direct ISO string
      const vehicleInfoStr = typeof session.vehicleInfo === 'string' 
        ? session.vehicleInfo 
        : JSON.stringify(session.vehicleInfo);
      
      console.log('🚗 Creating chat session with RAW SQL:', {
        sessionId,
        userId: session.userId,
        vehicleInfo: vehicleInfoStr,
        status: session.status || 'active',
        now
      });
      
      // Use RAW SQL to avoid Drizzle ORM timestamp issues
      const result = await db.execute(sql`
        INSERT INTO chat_sessions (
          id, user_id, vehicle_info, status, created_at, last_activity
        ) VALUES (
          ${sessionId}, ${session.userId}, ${vehicleInfoStr}, 
          ${session.status || 'active'}, ${now}::timestamp, ${now}::timestamp
        ) RETURNING *
      `);
      
      // Handle PostgreSQL result structure
      let createdSession: any;
      if (result.rows && result.rows.length > 0) {
        createdSession = result.rows[0];
      } else if (Array.isArray(result) && result.length > 0) {
        createdSession = result[0];
      } else if (result[0]) {
        createdSession = result[0];
      } else {
        throw new Error('No chat session returned from INSERT');
      }
      
      console.log('✅ RAW SQL chat session created:', sessionId);
      return createdSession as ChatSession;
    } catch (error) {
      console.error('❌ RAW SQL createChatSession error:', error);
      throw error;
    }
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    try {
      console.log(`🔥 RAW SQL getChatSession: ${id}`);
      const result = await db.execute(sql`
        SELECT id, user_id as "userId", vehicle_info as "vehicleInfo", 
               status, created_at, last_activity 
        FROM chat_sessions 
        WHERE id = ${id} 
        LIMIT 1
      `);
      
      // 🛡️ DEFENSIVE MAPPING: Handle different PostgreSQL response structures
      let sessionData = null;
      if (result?.rows && Array.isArray(result.rows) && result.rows[0]) {
        sessionData = result.rows[0];
      } else if (Array.isArray(result) && result[0]) {
        sessionData = result[0];
      }
      
      if (sessionData) {
        const rawSession = sessionData as any;
        return {
          id: rawSession.id,
          userId: rawSession.userId,
          vehicleInfo: rawSession.vehicleInfo,
          status: rawSession.status,
          createdAt: this.parseTimestamp(rawSession.created_at),
          lastActivity: this.parseTimestamp(rawSession.last_activity)
        };
      }
      return undefined;
    } catch (error) {
      console.error("❌ RAW SQL getChatSession error:", error);
      throw error;
    }
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      console.log(`🔥 RAW SQL getUserChatSessions: ${userId}`);
      const result = await db.execute(sql`
        SELECT id, user_id as "userId", vehicle_info as "vehicleInfo", 
               status, created_at, last_activity 
        FROM chat_sessions 
        WHERE user_id = ${userId} 
        ORDER BY last_activity DESC
      `);
      
      // Handle different PostgreSQL response structures
      let sessionsData = [];
      if (result?.rows && Array.isArray(result.rows)) {
        sessionsData = result.rows;
      } else if (Array.isArray(result)) {
        sessionsData = result;
      }
      
      return sessionsData.map((rawSession: any) => ({
        id: rawSession.id,
        userId: rawSession.userId,
        vehicleInfo: rawSession.vehicleInfo,
        status: rawSession.status,
        createdAt: this.parseTimestamp(rawSession.created_at),
        lastActivity: this.parseTimestamp(rawSession.last_activity)
      }));
    } catch (error) {
      console.error("❌ RAW SQL getUserChatSessions error:", error);
      throw error;
    }
  }

  async getAllActiveChatSessions(): Promise<ChatSession[]> {
    try {
      console.log("🔥 RAW SQL getAllActiveChatSessions");
      const result = await db.execute(sql`
        SELECT id, user_id as "userId", vehicle_info as "vehicleInfo", 
               status, created_at, last_activity 
        FROM chat_sessions 
        WHERE status = 'active' 
        ORDER BY last_activity DESC
      `);
      
      // Handle different PostgreSQL response structures
      let sessionsData = [];
      if (result?.rows && Array.isArray(result.rows)) {
        sessionsData = result.rows;
      } else if (Array.isArray(result)) {
        sessionsData = result;
      }
      
      return sessionsData.map((rawSession: any) => ({
        id: rawSession.id,
        userId: rawSession.userId,
        vehicleInfo: rawSession.vehicleInfo,
        status: rawSession.status,
        createdAt: this.parseTimestamp(rawSession.created_at),
        lastActivity: this.parseTimestamp(rawSession.last_activity)
      }));
    } catch (error) {
      console.error("❌ RAW SQL getAllActiveChatSessions error:", error);
      throw error;
    }
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    try {
      console.log(`🔥 RAW SQL updateChatSession: ${id}`, updates);
      
      // Simple approach: handle common update patterns
      if (updates.status) {
        const result = await db.execute(sql`
          UPDATE chat_sessions 
          SET status = ${updates.status}
          WHERE id = ${id} 
          RETURNING id, user_id as "userId", vehicle_info as "vehicleInfo", status, created_at, last_activity
        `);
        
        // Handle different response structures
        let sessionData = null;
        if (result?.rows && result.rows.length > 0) {
          sessionData = result.rows[0];
        } else if (Array.isArray(result) && result.length > 0) {
          sessionData = result[0];
        }
        
        if (sessionData) {
          const rawSession = sessionData as any;
          return {
            id: rawSession.id,
            userId: rawSession.userId,
            vehicleInfo: rawSession.vehicleInfo,
            status: rawSession.status,
            createdAt: this.parseTimestamp(rawSession.created_at),
            lastActivity: this.parseTimestamp(rawSession.last_activity)
          };
        }
      }
      
      // If no handled updates, return current session
      return await this.getChatSession(id);
    } catch (error) {
      console.error("❌ RAW SQL updateChatSession error:", error);
      throw error;
    }
  }

  // Message methods
  async createMessage(message: InsertMessage): Promise<Message> {
    try {
      console.log(`� RAW SQL createMessage for session ${message.sessionId}`);
      
      const messageId = randomUUID();
      const now = new Date().toISOString();
      
      // Use RAW SQL for message creation
      const result = await db.execute(sql`
        INSERT INTO messages (
          id, session_id, sender_id, sender_type, content, is_read, created_at
        ) VALUES (
          ${messageId}, ${message.sessionId}, ${message.senderId}, 
          ${message.senderType}, ${message.content}, ${message.isRead || false}, 
          ${now}::timestamp
        ) RETURNING *
      `);
      
      // Update chat session lastActivity with RAW SQL
      if (message.sessionId) {
        console.log(`🔄 RAW SQL updating session ${message.sessionId} lastActivity`);
        await db.execute(sql`
          UPDATE chat_sessions 
          SET last_activity = ${now}::timestamp 
          WHERE id = ${message.sessionId}
        `);
      }
      
      // Handle PostgreSQL result structure
      let createdMessage: any;
      if (result.rows && result.rows.length > 0) {
        createdMessage = result.rows[0];
      } else if (Array.isArray(result) && result.length > 0) {
        createdMessage = result[0];
      } else if (result[0]) {
        createdMessage = result[0];
      } else {
        throw new Error('No message returned from INSERT');
      }
      
      console.log(`✅ RAW SQL message created successfully: ${messageId}`);
      return createdMessage as Message;
    } catch (error) {
      console.error(`❌ RAW SQL createMessage error:`, error);
      throw error;
    }
  }

  async getSessionMessages(sessionId: string): Promise<(Message & { attachments: Attachment[] })[]> {
    try {
      console.log(`🔥 RAW SQL getSessionMessages for session: ${sessionId}`);
      const result = await db.execute(sql`
        SELECT id, session_id as "sessionId", sender_id as "senderId", 
               sender_type as "senderType", content, created_at 
        FROM messages 
        WHERE session_id = ${sessionId} 
        ORDER BY created_at ASC
      `);
      
      // Handle different response structures
      let messagesData = [];
      if (result?.rows && Array.isArray(result.rows)) {
        messagesData = result.rows;
      } else if (Array.isArray(result)) {
        messagesData = result;
      }
      
      // Get attachments for each message
      const messagesWithAttachments = await Promise.all(
        messagesData.map(async (rawMessage: any) => {
          const message = {
            id: rawMessage.id,
            sessionId: rawMessage.sessionId,
            senderId: rawMessage.senderId,
            senderType: rawMessage.senderType,
            content: rawMessage.content,
            createdAt: this.parseTimestamp(rawMessage.created_at)
          };
          
          const messageAttachments = await this.getMessageAttachments(message.id);
          return {
            ...message,
            attachments: messageAttachments
          };
        })
      );
      
      return messagesWithAttachments;
    } catch (error) {
      console.error("❌ RAW SQL getSessionMessages error:", error);
      throw error;
    }
  }

  async getAllUnreadMessages(): Promise<Message[]> {
    try {
      return await db.select().from(messages)
        .where(
          and(
              eq(messages.isRead, false), // Use false for PostgreSQL compatibility
            eq(messages.senderType, "user")
          )
        );
    } catch (error) {
      console.error("Error getting unread messages (PostgreSQL/SQLite compatibility issue):", error);
      // Return empty array for SQLite compatibility
      return [];
    }
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  async getRecentMessages(limit: number = 50): Promise<Message[]> {
    return await db.select().from(messages)
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  // Attachment methods
  async createAttachment(attachment: InsertAttachment): Promise<Attachment> {
    try {
      console.log(`🔥 RAW SQL createAttachment for message ${attachment.messageId}`);
      
      const attachmentId = randomUUID();
      const now = new Date().toISOString();
      
      // Calculate expires date (default 30 days from now)
      let expiresAt: string;
      if (attachment.expiresAt) {
        expiresAt = attachment.expiresAt instanceof Date 
          ? attachment.expiresAt.toISOString() 
          : new Date(attachment.expiresAt).toISOString();
      } else {
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);
        expiresAt = expires.toISOString();
      }
      
      // RAW SQL insert
      const result = await db.execute(sql`
        INSERT INTO attachments (
          id, message_id, file_name, original_name, file_size, 
          mime_type, file_path, uploaded_at, expires_at
        ) VALUES (
          ${attachmentId}, ${attachment.messageId}, ${attachment.fileName}, 
          ${attachment.originalName}, ${attachment.fileSize}, ${attachment.mimeType}, 
          ${attachment.filePath}, ${now}::timestamp, ${expiresAt}::timestamp
        ) RETURNING *
      `);
      
      // Handle different result structures
      let createdAttachment: any;
      if (result.rows && result.rows.length > 0) {
        createdAttachment = result.rows[0];
      } else if (Array.isArray(result) && result.length > 0) {
        createdAttachment = result[0];
      } else {
        throw new Error('No attachment returned from INSERT');
      }
      
      console.log(`✅ RAW SQL createAttachment successful: ${attachmentId}`);
      
      return {
        id: createdAttachment.id,
        messageId: createdAttachment.message_id,
        fileName: createdAttachment.file_name,
        originalName: createdAttachment.original_name,
        fileSize: createdAttachment.file_size,
        mimeType: createdAttachment.mime_type,
        filePath: createdAttachment.file_path,
        uploadedAt: new Date(createdAttachment.uploaded_at),
        expiresAt: new Date(createdAttachment.expires_at)
      };
    } catch (error) {
      console.error('❌ RAW SQL createAttachment error:', error);
      throw error;
    }
  }

  async getMessageAttachments(messageId: string): Promise<Attachment[]> {
    try {
      console.log(`🔥 RAW SQL getMessageAttachments for message ${messageId}`);
      
      const result = await db.execute(sql`
        SELECT 
          id, message_id as "messageId", file_name as "fileName", 
          original_name as "originalName", file_size as "fileSize", 
          mime_type as "mimeType", file_path as "filePath", 
          uploaded_at as "uploadedAt", expires_at as "expiresAt"
        FROM attachments 
        WHERE message_id = ${messageId}
        ORDER BY uploaded_at ASC
      `);
      
      // Handle different result structures
      let rows: any[] = [];
      if (result.rows && Array.isArray(result.rows)) {
        rows = result.rows;
      } else if (Array.isArray(result)) {
        rows = result;
      }
      
      console.log(`✅ Found ${rows.length} attachments for message ${messageId}`);
      
      return rows.map((row: any) => ({
        id: row.id,
        messageId: row.messageId,
        fileName: row.fileName,
        originalName: row.originalName,
        fileSize: row.fileSize,
        mimeType: row.mimeType,
        filePath: row.filePath,
        uploadedAt: new Date(row.uploadedAt),
        expiresAt: new Date(row.expiresAt)
      }));
    } catch (error) {
      console.error('❌ RAW SQL getMessageAttachments error:', error);
      return [];
    }
  }

  async getAttachment(id: string): Promise<Attachment | undefined> {
    const result = await db.select().from(attachments)
      .where(eq(attachments.id, id)).limit(1);
    return result[0];
  }

  async getAttachmentByFilename(filename: string): Promise<Attachment | undefined> {
    const result = await db.select().from(attachments)
      .where(eq(attachments.fileName, filename)).limit(1);
    return result[0];
  }

  async deleteAttachment(id: string): Promise<void> {
    await db.delete(attachments).where(eq(attachments.id, id));
  }

  async getExpiredAttachments(): Promise<Attachment[]> {
    const now = new Date();
    return await db.select().from(attachments)
      .where(lt(attachments.expiresAt, now));
  }

  async deleteExpiredAttachments(): Promise<void> {
    const now = new Date();
    await db.delete(attachments).where(lt(attachments.expiresAt, now));
  }

  async linkAttachmentToMessage(attachmentId: string, messageId: string): Promise<void> {
    await db.update(attachments)
      .set({ messageId })
      .where(eq(attachments.id, attachmentId));
  }

  // Referral methods implementation
  async generateReferralCode(userId: string): Promise<string> {
    // Generate a unique 8-character code
    const code = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Update user with referral code
    await db.update(users)
      .set({ referralCode: code })
      .where(eq(users.id, userId));
    
    return code;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const result = await db.select()
      .from(users)
      .where(eq(users.referralCode, code))
      .limit(1);
    
    return result[0];
  }

  async createReferralReward(reward: InsertReferralReward): Promise<ReferralReward> {
    const id = randomUUID();
    const newReward = {
      ...reward,
      id,
      createdAt: new Date(),
    };
    
    await db.insert(referralRewards).values(newReward);
    
    const result = await db.select()
      .from(referralRewards)
      .where(eq(referralRewards.id, id))
      .limit(1);
    
    return result[0];
  }

  async getUserReferrals(userId: string): Promise<User[]> {
    const result = await db.select()
      .from(users)
      .where(eq(users.referredBy, userId));
    
    return result;
  }

  async getUserReferralRewards(userId: string): Promise<ReferralReward[]> {
    const result = await db.select()
      .from(referralRewards)
      .where(eq(referralRewards.referrerId, userId));
    
    return result;
  }

  async updateReferralProgress(referrerId: string, newReferralId: string): Promise<void> {
    // Get current referral count
    const referrals = await this.getUserReferrals(referrerId);
    const currentCount = referrals.length;
    
    // Get current active reward cycle (pending or active)
    const existingReward = await db.select()
      .from(referralRewards)
      .where(and(
        eq(referralRewards.referrerId, referrerId),
        eq(referralRewards.status, "pending")
      ))
      .orderBy(desc(referralRewards.rewardCycle))
      .limit(1);
    
    if (existingReward.length > 0) {
      // Update existing pending reward with new referral count
      const newCurrentReferrals = (existingReward[0].currentReferrals || 0) + 1;
      
      await db.update(referralRewards)
        .set({ currentReferrals: newCurrentReferrals })
        .where(eq(referralRewards.id, existingReward[0].id));
      
      // If reached 3 referrals, award the bonus
      if (newCurrentReferrals >= 3) {
        await this.awardReferralReward(existingReward[0].id);
      }
    } else {
      // Create new referral reward tracker for first cycle
      await this.createReferralReward({
        referrerId,
        referredId: newReferralId,
        rewardType: "free_month",
        rewardValue: 30,
        currentReferrals: 1,
        requiredReferrals: 3,
        rewardCycle: 1,
        status: "pending"
      });
    }
  }

  async awardReferralReward(rewardId: string): Promise<void> {
    // Mark reward as awarded
    await db.update(referralRewards)
      .set({ 
        status: "awarded",
        awardedAt: new Date()
      })
      .where(eq(referralRewards.id, rewardId));
    
    // Get the reward details
    const reward = await db.select()
      .from(referralRewards)
      .where(eq(referralRewards.id, rewardId))
      .limit(1);
    
    if (reward.length > 0 && reward[0].referrerId) {
      // Check if user already has an active subscription
      const existingSubscription = await db.select()
        .from(subscriptions)
        .where(and(
          eq(subscriptions.userId, reward[0].referrerId),
          eq(subscriptions.status, "active")
        ))
        .orderBy(desc(subscriptions.expiresAt))
        .limit(1);

      if (existingSubscription.length > 0) {
        // User has active subscription - extend it by adding reward days
        const currentExpiryDate = new Date(existingSubscription[0].expiresAt || new Date());
        const newExpiryDate = new Date(currentExpiryDate);
        newExpiryDate.setDate(newExpiryDate.getDate() + reward[0].rewardValue);
        
        // Update existing subscription expiry date
        await db.update(subscriptions)
          .set({ expiresAt: newExpiryDate })
          .where(eq(subscriptions.id, existingSubscription[0].id));
      } else {
        // User has no active subscription - create new one
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + reward[0].rewardValue);
        
        await db.insert(subscriptions).values({
          userId: reward[0].referrerId,
          amount: 0, // Free subscription
          status: "active",
          expiresAt: expiresAt
        });
      }
      
      // Update user subscription status
      await db.update(users)
        .set({ hasSubscription: true })
        .where(eq(users.id, reward[0].referrerId));
    }
  }

  async addSubscriptionDays(userId: string, days: number): Promise<{ success: boolean; message: string; newExpiryDate: string }> {
    try {
      console.log(`🔥 RAW SQL addSubscriptionDays: userId=${userId}, days=${days}`);
      
      // RAW SQL: Get user's active subscription
      const result = await db.execute(sql`
        SELECT id, user_id, expires_at, amount, status
        FROM subscriptions 
        WHERE user_id = ${userId} AND status = 'active' 
        ORDER BY expires_at DESC 
        LIMIT 1
      `);

      // Fix: Handle different result structures
      console.log(`🔍 RAW SQL result structure:`, {
        hasRows: !!result.rows,
        isArray: Array.isArray(result),
        resultType: typeof result,
        keys: Object.keys(result)
      });

      let rows: any[] = [];
      if (result.rows && Array.isArray(result.rows)) {
        rows = result.rows;
      } else if (Array.isArray(result)) {
        rows = result;
      } else {
        console.log(`❌ Unexpected result structure:`, result);
        rows = [];
      }

      console.log(`🔍 Found ${rows.length} active subscriptions for user ${userId}`);

      if (rows.length > 0) {
        // User has active subscription - extend it
        const subscription: any = rows[0];
        console.log(`🔍 Current subscription:`, {
          id: subscription.id,
          expires_at: subscription.expires_at,
          amount: subscription.amount
        });
        
        const currentExpiryDate = new Date(subscription.expires_at || new Date());
        const newExpiryDate = new Date(currentExpiryDate);
        newExpiryDate.setDate(newExpiryDate.getDate() + days);
        
        console.log(`🔍 Updating expiry: ${currentExpiryDate.toISOString()} -> ${newExpiryDate.toISOString()}`);
        
        // RAW SQL: Update subscription expiry date
        await db.execute(sql`
          UPDATE subscriptions 
          SET expires_at = ${newExpiryDate.toISOString()}::timestamp 
          WHERE id = ${subscription.id}
        `);

        console.log(`✅ Successfully added ${days} days to subscription ${subscription.id}`);
        return { 
          success: true, 
          message: `Added ${days} days to existing subscription`,
          newExpiryDate: newExpiryDate.toISOString()
        };
      } else {
        // User has no active subscription - cannot add days without a base subscription
        console.log(`❌ User ${userId} has no active subscription to extend`);
        return { 
          success: false, 
          message: `User has no active subscription. Please create a subscription first before adding days.`,
          newExpiryDate: ""
        };
      }
    } catch (error) {
      console.error('❌ RAW SQL addSubscriptionDays error:', error);
      return { 
        success: false, 
        message: "Failed to add subscription days",
        newExpiryDate: ""
      };
    }
  }

  async resetReferralCycle(userId: string): Promise<{ success: boolean; message: string; newCycle: number }> {
    try {
      // Get user's current rewards to find the latest cycle
      const rewards = await db.select()
        .from(referralRewards)
        .where(eq(referralRewards.referrerId, userId))
        .orderBy(desc(referralRewards.rewardCycle));

      const latestCycle = rewards.length > 0 ? (rewards[0].rewardCycle || 1) : 1;
      const newCycle = latestCycle + 1;

      // Create a new referral reward tracker for the next cycle
      await db.insert(referralRewards).values({
        referrerId: userId,
        referredId: null,
        rewardType: "free_month",
        rewardValue: 30,
        currentReferrals: 0,
        requiredReferrals: 3,
        rewardCycle: newCycle,
        status: "pending"
      });

      return {
        success: true,
        message: `Started new referral cycle ${newCycle}. Refer 3 more people to get another 30 days!`,
        newCycle: newCycle
      };
    } catch (error) {
      console.error('Reset referral cycle error:', error);
      return {
        success: false,
        message: "Failed to reset referral cycle",
        newCycle: 0
      };
    }
  }

  async getGoogleAdsConfig(): Promise<GoogleAdsConfig | null> {
    try {
      const config = await db.select()
        .from(googleAdsConfig)
        .limit(1);
      
      return config.length > 0 ? config[0] : null;
    } catch (error) {
      console.error('Get Google Ads config error:', error);
      return null;
    }
  }

  async updateGoogleAdsConfig(config: Partial<InsertGoogleAdsConfig>): Promise<{ success: boolean; message: string }> {
    try {
      // Check if config exists
      const existingConfig = await this.getGoogleAdsConfig();
      
      if (existingConfig) {
        // Update existing config
        await db.update(googleAdsConfig)
          .set({
            ...config,
            updatedAt: new Date()
          })
          .where(eq(googleAdsConfig.id, existingConfig.id));
      } else {
        // Create new config
        await db.insert(googleAdsConfig).values({
          conversionId: config.conversionId || 'AW-CONVERSION_ID',
          purchaseLabel: config.purchaseLabel || 'PURCHASE_CONVERSION_LABEL',
          signupLabel: config.signupLabel || 'SIGNUP_CONVERSION_LABEL',
          enabled: config.enabled || false,
        });
      }

      return {
        success: true,
        message: "Google Ads configuration updated successfully"
      };
    } catch (error) {
      console.error('Update Google Ads config error:', error);
      return {
        success: false,
        message: "Failed to update Google Ads configuration"
      };
    }
  }

  async getAppConfig(): Promise<any> {
    try {
      const result = await db.select().from(appConfig).limit(1);
      
      if (result.length === 0) {
        // Return default config if none exists
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? 'https://cipka.onrender.com' 
          : 'http://localhost:5000';
          
        return {
          id: 1,
          appName: 'AutoMentor',
          appUrl: baseUrl,
          stripePublishableKey: '',
          stripeSecretKey: '',
          stripeWebhookSecret: '',
          paypalClientId: '',
          paypalClientSecret: '',
          paypalWebhookId: '',
          paypalMode: 'sandbox',
          smtpHost: '',
          smtpPort: 587,
          smtpSecure: true,
          smtpUser: '',
          smtpPass: '',
          emailFrom: '',
          emailFromName: 'AutoMentor',
          supportEmail: '',
          faviconPath: ''
        };
      }
      
      return result[0];
    } catch (error) {
      console.error('Error getting app config:', error);
      throw error;
    }
  }

  async updateAppConfig(config: any): Promise<any> {
    try {
      const existingConfig = await db.select().from(appConfig).limit(1);
      
      if (existingConfig.length > 0) {
        // Update existing config
        const result = await db.update(appConfig)
          .set({
            ...config,
            updatedAt: new Date()
          })
          .where(eq(appConfig.id, existingConfig[0].id))
          .returning();
        return result[0];
      } else {
        // Create new config
        const result = await db.insert(appConfig).values({
          ...config,
          id: 1,
          updatedAt: new Date()
        }).returning();
        return result[0];
      }
    } catch (error) {
      console.error('Error updating app config:', error);
      throw error;
    }
  }

  // Analytics methods
  async trackEvent(event: Omit<InsertAnalyticsEvent, 'id' | 'createdAt'>): Promise<void> {
    try {
      await db.insert(analyticsEvents).values({
        ...event,
        id: crypto.randomUUID(),
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  async getDashboardStats(startDate?: string, endDate?: string): Promise<any> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const start = startDate ? new Date(startDate) : thirtyDaysAgo;
      const end = endDate ? new Date(endDate) : now;

      // Get basic stats
      const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [activeUsers] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.isOnline, true));
      
      const [totalSubs] = await db.select({ count: sql<number>`count(*)` }).from(subscriptions);
      const [totalSessions] = await db.select({ count: sql<number>`count(*)` }).from(chatSessions);

      // Revenue calculation (from subscriptions with proper conversion)
      const revenueResult = await db.select({ 
        totalRevenue: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0)` 
      }).from(subscriptions);
      
      const totalRevenue = revenueResult[0]?.totalRevenue || 0;

      // New users this period
      const [newUsers] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(
          and(
            gte(users.createdAt, start),
            lte(users.createdAt, end)
          )
        );

      // New subscriptions this period  
      const [newSubs] = await db.select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(
          and(
            gte(subscriptions.purchasedAt, start),
            lte(subscriptions.purchasedAt, end)
          )
        );

      return {
        totalUsers: totalUsers.count,
        activeUsers: activeUsers.count,
        newUsers: newUsers.count,
        totalRevenue: Number(totalRevenue),
        totalSubscriptions: totalSubs.count,
        newSubscriptions: newSubs.count,
        totalSessions: totalSessions.count,
        conversionRate: totalUsers.count > 0 ? (totalSubs.count / totalUsers.count) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        totalRevenue: 0,
        totalSubscriptions: 0,
        newSubscriptions: 0,
        totalSessions: 0,
        conversionRate: 0
      };
    }
  }

  async getRevenueAnalytics(startDate?: string, endDate?: string): Promise<any> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const start = startDate ? new Date(startDate) : thirtyDaysAgo;
      const end = endDate ? new Date(endDate) : now;

      // Total revenue in period
      const revenueResult = await db.select({
        totalRevenue: sql`sum(amount)`,
        count: sql`count(*)`
      })
      .from(subscriptions)
      .where(
        and(
          gte(subscriptions.purchasedAt, start),
          lte(subscriptions.purchasedAt, end)
        )
      );

      // Revenue by day (last 30 days)
      const dailyRevenue = await db.select({
        date: sql`date(${subscriptions.purchasedAt})`,
        revenue: sql`sum(amount)`,
        count: sql`count(*)`
      })
      .from(subscriptions)
      .where(
        and(
          gte(subscriptions.purchasedAt, start),
          lte(subscriptions.purchasedAt, end)
        )
      )
      .groupBy(sql`date(${subscriptions.purchasedAt})`)
      .orderBy(sql`date(${subscriptions.purchasedAt})`);

      // Top customers by revenue
      const topCustomers = await db.select({
        userId: subscriptions.userId,
        totalSpent: sql`sum(amount)`,
        subscriptionCount: sql`count(*)`
      })
      .from(subscriptions)
      .groupBy(subscriptions.userId)
      .orderBy(desc(sql`sum(amount)`))
      .limit(10);

      return {
        totalRevenue: Number(revenueResult[0]?.totalRevenue || 0),
        transactionCount: Number(revenueResult[0]?.count || 0),
        averageOrderValue: revenueResult[0]?.totalRevenue && revenueResult[0]?.count 
          ? Number(revenueResult[0].totalRevenue) / Number(revenueResult[0].count) 
          : 0,
  revenueByPeriod: dailyRevenue.map((d: any) => ({
          date: d.date,
          revenue: Number(d.revenue),
          count: Number(d.count)
        })),
  topCustomers: topCustomers.map((c: any) => ({
          userId: c.userId,
          totalSpent: Number(c.totalSpent),
          subscriptionCount: Number(c.subscriptionCount)
        }))
      };
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      return {
        totalRevenue: 0,
        transactionCount: 0,
        averageOrderValue: 0,
        revenueByPeriod: [],
        topCustomers: []
      };
    }
  }

  async getChartData(type: string, period: string): Promise<any> {
    try {
      const now = new Date();
      let startDate: Date;
      let groupBy: string;

      // Determine period
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          groupBy = 'date';
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          groupBy = 'date';
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          groupBy = 'month';
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          groupBy = 'date';
      }

      let query;
      let labels: string[] = [];
      let data: number[] = [];

      switch (type) {
        case 'users':
          const userData = await db.select({
            period: groupBy === 'month' 
              ? sql`strftime('%Y-%m', ${users.createdAt})`
              : sql`date(${users.createdAt})`,
            count: sql`count(*)`
          })
          .from(users)
          .where(gte(users.createdAt, startDate))
          .groupBy(groupBy === 'month' 
            ? sql`strftime('%Y-%m', ${users.createdAt})`
            : sql`date(${users.createdAt})`)
          .orderBy(groupBy === 'month' 
            ? sql`strftime('%Y-%m', ${users.createdAt})`
            : sql`date(${users.createdAt})`);
          
          labels = userData.map((d: any) => d.period as string);
          data = userData.map((d: any) => Number(d.count));
          break;

        case 'revenue':
          const revenueData = await db.select({
            period: groupBy === 'month' 
              ? sql`strftime('%Y-%m', ${subscriptions.purchasedAt})`
              : sql`date(${subscriptions.purchasedAt})`,
            amount: sql`sum(amount)`
          })
          .from(subscriptions)
          .where(gte(subscriptions.purchasedAt, startDate))
          .groupBy(groupBy === 'month' 
            ? sql`strftime('%Y-%m', ${subscriptions.purchasedAt})`
            : sql`date(${subscriptions.purchasedAt})`)
          .orderBy(groupBy === 'month' 
            ? sql`strftime('%Y-%m', ${subscriptions.purchasedAt})`
            : sql`date(${subscriptions.purchasedAt})`);
          
          labels = revenueData.map((d: any) => d.period as string);
          data = revenueData.map((d: any) => Number(d.amount));
          break;

        case 'chats':
          const chatData = await db.select({
            period: groupBy === 'month' 
              ? sql`strftime('%Y-%m', ${chatSessions.createdAt})`
              : sql`date(${chatSessions.createdAt})`,
            count: sql`count(*)`
          })
          .from(chatSessions)
          .where(gte(chatSessions.createdAt, startDate))
          .groupBy(groupBy === 'month' 
            ? sql`strftime('%Y-%m', ${chatSessions.createdAt})`
            : sql`date(${chatSessions.createdAt})`)
          .orderBy(groupBy === 'month' 
            ? sql`strftime('%Y-%m', ${chatSessions.createdAt})`
            : sql`date(${chatSessions.createdAt})`);
          
          labels = chatData.map((d: any) => d.period as string);
          data = chatData.map((d: any) => Number(d.count));
          break;
      }

      return { labels, data };
    } catch (error) {
      console.error('Error getting chart data:', error);
      return { labels: [], data: [] };
    }
  }

  // CMS methods
  async getContentPage(pageKey: string): Promise<ContentPage | null> {
    try {
      const pages = await db.select()
        .from(contentPages)
        .where(eq(contentPages.pageKey, pageKey))
        .limit(1);
      
      return pages.length > 0 ? pages[0] : null;
    } catch (error) {
      console.error('Error getting content page:', error);
      return null;
    }
  }

  async updateContentPage(pageKey: string, content: Partial<InsertContentPage>): Promise<ContentPage> {
    try {
      const existingPage = await this.getContentPage(pageKey);
      
      if (existingPage) {
        const result = await db.update(contentPages)
          .set({
            ...content,
            updatedAt: new Date().toISOString()
          })
          .where(eq(contentPages.pageKey, pageKey))
          .returning();
        
        return result[0];
      } else {
        const result = await db.insert(contentPages)
          .values({
            ...content,
            pageKey,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          .returning();
        
        return result[0];
      }
    } catch (error) {
      console.error('Error updating content page:', error);
      throw error;
    }
  }

  async getAllContentPages(): Promise<ContentPage[]> {
    try {
      return await db.select().from(contentPages);
    } catch (error) {
      console.error('Error getting content pages:', error);
      return [];
    }
  }

  async getFaqs(): Promise<Faq[]> {
    try {
      return await db.select()
        .from(faqs)
        .where(eq(faqs.isPublished, true))
        .orderBy(faqs.sortOrder, faqs.createdAt);
    } catch (error) {
      console.error('Error getting FAQs:', error);
      return [];
    }
  }

  async createFaq(faq: Omit<InsertFaq, 'id' | 'createdAt' | 'updatedAt'>): Promise<Faq> {
    try {
      const result = await db.insert(faqs)
        .values({
          ...faq,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error creating FAQ:', error);
      throw error;
    }
  }

  async updateFaq(id: string, faq: Partial<InsertFaq>): Promise<Faq> {
    try {
      const result = await db.update(faqs)
        .set({
          ...faq,
          updatedAt: new Date().toISOString()
        })
        .where(eq(faqs.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error updating FAQ:', error);
      throw error;
    }
  }

  async deleteFaq(id: string): Promise<void> {
    try {
      await db.delete(faqs).where(eq(faqs.id, id));
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      throw error;
    }
  }

  async getTestimonials(approved?: boolean): Promise<Testimonial[]> {
    try {
      let query = db.select().from(testimonials);
      
      if (approved !== undefined) {
        query = query.where(eq(testimonials.isApproved, approved));
      }
      
      return await query.orderBy(desc(testimonials.createdAt));
    } catch (error) {
      console.error('Error getting testimonials:', error);
      return [];
    }
  }

  async createTestimonial(testimonial: Omit<InsertTestimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<Testimonial> {
    try {
      const result = await db.insert(testimonials)
        .values({
          ...testimonial,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }

  async updateTestimonial(id: string, testimonial: Partial<InsertTestimonial>): Promise<Testimonial> {
    try {
      const result = await db.update(testimonials)
        .set({
          ...testimonial,
          updatedAt: new Date().toISOString()
        })
        .where(eq(testimonials.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  }

  async deleteTestimonial(id: string): Promise<void> {
    try {
      await db.delete(testimonials).where(eq(testimonials.id, id));
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  }
}

// Use PostgresStorage for all environments
export const storage = new PostgresStorage();
