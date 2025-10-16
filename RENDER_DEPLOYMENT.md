# 🚀 Deployment na Render - Statystyki i Favicon

## Kroki deployment

### 1️⃣ Przygotowanie lokalne

```powershell
# Upewnij się że wszystko działa lokalnie
npm install
npm run build
```

### 2️⃣ Push do GitHub

```powershell
git add .
git commit -m "Add page view analytics and favicon upload"
git push origin master
```

### 3️⃣ Deploy na Render

Render automatycznie zbuduje i wdroży zmiany z GitHub.

### 4️⃣ Uruchom migrację bazy danych

**Opcja A: Z lokalnego komputera (ZALECANE)**

```powershell
# 1. Pobierz DATABASE_URL z Render Dashboard
# Dashboard → Your Service → Environment → DATABASE_URL (skopiuj wartość)

# 2. Ustaw zmienną środowiskową (TYMCZASOWO dla migracji)
$env:DATABASE_URL="postgresql://user:password@host/database"

# 3. Uruchom migrację
node migrate-analytics-render.mjs
```

**Opcja B: Przez Render Shell**

```bash
# 1. W Render Dashboard → Your Service → Shell
# 2. Uruchom w shellu:
node migrate-analytics-render.mjs
```

**Opcja C: Przez SQL bezpośrednio**

```bash
# 1. Połącz się z bazą przez Render Dashboard
# 2. Wklej zawartość pliku: migrations/add-analytics-columns.sql
```

### 5️⃣ Weryfikacja

1. Otwórz: `https://twoja-domena.onrender.com/admin`
2. Zaloguj się jako admin
3. Sprawdź zakładkę **"Statystyki Odwiedzin"**
4. Odwiedź kilka stron na froncie
5. Odśwież panel - powinny pojawić się dane!

### 6️⃣ Test Favicon

1. Admin panel → Konfiguracja
2. Sekcja "Website Favicon"
3. Upload favicon
4. Sprawdź czy zmienił się w zakładce przeglądarki
5. Hard refresh (Ctrl+F5) jeśli potrzeba

## 🔐 Bezpieczeństwo DATABASE_URL

**WAŻNE:** NIE commituj DATABASE_URL do repo!

```powershell
# ❌ NIE RÓB TEGO:
git add .env
git commit -m "with database url"  # NIGDY!

# ✅ Zawsze sprawdź .gitignore:
# .env powinno być w .gitignore
```

DATABASE_URL znajdziesz w:
- Render Dashboard → Your Service → Environment Variables

## 📊 Monitoring na Render

### Sprawdzanie logów:

```
Render Dashboard → Your Service → Logs
```

Szukaj w logach:
- `✅ Page view tracked` - potwierdzenie trackingu
- `Geolocation lookup failed` - OK, lokalizacja będzie "Unknown"
- `Failed to track page view` - sprawdź błędy

### Testowanie API:

```bash
# Test czy endpoint działa
curl https://twoja-domena.onrender.com/api/analytics/pageview \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"pageUrl":"https://test.com","referrer":"","userAgent":"Test"}'

# Powinno zwrócić: {"success":true}
```

## 🐛 Troubleshooting

### Problem: "analytics_events table does not exist"

**Rozwiązanie:**
```powershell
# Najpierw stwórz wszystkie tabele:
npm run db:push

# Potem migracja analytics:
node migrate-analytics-render.mjs
```

### Problem: "Connection timeout"

**Rozwiązanie:**
- Sprawdź czy DATABASE_URL jest poprawny
- Sprawdź czy baza jest aktywna w Render
- Spróbuj ponownie za chwilę

### Problem: "Favicon nie zmienia się"

**Rozwiązanie:**
1. Wyczyść cache przeglądarki (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Sprawdź w Render logs czy upload się powiódł
4. Sprawdź czy `uploads/favicons/` jest zapisywany (może potrzebować persistent disk)

### Problem: "Brak statystyk w panelu"

**Rozwiązanie:**
1. Sprawdź logi Render czy tracking działa
2. Otwórz DevTools (F12) → Network → sprawdź requesty do `/api/analytics/pageview`
3. Sprawdź czy tabela analytics_events ma dane:
```sql
SELECT COUNT(*) FROM analytics_events WHERE event_type = 'page_view';
```

### Problem: "Geolocation nie działa"

**To normalne!** 
- API ipapi.co ma limit 1000/dzień
- Dla localhost IP (w dev) lokalizacja zawsze "Unknown"
- Tracking działa nawet bez geolokalizacji

## 📦 Co się dzieje po deployment

1. **Render automatycznie:**
   - Pobiera kod z GitHub
   - Uruchamia `npm install`
   - Uruchamia `npm run build`
   - Startuje serwer

2. **Musisz ręcznie:**
   - Uruchomić migrację bazy (jednorazowo)
   - Sprawdzić czy wszystko działa

3. **Tracking automatycznie:**
   - Zaczyna zbierać dane od pierwszej wizyty
   - Zapisuje do bazy analytics_events
   - Wyświetla w panelu admina

## 🎯 Checklist deployment

- [ ] Kod zpushowany do GitHub
- [ ] Render zbudował i wdrożył nową wersję
- [ ] Migracja bazy danych uruchomiona
- [ ] Zakładka "Statystyki Odwiedzin" widoczna w adminie
- [ ] Test: odwiedź kilka stron, sprawdź czy tracking działa
- [ ] Test: upload favicon, sprawdź czy się zmienił
- [ ] Logi Render bez błędów
- [ ] All good! 🎉

## 📝 Zmienne środowiskowe na Render

Upewnij się że masz ustawione:

```
DATABASE_URL=postgresql://...  (auto-set by Render)
SESSION_SECRET=your-secret-key
NODE_ENV=production
ADMIN_EMAIL=your@email.com (opcjonalne)
ADMIN_PASSWORD=your-password (opcjonalne)
```

## 🚨 WAŻNE dla Favicon na Render

Render ma **ephemeral filesystem**, czyli:
- Pliki uploadowane do `uploads/` mogą zniknąć przy restart
- **Rozwiązanie:** Użyj Render Disk (persistent storage)

### Dodanie Persistent Disk:

1. Render Dashboard → Your Service → Disks
2. Add Disk → Mount Path: `/app/uploads`
3. Redeploy service

Lub użyj S3/Cloudinary dla plików.

## 📞 Potrzebujesz pomocy?

1. Sprawdź logi: Render Dashboard → Logs
2. Sprawdź bazę: Render Dashboard → Database → Connect
3. Sprawdź ten plik: `ANALYTICS_AND_FAVICON_GUIDE.md`

---

**Powodzenia z deploymentem! 🚀**
