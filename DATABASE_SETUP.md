# Instrukcje konfiguracji bazy danych PostgreSQL na Vercel

## Krok 1: Stwórz bazę danych PostgreSQL

### Opcja A: Neon.tech (zalecane)
1. Idź na https://neon.tech
2. Zarejestruj się (GitHub account)
3. Stwórz nowy projekt
4. Skopiuj "Connection string" z dashboard

### Opcja B: Supabase
1. Idź na https://supabase.com
2. Stwórz nowy projekt
3. Idź do Settings > Database
4. Skopiuj "Connection string" (URI format)

### Opcja C: Vercel Postgres
1. W dashboardzie Vercel, idź do swojego projektu
2. Przejdź do Storage tab
3. Stwórz Postgres database
4. Connection string będzie automatycznie dodany

## Krok 2: Dodaj zmienne środowiskowe do Vercel

```bash
# W terminalu (w katalogu projektu):
vercel env add DATABASE_URL
# Wklej connection string z kroku 1

# Dodaj inne wymagane zmienne:
vercel env add JWT_SECRET
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add PAYPAL_CLIENT_ID
vercel env add PAYPAL_CLIENT_SECRET
vercel env add PAYPAL_ENVIRONMENT
```

## Krok 3: Uruchom migracje

```bash
# Ustaw DATABASE_URL lokalnie (tymczasowo):
$env:DATABASE_URL="your_postgres_connection_string"

# Uruchom migracje:
npm run db:push

# Zaimportuj dane:
npx tsx scripts/migrate-to-postgres.ts
```

## Krok 4: Wdróż ponownie

```bash
vercel --prod
```

## Sprawdzenie

Po wdrożeniu sprawdź:
- https://twoja-domena.vercel.app/api/health (jeśli masz endpoint health)
- Logi w Vercel Dashboard