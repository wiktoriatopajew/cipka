#!/usr/bin/env node

// Quick logger configuration script
const fs = require('fs');
const path = require('path');

const configs = {
  'silent': {
    description: '🔇 Complete silence - no logs at all',
    env: {
      'LOG_LEVEL': 'silent'
    }
  },
  'production': {
    description: '🏭 Production minimal - only errors and critical logs',
    env: {
      'LOG_LEVEL': 'error',
      'ENABLE_SESSION_LOGS': 'false',
      'ENABLE_API_LOGS': 'false', 
      'ENABLE_SQL_LOGS': 'false',
      'ENABLE_ADMIN_LOGS': 'true',
      'ENABLE_LIVE_DATA_LOGS': 'false',
      'ENABLE_PAYMENT_LOGS': 'true'
    }
  },
  'clean-dev': {
    description: '🧹 Clean development - reduced noise',
    env: {
      'LOG_LEVEL': 'info',
      'ENABLE_SESSION_LOGS': 'false',
      'ENABLE_API_LOGS': 'true',
      'ENABLE_SQL_LOGS': 'false', 
      'ENABLE_ADMIN_LOGS': 'true',
      'ENABLE_LIVE_DATA_LOGS': 'false',
      'ENABLE_PAYMENT_LOGS': 'true'
    }
  },
  'debug-session': {
    description: '🔐 Debug session issues',
    env: {
      'LOG_LEVEL': 'debug',
      'ENABLE_SESSION_LOGS': 'true',
      'ENABLE_API_LOGS': 'true',
      'ENABLE_SQL_LOGS': 'false',
      'ENABLE_ADMIN_LOGS': 'true',
      'ENABLE_LIVE_DATA_LOGS': 'false',
      'ENABLE_PAYMENT_LOGS': 'true'
    }
  },
  'debug-database': {
    description: '🔥 Debug database issues',
    env: {
      'LOG_LEVEL': 'debug',
      'ENABLE_SESSION_LOGS': 'false',
      'ENABLE_API_LOGS': 'true',
      'ENABLE_SQL_LOGS': 'true',
      'ENABLE_ADMIN_LOGS': 'true', 
      'ENABLE_LIVE_DATA_LOGS': 'false',
      'ENABLE_PAYMENT_LOGS': 'true'
    }
  },
  'debug-all': {
    description: '🔍 Full debug - all logs enabled',
    env: {
      'LOG_LEVEL': 'debug',
      'ENABLE_SESSION_LOGS': 'true',
      'ENABLE_API_LOGS': 'true',
      'ENABLE_SQL_LOGS': 'true',
      'ENABLE_ADMIN_LOGS': 'true',
      'ENABLE_LIVE_DATA_LOGS': 'true',
      'ENABLE_PAYMENT_LOGS': 'true'
    }
  }
};

function showUsage() {
  console.log('\n🔧 Logger Configuration Tool\n');
  console.log('Usage: node configure-logs.cjs [preset]\n');
  console.log('Available presets:');
  Object.entries(configs).forEach(([name, config]) => {
    console.log(`  ${name.padEnd(15)} - ${config.description}`);
  });
  console.log('\nExample: node configure-logs.cjs clean-dev');
  console.log('\n📝 This will update your .env file with logging configuration.');
}

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return env;
}

function saveEnv(env) {
  const envPath = path.join(__dirname, '.env');
  const lines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
  fs.writeFileSync(envPath, lines.join('\n'));
}

function applyConfig(presetName) {
  const preset = configs[presetName];
  if (!preset) {
    console.error(`❌ Unknown preset: ${presetName}`);
    showUsage();
    process.exit(1);
  }
  
  console.log(`\n🔧 Applying preset: ${presetName}`);
  console.log(`📝 ${preset.description}\n`);
  
  const env = loadEnv();
  
  // Remove old logging config
  Object.keys(env).forEach(key => {
    if (key.startsWith('ENABLE_') && key.includes('LOGS') || key === 'LOG_LEVEL') {
      delete env[key];
    }
  });
  
  // Apply new config
  Object.entries(preset.env).forEach(([key, value]) => {
    env[key] = value;
    console.log(`  ${key}=${value}`);
  });
  
  saveEnv(env);
  
  console.log(`\n✅ Configuration applied successfully!`);
  console.log(`📁 Updated: .env`);
  console.log(`🔄 Restart your server to apply changes.`);
}

const preset = process.argv[2];

if (!preset) {
  showUsage();
  process.exit(0);
}

applyConfig(preset);