# 📊 Statystyki Odwiedzin i Favicon - Dokumentacja

## ✨ Nowe Funkcjonalności

### 1. 📈 Statystyki Odwiedzin Strony

Aplikacja teraz automatycznie śledzi wszystkie wizyty na stronie i zbiera dane o:

#### Podstawowe metryki:
- **Całkowite wyświetlenia stron** - liczba wszystkich odsłon
- **Unikalni odwiedzający** - liczba unikalnych IP odwiedzających
- **Średnio na odwiedzającego** - średnia liczba stron na użytkownika

#### Dane geograficzne:
- **Kraj** - z jakiego kraju przychodzą odwiedzający
- **Miasto** - dokładna lokalizacja (w miarę możliwości)
- **Mapa odwiedzin** - wizualizacja geograficzna ruchu

#### Dane techniczne:
- **Typ urządzenia** - Desktop / Mobile / Tablet
- **Przeglądarka** - Chrome, Firefox, Safari, Edge, Opera
- **System operacyjny** - Windows, macOS, Linux, Android, iOS

#### Popularne strony:
- **Top 10 stron** - najczęściej odwiedzane URL-e
- **Wykresy w czasie** - trendy dzienne/miesięczne

### 2. 🎨 Zmiana Favicon

Teraz możesz łatwo zmienić favicon (ikonkę w zakładce przeglądarki) przez panel admina.

## 🚀 Jak używać

### Dostęp do statystyk odwiedzin:

1. Zaloguj się do panelu administratora: `/admin`
2. Kliknij zakładkę **"Statystyki Odwiedzin"** 
3. Wybierz okres:
   - Ostatnie 7 dni
   - Ostatnie 30 dni
   - Ostatni rok
4. Wybierz grupowanie:
   - Dziennie - szczegółowe dane dzienne
   - Miesięcznie - widok miesięczny dla dłuższych okresów

### Zmiana Favicon:

1. Zaloguj się do panelu administratora: `/admin`
2. Przejdź do zakładki **"Konfiguracja"**
3. Przewiń do sekcji **"Website Favicon"**
4. Kliknij **"Wybierz plik"** lub **"Upload"**
5. Wybierz plik (.ico, .png, .jpg, lub .gif)
6. ✅ Favicon zostanie automatycznie zapisany i zastosowany!

**Wymagania dla favicon:**
- Maksymalny rozmiar: 1MB
- Zalecany format: .ico lub .png
- Zalecany rozmiar: 32x32 pikseli (dla .ico) lub kwadratowy PNG
- Obsługiwane formaty: .ico, .png, .jpg, .gif

## 🔧 Konfiguracja techniczna

### Tracking odwiedzin

Aplikacja automatycznie śledzi wizyty za pomocą:

```typescript
// Hook automatycznie dodany w App.tsx
import { usePageTracking } from '@/hooks/usePageTracking';

// Automatycznie śledzi każdą zmianę strony
```

### Geolokalizacja IP

Używamy bezpłatnego API `ipapi.co` do określania lokalizacji:
- Nie wymaga klucza API
- Limit: 1000 requestów dziennie (wystarczające dla większości zastosowań)
- Jeśli przekroczysz limit, lokalizacja będzie "Unknown", ale tracking będzie działał

### Endpoints API

```
GET  /api/admin/analytics/pageviews?startDate=...&endDate=...&groupBy=day
GET  /api/admin/analytics/visitors?startDate=...&endDate=...
POST /api/analytics/pageview (automatyczne)
```

## 📦 Migracja bazy danych

Jeśli masz już działającą bazę PostgreSQL, uruchom migrację:

```bash
# Połącz się z bazą i uruchom:
psql -U your_user -d your_database -f migrations/add-analytics-columns.sql
```

Lub użyj Drizzle:

```bash
npm run db:push
```

## 🎯 Jak to działa

### Page View Tracking

1. Użytkownik wchodzi na stronę
2. Hook `usePageTracking` wykrywa zmianę URL
3. Wysyłany jest request do `/api/analytics/pageview` z:
   - URL strony
   - Referrer (skąd przyszedł)
   - User Agent (przeglądarka)
4. Serwer:
   - Pobiera IP z nagłówków
   - Odpytuje API geolokalizacji o kraj i miasto
   - Parsuje User Agent dla typu urządzenia, przeglądarki i OS
   - Zapisuje wszystko do bazy `analytics_events`

### Favicon Upload

1. Admin wybiera plik
2. Walidacja po stronie klienta (typ, rozmiar)
3. Upload przez FormData do `/api/admin/upload-favicon`
4. Serwer:
   - Sprawdza typ i rozmiar
   - Przenosi plik do `uploads/favicons/`
   - Usuwa stary favicon (jeśli istniał)
   - Zwraca ścieżkę do nowego pliku
5. Klient automatycznie zapisuje nową ścieżkę w konfiguracji
6. Favicon jest serwowany przez `/favicon.ico` endpoint

## 🔐 Bezpieczeństwo

### GDPR / Privacy

Zbieramy tylko:
- IP (hash można dodać dla anonimizacji)
- User Agent (publiczny string)
- URL odwiedzonych stron

**Nie zbieramy:**
- Danych osobowych
- Ciasteczek trackingowych
- Informacji o użytkowniku (chyba że zalogowany)

### Rekomendacje:

1. Dodaj info o tracking w Privacy Policy
2. Rozważ hash IP po 24h dla GDPR compliance
3. Dodaj opcję opt-out dla użytkowników

## 📊 Przykładowe zapytania SQL

### Top 10 krajów:

```sql
SELECT country, COUNT(DISTINCT ip_address) as visitors
FROM analytics_events
WHERE event_type = 'page_view'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY country
ORDER BY visitors DESC
LIMIT 10;
```

### Ruch według urządzeń:

```sql
SELECT device_type, COUNT(*) as views
FROM analytics_events
WHERE event_type = 'page_view'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY device_type;
```

### Najpopularniejsze strony:

```sql
SELECT page_url, COUNT(*) as views
FROM analytics_events
WHERE event_type = 'page_view'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY page_url
ORDER BY views DESC
LIMIT 20;
```

## 🐛 Troubleshooting

### Favicon nie zmienia się?

1. Wyczyść cache przeglądarki (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Sprawdź w devtools Network czy `/favicon.ico` zwraca nowy plik
4. Sprawdź w bazie czy `app_config.favicon_path` jest ustawione

### Brak statystyk?

1. Sprawdź czy tabela `analytics_events` istnieje
2. Uruchom migrację: `migrations/add-analytics-columns.sql`
3. Sprawdź logi serwera czy tracking działa
4. Sprawdź czy endpoint `/api/analytics/pageview` zwraca 200

### Geolokalizacja nie działa?

1. Sprawdź czy IP nie jest localhost (127.0.0.1)
2. API ipapi.co ma limit 1000/dzień - sprawdź czy nie przekroczyłeś
3. W logach zobaczysz błędy geolokalizacji (są ignorowane)
4. Lokalizacja będzie "Unknown" ale reszta trackingu działa

## 🎨 Customization

### Zmiana dostawcy geolokalizacji:

W `server/routes.ts` zmień:

```typescript
// Zamiast ipapi.co możesz użyć:
// - ip-api.com (free, 45 req/min)
// - freegeoip.app (free, 15k/hour)
// - ipinfo.io (wymaga klucza API)

const geoResponse = await fetch(
  `https://ip-api.com/json/${ipAddress}`,
  { headers: { 'User-Agent': 'AutoMentor Analytics' } }
);
```

### Dodanie własnych eventów:

```typescript
// W komponencie:
await fetch('/api/analytics/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    eventType: 'custom',
    eventName: 'button_click',
    properties: JSON.stringify({ buttonId: 'purchase' })
  })
});
```

## 📝 TODO / Przyszłe usprawnienia

- [ ] Dashboard z mapą świata (interaktywny)
- [ ] Export statystyk do CSV/Excel
- [ ] Email reports (cotygodniowe podsumowanie)
- [ ] Real-time visitor counter
- [ ] Heatmapy kliknięć
- [ ] A/B testing framework
- [ ] Anonimizacja IP (GDPR)
- [ ] Cache geolokalizacji (zredukować API calls)

## 📞 Support

Jeśli masz pytania lub problemy:
1. Sprawdź logi serwera
2. Sprawdź console w przeglądarce (F12)
3. Zajrzyj do tego README

---

**Autor:** AutoMentor Team  
**Data:** 2025-01-08  
**Wersja:** 1.0.0
