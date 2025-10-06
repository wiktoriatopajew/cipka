import { 
  type User, type InsertUser,
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
import { db } from "./db";
import { eq, and, desc, lt, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
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
    return {
      id: 1,
      appName: 'AutoMentor',
      appUrl: 'http://localhost:5000',
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
    return {
      totalUsers: this.users.size,
      activeUsers: Array.from(this.users.values()).filter(u => u.isOnline).length,
      totalRevenue: 0,
      newSubscriptions: this.subscriptions.size,
      totalSessions: this.chatSessions.size
    };
  }

  async getRevenueAnalytics(startDate?: string, endDate?: string): Promise<any> {
    return {
      totalRevenue: 0,
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
  
  // Helper function to convert Date objects to ISO strings for SQLite
  private convertDates(obj: any): any {
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    if (typeof obj === 'object' && obj !== null) {
      const converted = { ...obj };
      for (const key in converted) {
        if (converted[key] instanceof Date) {
          converted[key] = converted[key].toISOString();
        }
      }
      return converted;
    }
    return obj;
  }

  async initAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (adminEmail && adminPassword) {
      const existingAdmin = await this.getUserByEmail(adminEmail);
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        await db.insert(users).values({
          username: "admin",
          password: hashedPassword,
          email: adminEmail,
          isAdmin: true,
          hasSubscription: true,
          isOnline: false,
        });
        console.log(`Admin user created with email: ${adminEmail}`);
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
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    const result = await db.insert(users).values({
      ...user,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const convertedUpdates = this.convertDates(updates);
    const result = await db.update(users)
      .set(convertedUpdates)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Subscription methods
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const result = await db.insert(subscriptions).values(subscription).returning();
    
    // Update user hasSubscription flag
    if (subscription.userId) {
      await db.update(users)
        .set({ hasSubscription: true })
        .where(eq(users.id, subscription.userId));
    }
    
    return result[0];
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.purchasedAt));
  }

  async getAllActiveSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions)
      .where(eq(subscriptions.status, "active"));
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const userSubscriptions = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.purchasedAt));
    
    const now = new Date();
    return userSubscriptions.some(sub => 
      sub.expiresAt && new Date(sub.expiresAt) > now
    );
  }

  // Chat session methods
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const result = await db.insert(chatSessions).values(session).returning();
    return result[0];
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const result = await db.select().from(chatSessions)
      .where(eq(chatSessions.id, id)).limit(1);
    return result[0];
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    return await db.select().from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.lastActivity));
  }

  async getAllActiveChatSessions(): Promise<ChatSession[]> {
    return await db.select().from(chatSessions)
      .where(eq(chatSessions.status, "active"));
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const result = await db.update(chatSessions)
      .set(updates)
      .where(eq(chatSessions.id, id))
      .returning();
    return result[0];
  }

  // Message methods
  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    
    // Update chat session lastActivity
    if (message.sessionId) {
      await db.update(chatSessions)
        .set({ lastActivity: new Date() })
        .where(eq(chatSessions.id, message.sessionId));
    }
    
    return result[0];
  }

  async getSessionMessages(sessionId: string): Promise<(Message & { attachments: Attachment[] })[]> {
    const messagesData = await db.select().from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.createdAt);
    
    // Get attachments for each message
    const messagesWithAttachments = await Promise.all(
      messagesData.map(async (message) => {
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
    return await db.select().from(messages)
      .where(
        and(
          eq(messages.isRead, false),
          eq(messages.senderType, "user")
        )
      );
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
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const result = await db.insert(attachments).values({
      ...attachment,
      expiresAt: expiresAt,
    }).returning();
    return result[0];
  }

  async getMessageAttachments(messageId: string): Promise<Attachment[]> {
    return await db.select().from(attachments)
      .where(eq(attachments.messageId, messageId));
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
      // Get user's active subscription
      const activeSubscription = await db.select()
        .from(subscriptions)
        .where(and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active")
        ))
        .orderBy(desc(subscriptions.expiresAt))
        .limit(1);

      if (activeSubscription.length > 0) {
        // User has active subscription - extend it
        const currentExpiryDate = new Date(activeSubscription[0].expiresAt || new Date());
        const newExpiryDate = new Date(currentExpiryDate);
        newExpiryDate.setDate(newExpiryDate.getDate() + days);
        
        await db.update(subscriptions)
          .set({ expiresAt: newExpiryDate })
          .where(eq(subscriptions.id, activeSubscription[0].id));

        return { 
          success: true, 
          message: `Added ${days} days to existing subscription`,
          newExpiryDate: newExpiryDate.toISOString()
        };
      } else {
        // User has no active subscription - create new one
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
        
        await db.insert(subscriptions).values({
          userId: userId,
          amount: 0, // Admin-granted subscription
          status: "active",
          expiresAt: expiresAt.toISOString()
        });

        // Update user subscription status
        await db.update(users)
          .set({ hasSubscription: true })
          .where(eq(users.id, userId));

        return { 
          success: true, 
          message: `Created new ${days}-day subscription`,
          newExpiryDate: expiresAt.toISOString()
        };
      }
    } catch (error) {
      console.error('Add subscription days error:', error);
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
        return {
          id: 1,
          appName: 'AutoMentor',
          appUrl: 'http://localhost:5000',
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

      // Revenue calculation (from subscriptions)
      const revenueResult = await db.select({ 
        totalRevenue: sql<number>`COALESCE(sum(amount), 0)` 
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
          gte(subscriptions.purchasedAt, start.toISOString()),
          lte(subscriptions.purchasedAt, end.toISOString())
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
          gte(subscriptions.purchasedAt, start.toISOString()),
          lte(subscriptions.purchasedAt, end.toISOString())
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
        revenueByPeriod: dailyRevenue.map(d => ({
          date: d.date,
          revenue: Number(d.revenue),
          count: Number(d.count)
        })),
        topCustomers: topCustomers.map(c => ({
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
          .where(gte(users.createdAt, startDate.toISOString()))
          .groupBy(groupBy === 'month' 
            ? sql`strftime('%Y-%m', ${users.createdAt})`
            : sql`date(${users.createdAt})`)
          .orderBy(groupBy === 'month' 
            ? sql`strftime('%Y-%m', ${users.createdAt})`
            : sql`date(${users.createdAt})`);
          
          labels = userData.map(d => d.period as string);
          data = userData.map(d => Number(d.count));
          break;

        case 'revenue':
          const revenueData = await db.select({
            period: groupBy === 'month' 
              ? sql`strftime('%Y-%m', ${subscriptions.purchasedAt})`
              : sql`date(${subscriptions.purchasedAt})`,
            amount: sql`sum(amount)`
          })
          .from(subscriptions)
          .where(gte(subscriptions.purchasedAt, startDate.toISOString()))
          .groupBy(groupBy === 'month' 
            ? sql`strftime('%Y-%m', ${subscriptions.purchasedAt})`
            : sql`date(${subscriptions.purchasedAt})`)
          .orderBy(groupBy === 'month' 
            ? sql`strftime('%Y-%m', ${subscriptions.purchasedAt})`
            : sql`date(${subscriptions.purchasedAt})`);
          
          labels = revenueData.map(d => d.period as string);
          data = revenueData.map(d => Number(d.amount));
          break;

        case 'chats':
          const chatData = await db.select({
            period: groupBy === 'month' 
              ? sql`strftime('%Y-%m', ${chatSessions.createdAt})`
              : sql`date(${chatSessions.createdAt})`,
            count: sql`count(*)`
          })
          .from(chatSessions)
          .where(gte(chatSessions.createdAt, startDate.toISOString()))
          .groupBy(groupBy === 'month' 
            ? sql`strftime('%Y-%m', ${chatSessions.createdAt})`
            : sql`date(${chatSessions.createdAt})`)
          .orderBy(groupBy === 'month' 
            ? sql`strftime('%Y-%m', ${chatSessions.createdAt})`
            : sql`date(${chatSessions.createdAt})`);
          
          labels = chatData.map(d => d.period as string);
          data = chatData.map(d => Number(d.count));
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

// Use PostgresStorage (now with SQLite) for all environments
export const storage = new PostgresStorage();
