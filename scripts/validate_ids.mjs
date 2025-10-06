import postgres from 'postgres';

const checks = [
  { table: 'chat_sessions', col: 'user_id' },
  { table: 'messages', col: 'sender_id' },
  { table: 'subscriptions', col: 'user_id' }
];

async function main(){
  const conn = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if(!conn){ console.error('No DATABASE_PUBLIC_URL or DATABASE_URL in env'); process.exit(1); }
  const sql = postgres(conn, { ssl: conn.includes('localhost') ? false : { rejectUnauthorized: false } });
  try{
    for(const chk of checks){
      // identifiers are from a fixed whitelist above, safe to interpolate into SQL here
      console.log(`\nChecking ${chk.table}.${chk.col} for non-numeric values:`);
      const totalQ = `SELECT count(*)::int as cnt FROM public.${chk.table} WHERE ${chk.col} IS NOT NULL;`;
      const badQ = `SELECT count(*)::int as cnt FROM public.${chk.table} WHERE ${chk.col} IS NOT NULL AND ${chk.col} !~ '^[0-9]+$';`;
      const total = await sql.unsafe(totalQ);
      const bad = await sql.unsafe(badQ);
      console.log(`  total rows with ${chk.col}: ${total[0].cnt}, non-numeric: ${bad[0].cnt}`);
      if(bad[0].cnt > 0){
        console.log('  Examples (up to 20):');
        const rowsQ = `SELECT id, ${chk.col} as val FROM public.${chk.table} WHERE ${chk.col} IS NOT NULL AND ${chk.col} !~ '^[0-9]+$' LIMIT 20;`;
        const rows = await sql.unsafe(rowsQ);
        console.log(JSON.stringify(rows, null, 2));
      }
    }
  }catch(err){
    console.error('Error during validation:', err);
    process.exitCode = 2;
  }finally{
    try{ await sql.end(); }catch(e){}
  }
}

main();
