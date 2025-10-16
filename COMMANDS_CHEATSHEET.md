# 📋 Komendy Deployment - Cheat Sheet

## 🚀 Szybki deployment (wszystko automatycznie)

```powershell
npm run deploy:render
```
Interaktywny skrypt który zrobi wszystko za Ciebie!

---

## 📦 Krok po kroku (ręcznie)

### 1. Commit i Push

```powershell
git add .
git commit -m "Your message"
git push origin master
```

### 2. Migracja Analytics (TYLKO RAZ!)

```powershell
# Ustaw DATABASE_URL
$env:DATABASE_URL="postgresql://user:pass@dpg-xxx.oregon-postgres.render.com/automentor"

# Uruchom migrację
npm run migrate:analytics
```

### 3. Weryfikacja

Otwórz: https://cipka.onrender.com/admin

---

## 🗄️ Komendy bazy danych

```powershell
# Stwórz wszystkie tabele (pierwsza instalacja)
npm run db:push

# Migracja analytics (po deploymencie)
npm run migrate:analytics

# Test połączenia z bazą
npm run db:test
```

---

## 🔍 Sprawdzanie i monitoring

```powershell
# Sprawdź status git
git status

# Zobacz ostatnie commity
git log --oneline -5

# Sprawdź czy wszystko się kompiluje
npm run check

# Zbuduj projekt lokalnie (test)
npm run build
```

---

## 🌐 Linki Render

- **Dashboard:** https://dashboard.render.com
- **Twoja aplikacja:** https://cipka.onrender.com
- **Admin panel:** https://cipka.onrender.com/admin
- **Logi:** Dashboard → cipka → Logs
- **Environment:** Dashboard → cipka → Environment
- **Database:** Dashboard → PostgreSQL Instance

---

## 🔐 Zmienne środowiskowe na Render

Sprawdź czy masz ustawione:

| Zmienna | Opis | Wymagana |
|---------|------|----------|
| `DATABASE_URL` | PostgreSQL URL | ✅ Auto |
| `SESSION_SECRET` | Secret key dla sesji | ✅ Tak |
| `NODE_ENV` | `production` | ✅ Tak |
| `ADMIN_EMAIL` | Email admina | ⚠️ Opcja |
| `ADMIN_PASSWORD` | Hasło admina | ⚠️ Opcja |

Ustawienie w Render:
1. Dashboard → cipka → Environment
2. Add Environment Variable
3. Kliknij "Save Changes"

---

## 🐛 Debug commands

```powershell
# Zobacz błędy kompilacji
npm run check

# Testuj lokalnie przed deploymentem
npm run dev

# Zobacz logi PM2 (jeśli używasz)
npm run logs

# Restart serwera (produkcja)
npm run restart
```

---

## 📊 SQL queries (debugging)

Połącz się z bazą przez Render Dashboard, potem:

```sql
-- Sprawdź czy tabela istnieje
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'analytics_events';

-- Sprawdź kolumny
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'analytics_events';

-- Sprawdź czy są dane
SELECT COUNT(*) FROM analytics_events;

-- Ostatnie 10 wizyt
SELECT 
  page_url,
  country,
  city,
  device_type,
  browser,
  created_at
FROM analytics_events
WHERE event_type = 'page_view'
ORDER BY created_at DESC
LIMIT 10;

-- Statystyki według kraju
SELECT 
  country,
  COUNT(DISTINCT ip_address) as visitors,
  COUNT(*) as page_views
FROM analytics_events
WHERE event_type = 'page_view'
GROUP BY country
ORDER BY visitors DESC;
```

---

## 🎨 Favicon commands

Nie ma specjalnych komend - wszystko przez UI:
1. Admin → Konfiguracja
2. Website Favicon → Upload
3. Auto-save!

Sprawdź czy działa:
```powershell
# Otwórz w przeglądarce
https://cipka.onrender.com/favicon.ico

# Powinno pokazać twój favicon
```

---

## 📦 Backup i restore

```powershell
# Backup bazy (jeśli masz skrypt)
npm run backup

# Render robi automatyczne backupy każdego dnia
# Przywracanie: Dashboard → Database → Backups
```

---

## 🚨 Emergency commands

### Coś się zepsuło - rollback!

```powershell
# Zobacz ostatnie commity
git log --oneline -10

# Rollback do poprzedniego commita
git reset --hard HEAD~1
git push -f origin master

# UWAGA: To nadpisuje historię! Używaj ostrożnie!
```

### Restart aplikacji na Render

1. Dashboard → cipka → Manual Deploy → Clear build cache & deploy
2. Lub: Settings → Restart Service

### Wyczyść bazę analytics (nuclear option!)

```sql
-- OSTROŻNIE! To usunie wszystkie dane!
TRUNCATE TABLE analytics_events;
```

---

## 📚 Więcej informacji

- **QUICK_START_RENDER.md** - szybki start
- **RENDER_DEPLOYMENT.md** - szczegółowa instrukcja
- **ANALYTICS_AND_FAVICON_GUIDE.md** - jak używać funkcji
- **CHANGES_SUMMARY.md** - co się zmieniło

---

## ✅ Checklist przed każdym deploymentem

- [ ] Kod działa lokalnie (`npm run dev`)
- [ ] Brak błędów kompilacji (`npm run check`)
- [ ] Zmiany commitowane do git
- [ ] .env NIE jest w repo (sprawdź .gitignore)
- [ ] DATABASE_URL NIE jest w kodzie
- [ ] Build przechodzi (`npm run build`)
- [ ] Push do GitHub
- [ ] Migracja uruchomiona (jeśli trzeba)
- [ ] Render zbudował bez błędów
- [ ] Strona działa po deploymencie
- [ ] Admin panel dostępny
- [ ] Nowe funkcje działają

---

**Powodzenia! 🚀**

Jeśli masz problemy:
1. Sprawdź logi Render
2. Sprawdź ten cheat sheet
3. Przeczytaj RENDER_DEPLOYMENT.md
