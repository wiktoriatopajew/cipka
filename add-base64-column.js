import postgres from 'postgres';

const DATABASE_URL = "postgresql://automentor_db_user:5VpcIDdEOOyvQWeE36f6nMir3ofwythZ@dpg-d3j3iojuibrs73dac2e0-a/automentor_db";

async function addBase64Column() {
  console.log('🔗 Connecting to Render PostgreSQL database...');
  const client = postgres(DATABASE_URL);
  
  try {
    console.log('🔧 Adding base64_data column to attachments table...');
    
    await client`ALTER TABLE attachments ADD COLUMN IF NOT EXISTS base64_data TEXT;`;
    
    console.log('✅ Column added successfully!');
    
    // Verify the column exists
    const result = await client`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'attachments' 
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Current attachments table columns:');
    result.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
}

addBase64Column();