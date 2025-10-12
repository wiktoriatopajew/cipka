# 🔇 System Kontroli Logowania

## Problem
System generuje bardzo dużo logów na konsoli, szczególnie:
- Session check logs (🔐) - przy każdym API call
- Live-data logs (📊) - co sekundę podczas aktywności admin panelu  
- SQL logs (🔥) - przy każdej operacji bazodanowej
- API logs (📡) - przy każdym request/response

## Rozwiązanie
Zaimplementowano inteligentny system logowania z kontrolą poziomu i kategorii.

## 📋 Kategorie Logów

| Kategoria | Icon | Domyślnie | Opis |
|-----------|------|-----------|------|
| `session` | 🔐 | DEV only | Logi sesji i autentykacji |
| `api` | 📡 | DEV only | HTTP requests/responses |
| `sql` | 🔥 | DEV only | Zapytania do bazy danych |
| `admin` | 👑 | Zawsze | Akcje administratorskie |
| `liveData` | 📊 | Nigdy | Polling danych na żywo |
| `payment` | 💳 | Zawsze | Płatności i transakcje |

## 🛠️ Konfiguracja

### 1. Zmienne środowiskowe
```bash
# Kontrola kategorii (true/false)
ENABLE_SESSION_LOGS=false
ENABLE_API_LOGS=true
ENABLE_SQL_LOGS=false
ENABLE_ADMIN_LOGS=true
ENABLE_LIVE_DATA_LOGS=false
ENABLE_PAYMENT_LOGS=true

# Poziom logowania
LOG_LEVEL=warn  # silent|error|warn|info|debug
```

### 2. Domyślne zachowanie
- **Produkcja**: Tylko error/warn + admin/payment logs
- **Development**: Wszystkie kategorie oprócz liveData
- **Live-data logs**: Wyłączone domyślnie (zbyt częste)

### 3. Szybkie wyłączenie wszystkich logów
```bash
LOG_LEVEL=silent
```

## 💡 Użycie w kodzie

### Zamiast console.log
```typescript
// Przed
console.log("🔐 Session check for", path);
console.log("🔥 RAW SQL query:", query);

// Po
Logger.session("Session check for", path);
Logger.sql("RAW SQL query:", query);
```

### Dostępne metody
```typescript
Logger.session("message", data);    // 🔐 Session logs
Logger.api("message", data);        // 📡 API logs  
Logger.sql("message", data);        // 🔥 SQL logs
Logger.admin("message", data);      // 👑 Admin logs
Logger.liveData("message", data);   // 📊 Live data logs
Logger.payment("message", data);    // 💳 Payment logs

Logger.info("message", data);       // ℹ️ Info
Logger.warn("message", data);       // ⚠️ Warning
Logger.error("message", data);      // ❌ Error
Logger.debug("message", data);      // 🔍 Debug
```

## 🚀 Szybkie rozwiązanie problemu z logami

### Produkcja - minimalne logi
```bash
LOG_LEVEL=error
ENABLE_SESSION_LOGS=false
ENABLE_API_LOGS=false
ENABLE_SQL_LOGS=false
ENABLE_LIVE_DATA_LOGS=false
```

### Development - kontrolowane logi
```bash
LOG_LEVEL=info
ENABLE_SESSION_LOGS=false     # Wyłącz najczęstsze
ENABLE_LIVE_DATA_LOGS=false   # Wyłącz polling
ENABLE_SQL_LOGS=false         # Wyłącz SQL (jeśli niepotrzebne)
```

### Debug konkretnego problemu
```bash
LOG_LEVEL=debug
ENABLE_SESSION_LOGS=true      # Włącz dla problemów z sesją
ENABLE_SQL_LOGS=true          # Włącz dla problemów z bazą
```

## 🎯 Rezultat
- **Przed**: Setki logów na minutę podczas aktywności admina
- **Po**: Tylko ważne logi + pełna kontrola nad tym co jest wyświetlane
- **Elastyczność**: Możliwość włączania konkretnych kategorii podczas debugowania

## 📁 Zmodyfikowane pliki
- `server/logger.ts` - Nowy system logowania
- `server/index.ts` - Session i API logs
- `server/routes.ts` - Admin, live-data, payment logs
- `server/storage.ts` - SQL logs
- `.env.logger` - Przykładowa konfiguracja