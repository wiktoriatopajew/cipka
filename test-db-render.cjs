const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://automentor_db_user:5VpcIDdEOOyvQWeE36f6nMir3ofwythZ@dpg-d3j3iojuibrs73dac2e0-a.oregon-postgres.render.com/automentor_db',
  ssl: { rejectUnauthorized: false }
});

async function testDB() {
  try {
    console.log('🔗 Testing PostgreSQL connection...');
    
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Check if attachments table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'attachments'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ Attachments table exists');
      
      // Count attachments
      const countResult = await client.query('SELECT COUNT(*) FROM attachments');
      console.log(`📊 Attachments in PostgreSQL: ${countResult.rows[0].count}`);
      
      // Check for specific file
      const specificResult = await client.query(
        'SELECT * FROM attachments WHERE file_name = $1',
        ['file-1759338166036-139982218.jpg']
      );
      
      if (specificResult.rows.length > 0) {
        console.log('✅ Problematic file found in PostgreSQL!');
      } else {
        console.log('❌ Problematic file NOT in PostgreSQL');
      }
      
    } else {
      console.log('❌ Attachments table does not exist');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testDB();