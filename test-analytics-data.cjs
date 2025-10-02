const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'));

// Dodaj przykładowe dane analityczne
console.log('Adding sample analytics data...');

// Analytics events - używając rzeczywistego schematu
const events = [
  { 
    id: 'evt_1', 
    event_type: 'registration', 
    event_name: 'user_registered',
    user_id: 'test', 
    properties: '{"method":"email"}', 
    page_url: '/register',
    device_type: 'desktop',
    browser: 'Chrome',
    os: 'Windows',
    created_at: '2024-12-20 10:00:00' 
  },
  { 
    id: 'evt_2', 
    event_type: 'engagement', 
    event_name: 'chat_started',
    user_id: 'poek29', 
    properties: '{"mechanic_id":"mech-0"}', 
    page_url: '/chat',
    device_type: 'mobile',
    browser: 'Safari',
    os: 'iOS',
    created_at: '2024-12-20 11:00:00' 
  },
  { 
    id: 'evt_3', 
    event_type: 'conversion', 
    event_name: 'payment_completed',
    user_id: 'papito1', 
    properties: '{"amount":29.99}', 
    page_url: '/payment',
    device_type: 'desktop',
    browser: 'Firefox',
    os: 'Windows',
    created_at: '2024-12-20 12:00:00' 
  }
];

for (const event of events) {
  try {
    db.prepare(`
      INSERT OR REPLACE INTO analytics_events (id, event_type, event_name, user_id, properties, page_url, device_type, browser, os, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(event.id, event.event_type, event.event_name, event.user_id, event.properties, event.page_url, event.device_type, event.browser, event.os, event.created_at);
    console.log(`Added event: ${event.event_name}`);
  } catch (error) {
    console.log('Event insert error:', error.message);
  }
}

// Daily stats - używając rzeczywistego schematu
const dailyStats = [
  { 
    date: '2024-12-20', 
    total_users: 28,
    new_users: 3, 
    active_users: 15, 
    total_sessions: 45,
    total_chats: 8, 
    new_subscriptions: 3,
    total_revenue: 342.86, // ~$90.23 (89.97 * 3.8)
    page_views: 150,
    bounce_rate: 0.35,
    avg_session_duration: 180,
    conversion_rate: 0.12,
    created_at: '2024-12-20 00:00:00',
    updated_at: '2024-12-20 23:59:59'
  },
  { 
    date: '2024-12-21', 
    total_users: 30,
    new_users: 2, 
    active_users: 18, 
    total_sessions: 52,
    total_chats: 12, 
    new_subscriptions: 2,
    total_revenue: 227.92, // ~$59.98 (59.98 * 3.8)
    page_views: 180,
    bounce_rate: 0.28,
    avg_session_duration: 220,
    conversion_rate: 0.15,
    created_at: '2024-12-21 00:00:00',
    updated_at: '2024-12-21 23:59:59'
  },
  { 
    date: '2024-12-22', 
    total_users: 34,
    new_users: 4, 
    active_users: 22, 
    total_sessions: 68,
    total_chats: 15, 
    new_subscriptions: 4,
    total_revenue: 455.85, // ~$119.96 (119.96 * 3.8)
    page_views: 220,
    bounce_rate: 0.22,
    avg_session_duration: 240,
    conversion_rate: 0.18,
    created_at: '2024-12-22 00:00:00',
    updated_at: '2024-12-22 23:59:59'
  }
];

for (const stat of dailyStats) {
  try {
    db.prepare(`
      INSERT OR REPLACE INTO daily_stats (date, total_users, new_users, active_users, total_sessions, total_chats, new_subscriptions, total_revenue, page_views, bounce_rate, avg_session_duration, conversion_rate, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(stat.date, stat.total_users, stat.new_users, stat.active_users, stat.total_sessions, stat.total_chats, stat.new_subscriptions, stat.total_revenue, stat.page_views, stat.bounce_rate, stat.avg_session_duration, stat.conversion_rate, stat.created_at, stat.updated_at);
    console.log(`Added daily stats for: ${stat.date}`);
  } catch (error) {
    console.log('Daily stats insert error:', error.message);
  }
}

// Revenue analytics - używając rzeczywistego schematu
const revenueData = [
  { 
    id: 'rev_1',
    user_id: 'poek29',
    subscription_id: 'sub_1',
    amount: 113.96, // $29.99 * 3.8 exchange rate
    currency: 'USD',
    payment_method: 'card',
    subscription_type: 'monthly',
    is_refund: 0,
    refund_amount: 0,
    marketing_source: 'google',
    conversion_funnel_step: 5,
    customer_lifetime_value: 456.00, // $120.00 * 3.8
    created_at: '2024-12-20 12:00:00'
  },
  { 
    id: 'rev_2',
    user_id: 'papito1',
    subscription_id: 'sub_2',
    amount: 113.96, // $29.99 * 3.8 exchange rate
    currency: 'USD',
    payment_method: 'paypal',
    subscription_type: 'monthly',
    is_refund: 0,
    refund_amount: 0,
    marketing_source: 'facebook',
    conversion_funnel_step: 5,
    customer_lifetime_value: 342.00, // $90.00 * 3.8
    created_at: '2024-12-21 14:30:00'
  }
];

for (const revenue of revenueData) {
  try {
    db.prepare(`
      INSERT OR REPLACE INTO revenue_analytics (id, user_id, subscription_id, amount, currency, payment_method, subscription_type, is_refund, refund_amount, marketing_source, conversion_funnel_step, customer_lifetime_value, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(revenue.id, revenue.user_id, revenue.subscription_id, revenue.amount, revenue.currency, revenue.payment_method, revenue.subscription_type, revenue.is_refund, revenue.refund_amount, revenue.marketing_source, revenue.conversion_funnel_step, revenue.customer_lifetime_value, revenue.created_at);
    console.log(`Added revenue record: ${revenue.id}`);
  } catch (error) {
    console.log('Revenue analytics insert error:', error.message);
  }
}

// Sample CMS content - używając rzeczywistego schematu
console.log('Adding sample CMS content...');

const contentPages = [
  { 
    id: 'page_1',
    page_key: 'about',
    title: 'About Us', 
    meta_description: 'Meet AutoMentor - the professional platform connecting drivers with mechanics',
    content: 'We are a professional platform connecting drivers with mechanics in real-time. Our mission is to provide fast and professional help to every driver.',
    is_published: 1,
    seo_title: 'AutoMentor - About Us',
    version: 1,
    created_at: '2024-12-20 10:00:00', 
    updated_at: '2024-12-20 10:00:00' 
  },
  { 
    id: 'page_2',
    page_key: 'terms',
    title: 'Terms of Service', 
    meta_description: 'AutoMentor platform terms of service',
    content: 'Terms of service for using the AutoMentor platform. Please read carefully before using our services.',
    is_published: 1,
    seo_title: 'Terms of Service - AutoMentor',
    version: 1,
    created_at: '2024-12-20 11:00:00', 
    updated_at: '2024-12-20 11:00:00' 
  },
  { 
    id: 'page_3',
    page_key: 'pricing',
    title: 'Pricing', 
    meta_description: 'Current prices for AutoMentor services',
    content: 'Current prices for our services. Monthly subscription: $7.89 USD.',
    is_published: 0,
    seo_title: 'Pricing - AutoMentor',
    version: 1,
    created_at: '2024-12-22 14:00:00', 
    updated_at: '2024-12-22 14:00:00' 
  }
];

for (const page of contentPages) {
  try {
    db.prepare(`
      INSERT OR REPLACE INTO content_pages (id, page_key, title, meta_description, content, is_published, seo_title, version, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(page.id, page.page_key, page.title, page.meta_description, page.content, page.is_published, page.seo_title, page.version, page.created_at, page.updated_at);
    console.log(`Added content page: ${page.title}`);
  } catch (error) {
    console.log('Content pages insert error:', error.message);
  }
}

const faqs = [
  { 
    id: 'faq_1',
    question: 'How does the platform work?', 
    answer: 'The platform connects drivers with mechanics in real-time. Just describe your problem and our system will automatically connect you with the nearest available mechanic.',
    category: 'general',
    sort_order: 1,
    is_published: 1,
    views_count: 150,
    helpful_votes: 42,
    not_helpful_votes: 3,
    created_at: '2024-12-20 10:00:00',
    updated_at: '2024-12-20 10:00:00'
  },
  { 
    id: 'faq_2',
    question: 'How much does a consultation cost?', 
    answer: 'Basic subscription is $7.89 USD monthly and includes unlimited consultations with mechanics.',
    category: 'payments',
    sort_order: 2,
    is_published: 1,
    views_count: 98,
    helpful_votes: 34,
    not_helpful_votes: 2,
    created_at: '2024-12-20 11:00:00',
    updated_at: '2024-12-20 11:00:00'
  },
  { 
    id: 'faq_3',
    question: 'Are mechanics verified?', 
    answer: 'Yes, all mechanics go through a qualification and experience verification process before joining the platform.',
    category: 'security',
    sort_order: 3,
    is_published: 0,
    views_count: 0,
    helpful_votes: 0,
    not_helpful_votes: 0,
    created_at: '2024-12-22 14:00:00',
    updated_at: '2024-12-22 14:00:00'
  }
];

for (const faq of faqs) {
  try {
    db.prepare(`
      INSERT OR REPLACE INTO faqs (id, question, answer, category, sort_order, is_published, views_count, helpful_votes, not_helpful_votes, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(faq.id, faq.question, faq.answer, faq.category, faq.sort_order, faq.is_published, faq.views_count, faq.helpful_votes, faq.not_helpful_votes, faq.created_at, faq.updated_at);
    console.log(`Added FAQ: ${faq.question}`);
  } catch (error) {
    console.log('FAQs insert error:', error.message);
  }
}

console.log('Sample data added successfully!');

db.close();