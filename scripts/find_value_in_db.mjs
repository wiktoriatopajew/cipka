import postgres from 'postgres';

const SEARCH = process.env.SEARCH_VALUE || process.argv[2];
if(!SEARCH){
  console.error('Please set SEARCH_VALUE env var or pass value as first argument');
  process.exit(1);
}

async function main(){
  const conn = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if(!conn){ console.error('No DATABASE_PUBLIC_URL or DATABASE_URL in env'); process.exit(1); }
  const sql = postgres(conn, { ssl: conn.includes('localhost') ? false : { rejectUnauthorized: false } });
  try{
    const cols = await sql`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND data_type IN ('text','character varying') ORDER BY table_name;`;
    for(const c of cols){
      // sanitize SEARCH for safe interpolation into SQL string
      const safe = SEARCH.replace(/'/g, "''");
      const q = `SELECT count(*)::int as cnt FROM public.${c.table_name} WHERE ${c.column_name} = '${safe}'`;
      const res = await sql.unsafe(q);
      if(res[0].cnt > 0){
        console.log(`Found ${res[0].cnt} rows in ${c.table_name}.${c.column_name}`);
        const rows = await sql.unsafe(`SELECT id, ${c.column_name} as val FROM public.${c.table_name} WHERE ${c.column_name} = '${safe}' LIMIT 20`);
        console.log(JSON.stringify(rows, null, 2));
      }
    }
  }catch(err){
    console.error('Search error:', err);
    process.exitCode = 2;
  }finally{ try{ await sql.end(); }catch(e){} }
}

main();
