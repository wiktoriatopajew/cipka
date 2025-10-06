import postgres from 'postgres';

const targets = [
  { table: 'chat_sessions', col: 'user_id', fkName: 'chat_sessions_user_id_users_id_fk' },
  { table: 'messages', col: 'sender_id', fkName: 'messages_sender_id_users_id_fk' },
  { table: 'subscriptions', col: 'user_id', fkName: 'subscriptions_user_id_users_id_fk' }
];

async function main(){
  const conn = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if(!conn){ console.error('No DATABASE_PUBLIC_URL or DATABASE_URL in env'); process.exit(1); }
  const sql = postgres(conn, { ssl: conn.includes('localhost') ? false : { rejectUnauthorized: false } });
  try{
    // Drop integer FKs if exist
    for(const t of targets){
      try{
        console.log(`Dropping constraint ${t.fkName} on ${t.table} if exists`);
        await sql.unsafe(`ALTER TABLE public.${t.table} DROP CONSTRAINT IF EXISTS ${t.fkName};`);
      }catch(e){ console.warn('Error dropping constraint:', e); }
    }

    // Convert users.id to text if needed
    const usersIdInfo = await sql`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='id';`;
    if(usersIdInfo.length && usersIdInfo[0].data_type !== 'text'){
      console.log('Converting users.id to text');
      await sql.unsafe(`ALTER TABLE public.users ALTER COLUMN id TYPE text USING id::text;`);
      console.log('Setting default for users.id to gen_random_uuid()');
      await sql.unsafe(`ALTER TABLE public.users ALTER COLUMN id SET DEFAULT gen_random_uuid();`);
    } else {
      console.log('users.id already text');
    }

    // Convert other id columns to text
    for(const t of targets){
      const info = await sql`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=${t.table} AND column_name=${t.col};`;
      if(!info.length){ console.log(`${t.table}.${t.col} missing — skipping`); continue; }
      if(info[0].data_type !== 'text'){
        console.log(`Converting ${t.table}.${t.col} to text`);
        await sql.unsafe(`ALTER TABLE public.${t.table} ALTER COLUMN ${t.col} TYPE text USING ${t.col}::text;`);
      } else {
        console.log(`${t.table}.${t.col} already text`);
      }
    }

    console.log('Finished converting IDs to text');
  }catch(err){
    console.error('Error during migration to text:', err);
    process.exitCode = 2;
  }finally{ try{ await sql.end(); }catch(e){} }
}

main();
