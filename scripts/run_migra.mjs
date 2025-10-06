import fs from 'fs';
import path from 'path';
import postgres from 'postgres';

async function main(){
  const file = path.resolve(process.cwd(), 'migrations', 'migra.sql');
  if(!fs.existsSync(file)){
    console.error('migrations/migra.sql not found');
    process.exit(1);
  }
  let sqlText = fs.readFileSync(file, 'utf8');
  // remove markdown fences if any
  sqlText = sqlText.replace(/^\s*```.*?\n/ms, '');
  sqlText = sqlText.replace(/\n?```\s*$/m, '');

  const conn = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if(!conn){
    console.error('No DATABASE_URL / DATABASE_PUBLIC_URL in env');
    process.exit(1);
  }

  // if using public url, prefer it
  const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  console.log('Using connection string from env (public preferred).');
  const sql = postgres(connectionString, { ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false } });

  try{
    console.log('Executing migrations/migra.sql...');
    await sql.unsafe(sqlText);
    console.log('migrations/migra.sql executed successfully.');
  }catch(e){
    console.error('Error executing migra.sql:', e);
    process.exitCode = 2;
  }finally{
    try{ await sql.end(); }catch(e){}
  }
}

main();
