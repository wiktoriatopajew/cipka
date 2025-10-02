const Database = require('better-sqlite3');
const fs = require('fs');

console.log('Starting analytics migration...');

try {
  const db = new Database('./database.sqlite');
  console.log('Database opened successfully');
  
  // Check if analytics tables already exist
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  const existingTables = tables.map(t => t.name);
  
  // Analytics Events table
  if (!existingTables.includes('analytics_events')) {
    console.log('Creating analytics_events table...');
    db.prepare(`
      CREATE TABLE analytics_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        event_name TEXT NOT NULL,
        user_id TEXT,
        session_id TEXT,
        properties TEXT, -- JSON string
        page_url TEXT,
        referrer TEXT,
        user_agent TEXT,
        ip_address TEXT,
        country TEXT,
        city TEXT,
        device_type TEXT, -- mobile, desktop, tablet
        browser TEXT,
        os TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    // Create indexes for better performance
    db.prepare(`CREATE INDEX idx_analytics_events_type ON analytics_events(event_type)`).run();
    db.prepare(`CREATE INDEX idx_analytics_events_name ON analytics_events(event_name)`).run();
    db.prepare(`CREATE INDEX idx_analytics_events_user ON analytics_events(user_id)`).run();
    db.prepare(`CREATE INDEX idx_analytics_events_date ON analytics_events(created_at)`).run();
    
    console.log('analytics_events table created');
  }
  
  // Daily Stats table for aggregated data
  if (!existingTables.includes('daily_stats')) {
    console.log('Creating daily_stats table...');
    db.prepare(`
      CREATE TABLE daily_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE, -- YYYY-MM-DD format
        total_users INTEGER DEFAULT 0,
        new_users INTEGER DEFAULT 0,
        active_users INTEGER DEFAULT 0,
        total_sessions INTEGER DEFAULT 0,
        total_chats INTEGER DEFAULT 0,
        new_subscriptions INTEGER DEFAULT 0,
        total_revenue REAL DEFAULT 0,
        page_views INTEGER DEFAULT 0,
        bounce_rate REAL DEFAULT 0,
        avg_session_duration INTEGER DEFAULT 0, -- in seconds
        conversion_rate REAL DEFAULT 0, -- percentage
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    db.prepare(`CREATE INDEX idx_daily_stats_date ON daily_stats(date)`).run();
    console.log('daily_stats table created');
  }
  
  // Revenue Analytics table
  if (!existingTables.includes('revenue_analytics')) {
    console.log('Creating revenue_analytics table...');
    db.prepare(`
      CREATE TABLE revenue_analytics (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        subscription_id TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'PLN',
        payment_method TEXT, -- stripe, paypal
        subscription_type TEXT, -- basic, premium, etc.
        is_refund INTEGER DEFAULT 0,
        refund_amount REAL DEFAULT 0,
        marketing_source TEXT, -- google_ads, facebook, direct, etc.
        conversion_funnel_step INTEGER, -- 1-5 steps
        customer_lifetime_value REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    db.prepare(`CREATE INDEX idx_revenue_user ON revenue_analytics(user_id)`).run();
    db.prepare(`CREATE INDEX idx_revenue_date ON revenue_analytics(created_at)`).run();
    db.prepare(`CREATE INDEX idx_revenue_source ON revenue_analytics(marketing_source)`).run();
    
    console.log('revenue_analytics table created');
  }
  
  db.close();
  console.log('Analytics migration completed successfully!');
  
} catch (error) {
  console.error('Analytics migration failed:', error);
  process.exit(1);
}