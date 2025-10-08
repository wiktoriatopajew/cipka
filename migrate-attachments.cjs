const Database = require('better-sqlite3');
const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = 'https://ltkbqcphjrccuqrcjejj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0a2JxY3BoanJjY3VxcmNqZWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc1ODUzMDYsImV4cCI6MjA0MzE2MTMwNn0.HkJ5YMPZyP6FHHT_d3A7h7lQPz2HJTTkMGsYVKnCnCg';

async function migrateAttachments() {
  console.log('🔄 Starting attachments migration...\n');
  
  try {
    // Connect to SQLite
    const sqliteDb = new Database('./database.sqlite', { readonly: true });
    console.log('✅ Connected to SQLite');
    
    // Connect to Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Connected to Supabase');
    
    // Get all attachments from SQLite
    const attachments = sqliteDb.prepare('SELECT * FROM attachments ORDER BY uploaded_at').all();
    console.log(`📁 Found ${attachments.length} attachments in SQLite`);
    
    if (attachments.length === 0) {
      console.log('❌ No attachments to migrate');
      return;
    }
    
    // Check what's already in PostgreSQL
    const { data: existingAttachments } = await supabase
      .from('attachments')
      .select('id');
    
    const existingIds = new Set(existingAttachments?.map(a => a.id) || []);
    console.log(`📊 ${existingIds.size} attachments already in PostgreSQL`);
    
    // Filter out already migrated attachments
    const toMigrate = attachments.filter(att => !existingIds.has(att.id));
    console.log(`🚀 Need to migrate ${toMigrate.length} new attachments`);
    
    if (toMigrate.length === 0) {
      console.log('✅ All attachments already migrated!');
      return;
    }
    
    // Migrate in batches
    const batchSize = 50;
    let migrated = 0;
    
    for (let i = 0; i < toMigrate.length; i += batchSize) {
      const batch = toMigrate.slice(i, i + batchSize);
      
      console.log(`\n📦 Migrating batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(toMigrate.length/batchSize)} (${batch.length} records)...`);
      
      const { error } = await supabase
        .from('attachments')
        .insert(batch.map(att => ({
          id: att.id,
          message_id: att.message_id,
          file_name: att.file_name,
          original_name: att.original_name,
          file_size: att.file_size,
          mime_type: att.mime_type,
          file_path: att.file_path.replace(/\\\\/g, '/'), // Fix Windows paths
          uploaded_at: att.uploaded_at,
          expires_at: att.expires_at
        })));
      
      if (error) {
        console.error(`❌ Error in batch ${Math.floor(i/batchSize) + 1}:`, error);
        break;
      }
      
      migrated += batch.length;
      console.log(`✅ Migrated ${batch.length} attachments (total: ${migrated}/${toMigrate.length})`);
    }
    
    console.log(`\n🎉 Migration completed! Migrated ${migrated} attachments`);
    
    // Verify specific file
    const { data: specificFile } = await supabase
      .from('attachments')
      .select('*')
      .eq('file_name', 'file-1759338166036-139982218.jpg')
      .single();
    
    if (specificFile) {
      console.log('✅ Verified problematic file is now in PostgreSQL:', specificFile.file_name);
    } else {
      console.log('❌ Problematic file still not found in PostgreSQL');
    }
    
    sqliteDb.close();
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

migrateAttachments();