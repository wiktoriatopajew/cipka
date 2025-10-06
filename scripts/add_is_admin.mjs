import postgres from 'postgres';

async function main(){
  const conn = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if(!conn){ console.error('No DATABASE_PUBLIC_URL or DATABASE_URL in env'); process.exit(1); }
  const sql = postgres(conn, { ssl: conn.includes('localhost') ? false : { rejectUnauthorized: false } });
  try{
    console.log('Running: ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;');
    await sql`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;`;
    console.log('Done: is_admin column ensured on public.users');
  }catch(err){
    console.error('Error executing ALTER TABLE:', err);
    process.exitCode = 2;
  }finally{
    try{ await sql.end(); }catch(e){}
  }
}

main();
