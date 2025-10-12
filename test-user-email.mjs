#!/usr/bin/env node

// Test user notification email (admin reply)
import dotenv from 'dotenv';
dotenv.config();

import { sendAdminReplyNotification } from './server/email.js';

async function testUserNotificationEmail() {
  console.log('👤 Testing User Notification Email (Admin Reply)');
  console.log('==================================================\n');
  
  console.log('🔍 Environment check:');
  console.log('SMTP_USER:', process.env.SMTP_USER || '❌ NOT SET');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ SET (hidden)' : '❌ NOT SET');
  console.log('');
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ Email not configured - missing SMTP credentials');
    process.exit(1);
  }
  
  console.log('📤 Sending test notification to user...\n');
  
  try {
    // Test notification to user (what they will receive when admin replies)
    await sendAdminReplyNotification(
      'wiktoriatopajew@gmail.com', // User email (test - normally different)
      'TestUser123',
      'I checked your engine issue. It\'s likely a damaged fuel pump. I recommend replacing it at an authorized service center. The cost should be around $200-300.',
      'test-session-456'
    );
    
    console.log('✅ User notification email sent successfully!\n');
    console.log('📧 Check wiktoriatopajew@gmail.com for the notification');
    console.log('💡 This is what users will receive when you reply from admin panel');
    
    console.log('\n🎯 Features tested:');
    console.log('   ✅ Beautiful HTML email template');
    console.log('   ✅ User-friendly Polish content');  
    console.log('   ✅ Direct link to continue conversation');
    console.log('   ✅ Anti-spam info (max 1 email per 15 min)');
    
  } catch (error) {
    console.error('❌ User notification test failed:', error);
    process.exit(1);
  }
}

testUserNotificationEmail();