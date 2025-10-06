import fs from 'fs';
import path from 'path';
import postgres from 'postgres';

async function main() {
  const file = path.resolve(process.cwd(), 'migrations', '0005_fix_runtime_issues.sql');
  if (!fs.existsSync(file)) {
    console.error('File not found:', file);
    process.exit(1);
  }

  let sqlText = fs.readFileSync(file, 'utf8');

  // remove fenced code blocks if present (``` or ```sql)
  sqlText = sqlText.replace(/^\s*```.*?\n/ms, '');
  sqlText = sqlText.replace(/\n?```\s*$/m, '');

  // normalize line endings
  sqlText = sqlText.replace(/\r\n/g, '\n');

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not set. Run with Railway (recommended) or set DATABASE_URL env var.');
    console.error('Example (PowerShell): $env:DATABASE_URL = "postgres://..."; node scripts\\run_fix_sql.mjs');
    process.exit(1);
  }

  console.log('Connecting using DATABASE_URL from env...');
  const sql = postgres(connectionString, { ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false } });

  try {
    console.log('Executing SQL from', file);
    // Use unsafe to run full SQL file content (contains DO $$ blocks etc.)
    const result = await sql.unsafe(sqlText);
    console.log('Execution finished.');
    // result may be an array or object depending on queries; don't assume structure
  } catch (err) {
    console.error('Error executing SQL:', err);
    process.exitCode = 2;
  } finally {
    try { await sql.end(); } catch (e) { /* ignore */ }
  }
}

main();
