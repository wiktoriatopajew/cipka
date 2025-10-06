import postgres from 'postgres';

const tables = ['users','chat_sessions','messages','attachments','subscriptions'];

async function main(){
  const conn = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if(!conn){ console.error('No DATABASE_URL in env'); process.exit(1); }
  const sql = postgres(conn, { ssl: conn.includes('localhost') ? false : { rejectUnauthorized: false } });
  try{
    for(const t of tables){
      const cols = await sql`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name=${t} ORDER BY ordinal_position;`;
      console.log(`\nTable: ${t}`);
      if(!cols.length) console.log('  (missing)');
      else console.log(JSON.stringify(cols, null, 2));
    }
  }catch(e){ console.error('Error:', e); process.exitCode = 2; }
  finally{ try{ await sql.end(); }catch(e){} }
}

main();
