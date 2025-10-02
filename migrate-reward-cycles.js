import Database from 'better-sqlite3';

// Migrates the referral_rewards table to add reward_cycle column
async function migrateRewardCycles() {
  console.log('🔄 Starting reward cycles migration...');
  
  const db = new Database('./database.sqlite');
  
  try {
    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(referral_rewards)").all();
    const hasRewardCycleColumn = tableInfo.some(col => col.name === 'reward_cycle');
    
    if (hasRewardCycleColumn) {
      console.log('✅ reward_cycle column already exists');
      return;
    }

    console.log('➕ Adding reward_cycle column to referral_rewards table...');
    
    // Add the new column with default value of 1
    db.prepare(`
      ALTER TABLE referral_rewards 
      ADD COLUMN reward_cycle INTEGER DEFAULT 1
    `).run();
    
    // Update existing records to have cycle 1
    const result = db.prepare(`
      UPDATE referral_rewards 
      SET reward_cycle = 1 
      WHERE reward_cycle IS NULL
    `).run();
    
    console.log(`✅ Migration completed successfully!`);
    console.log(`📊 Updated ${result.changes} existing records`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

migrateRewardCycles()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });