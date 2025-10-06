import postgres from 'postgres';

function nl() { console.log('------------------------------------------------------------'); }

async function main(){
  const conn = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if(!conn){
    console.error('No DATABASE_URL / DATABASE_PUBLIC_URL in env');
    process.exit(1);
  }

  console.log('Using connection from env (public preferred).');
  const sql = postgres(conn, { ssl: conn.includes('localhost') ? false : { rejectUnauthorized: false } });

  try{
    nl();
    console.log('1) Tables in public schema:');
    const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`;
    console.log(tables.map(r=>r.tablename).join(', ') || '(none)');

    nl();
    console.log('2) users.username column:');
    const col = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='username';`;
    console.log(col.length ? JSON.stringify(col, null, 2) : 'missing');

    nl();
    console.log('3) users indexes:');
    const idx = await sql`SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename='users';`;
    console.log(idx.length ? idx.map(r=>r.indexname).join(', ') : '(none)');

    nl();
    console.log('4) attachments table exists (to_regclass):');
    const att = await sql`SELECT to_regclass('public.attachments') as reg`; 
    console.log(att[0] && att[0].reg ? att[0].reg : 'missing');

    nl();
    console.log('5) FK constraint attachments_message_id_messages_id_fk:');
    const fk = await sql`SELECT conname, contype FROM pg_constraint WHERE conname = 'attachments_message_id_messages_id_fk';`;
    console.log(fk.length ? JSON.stringify(fk, null, 2) : 'missing');

  }catch(e){
    console.error('Error during verify:', e);
    process.exitCode = 2;
  } finally{
    try{ await sql.end(); }catch(e){}
  }
}

main();
