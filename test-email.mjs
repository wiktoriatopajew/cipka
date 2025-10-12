#!/usr/bin/env node

// Test email configuration
import dotenv from 'dotenv';
dotenv.config();

import { sendUserLoginNotification, sendFirstMessageNotification } from './server/email.js';

async function testEmailConfiguration() {
  console.log('📧 Testing Email Configuration');
  console.log('==============================\n');
  
  console.log('🔍 Environment variables:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ NOT SET');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ NOT SET');
  console.log('SMTP_USER:', process.env.SMTP_USER || '❌ NOT SET');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ SET (hidden)' : '❌ NOT SET');
  console.log('');
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ Email not configured - missing SMTP credentials');
    process.exit(1);
  }
  
  console.log('📤 Testing email notifications...\n');
  
  try {
    // Test 1: Login notification
    console.log('1️⃣ Testing login notification...');
    await sendUserLoginNotification('TestUser', 'test@example.com');
    console.log('✅ Login notification sent successfully\n');
    
    // Test 2: First message notification  
    console.log('2️⃣ Testing first message notification...');
    await sendFirstMessageNotification(
      'TestUser',
      'test@example.com', 
      'Hello, I need help with my car engine making strange noises.',
      'test-session-123'
    );
    console.log('✅ First message notification sent successfully\n');
    
    console.log('🎉 All email tests passed!');
    console.log('📧 Check wiktoriatopajew@gmail.com for test emails');
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
    process.exit(1);
  }
}

testEmailConfiguration();