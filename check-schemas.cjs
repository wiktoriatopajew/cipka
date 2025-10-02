const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'));

console.log('Checking analytics_events schema:');
const eventsSchema = db.prepare("PRAGMA table_info(analytics_events)").all();
console.log(eventsSchema.map(col => `${col.name}: ${col.type}`));

console.log('\nChecking daily_stats schema:');
const dailySchema = db.prepare("PRAGMA table_info(daily_stats)").all();
console.log(dailySchema.map(col => `${col.name}: ${col.type}`));

console.log('\nChecking revenue_analytics schema:');
const revenueSchema = db.prepare("PRAGMA table_info(revenue_analytics)").all();
console.log(revenueSchema.map(col => `${col.name}: ${col.type}`));

console.log('\nChecking content_pages schema:');
const contentSchema = db.prepare("PRAGMA table_info(content_pages)").all();
console.log(contentSchema.map(col => `${col.name}: ${col.type}`));

console.log('\nChecking faqs schema:');
const faqsSchema = db.prepare("PRAGMA table_info(faqs)").all();
console.log(faqsSchema.map(col => `${col.name}: ${col.type}`));

db.close();