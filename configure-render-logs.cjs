#!/usr/bin/env node

// Update Render environment variables for logging configuration
const https = require('https');

const RENDER_CONFIGS = {
  'production-minimal': {
    description: '🏭 Production Minimal - Reduced logs for better performance',
    vars: {
      'LOG_LEVEL': 'warn',
      'ENABLE_SESSION_LOGS': 'false',
      'ENABLE_API_LOGS': 'false',
      'ENABLE_SQL_LOGS': 'false',
      'ENABLE_ADMIN_LOGS': 'true',
      'ENABLE_LIVE_DATA_LOGS': 'false',
      'ENABLE_PAYMENT_LOGS': 'true'
    }
  },
  'production-silent': {
    description: '🔇 Production Silent - Only errors and critical logs',
    vars: {
      'LOG_LEVEL': 'error',
      'ENABLE_SESSION_LOGS': 'false',
      'ENABLE_API_LOGS': 'false',
      'ENABLE_SQL_LOGS': 'false',
      'ENABLE_ADMIN_LOGS': 'true',
      'ENABLE_LIVE_DATA_LOGS': 'false',
      'ENABLE_PAYMENT_LOGS': 'true'
    }
  },
  'debug-production': {
    description: '🔍 Debug Production - Temporary debug mode',
    vars: {
      'LOG_LEVEL': 'info',
      'ENABLE_SESSION_LOGS': 'false',
      'ENABLE_API_LOGS': 'true',
      'ENABLE_SQL_LOGS': 'false',
      'ENABLE_ADMIN_LOGS': 'true',
      'ENABLE_LIVE_DATA_LOGS': 'false',
      'ENABLE_PAYMENT_LOGS': 'true'
    }
  }
};

function showUsage() {
  console.log('\n🚀 Render Logger Configuration Tool\n');
  console.log('This tool helps configure logging for your Render deployment.\n');
  
  console.log('Available presets:');
  Object.entries(RENDER_CONFIGS).forEach(([name, config]) => {
    console.log(`  ${name.padEnd(20)} - ${config.description}`);
  });
  
  console.log('\n📋 Current render.yaml logging configuration:');
  Object.entries(RENDER_CONFIGS['production-minimal'].vars).forEach(([key, value]) => {
    console.log(`      - key: ${key}`);
    console.log(`        value: ${value}`);
  });
  
  console.log('\n🔧 To apply different preset, update render.yaml manually or use:');
  console.log('   1. Update render.yaml with desired values');
  console.log('   2. Deploy to Render: git push origin master');
  console.log('   3. Render will automatically apply new environment variables');
  
  console.log('\n📝 Manual Render Dashboard setup:');
  console.log('   1. Go to https://dashboard.render.com');
  console.log('   2. Select your service');
  console.log('   3. Go to Environment tab');
  console.log('   4. Add/update these variables:');
  Object.entries(RENDER_CONFIGS['production-minimal'].vars).forEach(([key, value]) => {
    console.log(`      ${key} = ${value}`);
  });
}

function generateRenderYamlConfig(presetName) {
  const preset = RENDER_CONFIGS[presetName];
  if (!preset) {
    console.error(`❌ Unknown preset: ${presetName}`);
    return;
  }
  
  console.log(`\n📝 render.yaml configuration for preset: ${presetName}`);
  console.log(`📋 ${preset.description}\n`);
  
  console.log('Add these lines to your render.yaml under envVars:');
  console.log('      # Logger Configuration');
  Object.entries(preset.vars).forEach(([key, value]) => {
    console.log(`      - key: ${key}`);
    console.log(`        value: ${value}`);
  });
  
  console.log('\n✅ After updating render.yaml:');
  console.log('   git add render.yaml');
  console.log('   git commit -m "🔧 Update logging configuration for Render"');
  console.log('   git push origin master');
  console.log('\n🚀 Render will automatically redeploy with new logging settings.');
}

const preset = process.argv[2];

if (!preset) {
  showUsage();
  process.exit(0);
}

if (RENDER_CONFIGS[preset]) {
  generateRenderYamlConfig(preset);
} else {
  console.error(`❌ Unknown preset: ${preset}`);
  showUsage();
  process.exit(1);
}