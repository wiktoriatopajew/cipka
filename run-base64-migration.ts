import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
  }

  const client = postgres(process.env.DATABASE_URL);
  
  try {
    console.log('🔧 Running base64_data column migration...');
    
    // Add base64_data column if it doesn't exist
    await client`
      ALTER TABLE attachments 
      ADD COLUMN IF NOT EXISTS base64_data TEXT;
    `;
    
    console.log('✅ Migration completed successfully!');
    console.log('📝 Added base64_data column to attachments table');
    
    // Verify column exists
    const result = await client`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'attachments' AND column_name = 'base64_data';
    `;
    
    if (result.length > 0) {
      console.log('✅ Verification: base64_data column exists');
    } else {
      console.log('❌ Verification failed: base64_data column not found');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();