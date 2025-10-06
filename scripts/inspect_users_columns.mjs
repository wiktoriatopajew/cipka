import postgres from 'postgres';

async function main(){
  const conn = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if(!conn){
    console.error('No DATABASE_URL found in env');
    process.exit(1);
  }
  const sql = postgres(conn, { ssl: conn.includes('localhost') ? false : { rejectUnauthorized: false } });
  try{
    const cols = await sql`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='users' ORDER BY ordinal_position;`;
    console.log('users columns:');
    console.log(JSON.stringify(cols, null, 2));
  }catch(e){
    console.error('Error inspecting users columns:', e);
    process.exitCode = 2;
  }finally{
    try{ await sql.end(); }catch(e){}
  }
}

main();
