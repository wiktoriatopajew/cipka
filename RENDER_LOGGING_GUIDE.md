# 🚀 Szybka Konfiguracja Logowania na Render

## Problem rozwiązany ✅
Twoja aplikacja na Render generowała setki logów na minutę, szczególnie:
- Session check co sekundę (🔐)
- Live-data polling co sekundę (📊) 
- SQL queries przy każdej operacji (🔥)

## Rozwiązanie wdrożone 🛠️

### 1. Aktualne ustawienia Render (render.yaml)
```yaml
# Logger Configuration - Production Minimal
- key: LOG_LEVEL
  value: warn
- key: ENABLE_SESSION_LOGS
  value: false
- key: ENABLE_API_LOGS  
  value: false
- key: ENABLE_SQL_LOGS
  value: false
- key: ENABLE_ADMIN_LOGS
  value: true
- key: ENABLE_LIVE_DATA_LOGS
  value: false
- key: ENABLE_PAYMENT_LOGS
  value: true
```

### 2. Co to oznacza w praktyce
- ❌ **Session logs**: Wyłączone (były najczęstsze)
- ❌ **API logs**: Wyłączone (setki na minutę)
- ❌ **SQL logs**: Wyłączone (bardzo częste)
- ✅ **Admin logs**: Włączone (ważne dla bezpieczeństwa)
- ❌ **Live-data logs**: Wyłączone (najczęstsze - co sekundę!)
- ✅ **Payment logs**: Włączone (ważne dla transakcji)
- ⚠️ **Log level**: WARN (tylko ostrzeżenia i błędy)

## 🔄 Jeśli potrzebujesz zmienić ustawienia

### Opcja A: Przez Render Dashboard
1. Idź na https://dashboard.render.com
2. Wybierz swoją usługę `automentor`
3. Zakładka **Environment**
4. Dodaj/zmień zmienne:
   - `LOG_LEVEL` = `error` (jeszcze ciszej) lub `info` (więcej logów)
   - `ENABLE_LIVE_DATA_LOGS` = `true` (czasowo włącz dla debugowania)

### Opcja B: Przez kod (render.yaml)
```bash
# Edytuj render.yaml, zmień wartości, potem:
git add render.yaml
git commit -m "🔧 Adjust logging level"
git push origin master
```

## 📊 Dostępne poziomy logowania

### Produkcyjne (zalecane)
- `LOG_LEVEL=error` - Tylko błędy
- `LOG_LEVEL=warn` - Błędy + ostrzeżenia (obecne)

### Debug (tymczasowo)
- `LOG_LEVEL=info` - Więcej szczegółów
- `ENABLE_LIVE_DATA_LOGS=true` - Włącz logi polling'u

### Pełny debug (tylko w wyjątkowych przypadkach)
- `LOG_LEVEL=debug` + włącz wszystkie kategorie

## 🎯 Rezultat
- **Przed**: Setki logów na minutę podczas aktywności admin panelu
- **Po**: Tylko ważne logi (błędy, ostrzeżenia, admin, płatności)
- **Performance**: Znacznie mniej obciążenia konsoli na Render

## ⚡ Szybkie akcje

### Całkowita cisza (emergency)
```
LOG_LEVEL=silent
```

### Wrócić do obecnych ustawień
```
LOG_LEVEL=warn
ENABLE_ADMIN_LOGS=true
ENABLE_PAYMENT_LOGS=true
# Reszta false
```

Render automatycznie zastosuje nowe ustawienia po deploy'u!