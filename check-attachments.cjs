const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = 'https://ltkbqcphjrccuqrcjejj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0a2JxY3BoanJjY3VxcmNqZWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc1ODUzMDYsImV4cCI6MjA0MzE2MTMwNn0.HkJ5YMPZyP6FHHT_d3A7h7lQPz2HJTTkMGsYVKnCnCg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAttachments() {
  console.log('🔍 Checking attachments table...');
  
  try {
    // Check all attachments
    const { data: attachments, error } = await supabase
      .from('attachments')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`📊 Found ${attachments?.length || 0} attachment records`);
    
    if (attachments && attachments.length > 0) {
      console.log('\n📁 Attachment records:');
      attachments.forEach(att => {
        console.log(`  - ID: ${att.id}, Filename: ${att.filename}, Path: ${att.file_path}`);
      });
      
      // Look for the specific file
      const specificFile = attachments.find(att => att.filename === 'file-1759338166036-139982218.jpg');
      if (specificFile) {
        console.log(`\n✅ Found specific file: ${JSON.stringify(specificFile, null, 2)}`);
      } else {
        console.log(`\n❌ Specific file 'file-1759338166036-139982218.jpg' not found in DB`);
      }
    } else {
      console.log('❌ No attachment records found in database!');
      console.log('🔧 Need to migrate attachments table from SQLite');
    }
    
  } catch (error) {
    console.error('💥 Error checking attachments:', error.message);
  }
}

checkAttachments();