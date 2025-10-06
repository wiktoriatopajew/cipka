Jak uruchomić jednorazowy SQL fix (np. migrations/0005_fix_runtime_issues.sql)

Masz dwie opcje: uruchomić lokalnie (psql / node) albo bezpośrednio w Railway przy użyciu Railway CLI.

1) Railway CLI (najprostsze, nie wymaga lokalnego psql):

  railway run node scripts/run_fix_sql.mjs

  Railway ustawi zmienną DATABASE_URL automatycznie dla procesu, więc skrypt połączy się i wykona zawartość `migrations/0005_fix_runtime_issues.sql`.

2) Lokalnie z Node (jeśli masz DATABASE_URL):

  # PowerShell
  $env:DATABASE_URL = "postgres://user:pass@host:5432/dbname"
  node scripts/run_fix_sql.mjs

3) Alternatywa: użyj psql lub narzędzia webowego (np. Railway Console -> SQL) i wklej zawartość `migrations/0005_fix_runtime_issues.sql`.

Po wykonaniu sprawdź, czy tabele/kolumny istnieją (see verification queries in the file or run):

  SELECT tablename FROM pg_tables WHERE schemaname = 'public';
  SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='username';

Jeśli pojawi się błąd, wklej go tutaj (pełny stack / komunikat).
