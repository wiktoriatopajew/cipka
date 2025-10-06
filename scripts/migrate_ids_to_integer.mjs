import postgres from 'postgres';

const targets = [
  { table: 'chat_sessions', col: 'user_id', fkName: 'chat_sessions_user_id_users_id_fk', refTable: 'users', refCol: 'id' },
  { table: 'messages', col: 'sender_id', fkName: 'messages_sender_id_users_id_fk', refTable: 'users', refCol: 'id' },
  { table: 'subscriptions', col: 'user_id', fkName: 'subscriptions_user_id_users_id_fk', refTable: 'users', refCol: 'id' }
];

async function main(){
  const conn = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if(!conn){ console.error('No DATABASE_PUBLIC_URL or DATABASE_URL in env'); process.exit(1); }
  const sql = postgres(conn, { ssl: conn.includes('localhost') ? false : { rejectUnauthorized: false } });
  try{
    // Ensure users.id is integer (expected)
    const usersIdType = await sql`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='id';`;
    if(!usersIdType.length){
      console.error('users.id column not found - aborting');
      process.exit(2);
    }
    console.log('users.id type =', usersIdType[0].data_type);

    for(const t of targets){
      const colInfo = await sql`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=${t.table} AND column_name=${t.col};`;
      if(!colInfo.length){
        console.log(`${t.table}.${t.col} does not exist — skipping`);
        continue;
      }
      const currentType = colInfo[0].data_type;
      console.log(`${t.table}.${t.col} current type: ${currentType}`);
      if(currentType !== 'integer'){
        console.log(`Converting ${t.table}.${t.col} -> integer (non-numeric values will become NULL)`);
        const alterQ = `ALTER TABLE public.${t.table} ALTER COLUMN ${t.col} TYPE integer USING (CASE WHEN ${t.col} ~ '^[0-9]+$' THEN ${t.col}::integer ELSE NULL END);`;
        try{
          await sql.unsafe(alterQ);
          console.log(`Converted ${t.table}.${t.col} to integer`);
        }catch(err){
          console.error('Error converting column:', err);
        }
      } else {
        console.log(`${t.table}.${t.col} already integer`);
      }

      // attempt to add FK if both sides are integer
      const leftType = (await sql`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=${t.table} AND column_name=${t.col};`)[0].data_type;
      const rightType = (await sql`SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=${t.refTable} AND column_name=${t.refCol};`)[0].data_type;
      if(leftType === rightType && leftType === 'integer'){
        console.log(`Adding FK ${t.fkName} if missing`);
        const doAdd = `DO $$ BEGIN ALTER TABLE public.${t.table} ADD CONSTRAINT ${t.fkName} FOREIGN KEY (${t.col}) REFERENCES public.${t.refTable}(${t.refCol}) ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN NULL; END $$;`;
        try{
          await sql.unsafe(doAdd);
          console.log(`FK ${t.fkName} ensured`);
        }catch(err){ console.error('Error adding FK:', err); }
      } else {
        console.log(`Skipping FK ${t.fkName} due to type mismatch: ${leftType} != ${rightType}`);
      }
    }
    console.log('Migration finished');
  }catch(err){
    console.error('Migration script error:', err);
    process.exitCode = 2;
  }finally{ try{ await sql.end(); }catch(e){} }
}

main();
