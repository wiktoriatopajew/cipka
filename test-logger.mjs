#!/usr/bin/env node

// Test logger functionality
import Logger from './server/logger.js';

console.log('🧪 Testing Logger System');
console.log('========================\n');

console.log('📋 Current configuration:');
console.log(JSON.stringify(Logger.getConfig(), null, 2));
console.log('');

console.log('🔍 Testing different log types:');
Logger.session('Session test - should be visible based on config');
Logger.api('API test - should be visible based on config');  
Logger.sql('SQL test - should be visible based on config');
Logger.admin('Admin test - should be visible based on config');
Logger.liveData('Live data test - should be visible based on config');
Logger.payment('Payment test - should be visible based on config');

Logger.info('Info level test');
Logger.warn('Warning level test');
Logger.error('Error level test');
Logger.debug('Debug level test');

console.log('\n✅ Logger test completed!');
console.log('💡 Check which logs appeared above based on your configuration.');