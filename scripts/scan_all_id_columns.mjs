import postgres from 'postgres';

async function main(){
  const conn = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if(!conn){ console.error('No DATABASE_PUBLIC_URL or DATABASE_URL in env'); process.exit(1); }
  const sql = postgres(conn, { ssl: conn.includes('localhost') ? false : { rejectUnauthorized: false } });
  try{
    const cols = await sql`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND column_name LIKE '%_id' ORDER BY table_name;`;
    for(const c of cols){
      console.log(`\nTable: ${c.table_name}, Column: ${c.column_name}, Type: ${c.data_type}`);
      if(c.data_type === 'text' || c.data_type === 'character varying'){
        const total = await sql.unsafe(`SELECT count(*)::int as cnt FROM public.${c.table_name} WHERE ${c.column_name} IS NOT NULL;`);
        const nonNumeric = await sql.unsafe(`SELECT count(*)::int as cnt FROM public.${c.table_name} WHERE ${c.column_name} IS NOT NULL AND ${c.column_name} !~ '^[0-9]+$';`);
        console.log(`  total non-null: ${total[0].cnt}, non-numeric: ${nonNumeric[0].cnt}`);
        if(nonNumeric[0].cnt > 0){
          console.log('  Examples:');
          const rows = await sql.unsafe(`SELECT id, ${c.column_name} as val FROM public.${c.table_name} WHERE ${c.column_name} IS NOT NULL AND ${c.column_name} !~ '^[0-9]+$' LIMIT 20;`);
          console.log(JSON.stringify(rows, null, 2));
        }
      } else {
        const total = await sql.unsafe(`SELECT count(*)::int as cnt FROM public.${c.table_name} WHERE ${c.column_name} IS NOT NULL;`);
        console.log(`  total non-null: ${total[0].cnt}`);
      }
    }
  }catch(err){
    console.error('Error scanning id columns:', err);
    process.exitCode = 2;
  }finally{ try{ await sql.end(); }catch(e){} }
}

main();
