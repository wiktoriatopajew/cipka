// Wrapper: prefer DATABASE_PUBLIC_URL (Railway proxy) when executing from outside internal network
// Debug: print relevant env vars to see what's available in Railway run
console.log('ENV DEBUG:');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('DATABASE_PUBLIC_URL:', process.env.DATABASE_PUBLIC_URL);
console.log('PGHOST:', process.env.PGHOST);
console.log('PGPORT:', process.env.PGPORT);
console.log('PGUSER:', process.env.PGUSER ? 'present' : 'missing');

if (process.env.DATABASE_PUBLIC_URL) {
  // override DATABASE_URL so the script uses the public proxy URL
  process.env.DATABASE_URL = process.env.DATABASE_PUBLIC_URL;
  // remove PGHOST/PGPORT which might point to internal host and confuse some clients
  delete process.env.PGHOST;
  delete process.env.PGPORT;
  console.log('Overrode DATABASE_URL with DATABASE_PUBLIC_URL and cleared PGHOST/PGPORT.');
}

(async () => {
  try {
    await import('./run_fix_sql.mjs');
  } catch (err) {
    console.error('Wrapper failed:', err);
    process.exit(2);
  }
})();
