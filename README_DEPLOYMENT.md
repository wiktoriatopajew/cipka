# 🚀 AutoMentor - PythonAnywhere Deployment Package

## 📋 Co zawiera ten pakiet

### 📁 Pliki wdrożenia
- `DEPLOYMENT_GUIDE.md` - Kompletny przewodnik wdrożenia
- `deploy-pythonanywhere.sh` - Skrypt automatycznego wdrożenia
- `create-admin.cjs` - Tworzenie konta administratora
- `wsgi_config.py` - Konfiguracja WSGI dla PythonAnywhere
- `env-template.txt` - Szablon zmiennych środowiskowych
- `backup.sh` - Skrypt backupu bazy danych

### 🏗️ Struktura aplikacji
```
AutoMentor/
├── client/                    # Frontend React (Typescript)
│   ├── src/components/        # Komponenty React
│   ├── src/pages/            # Strony aplikacji
│   └── dist/                 # Zbudowana aplikacja
├── server/                   # Backend Express.js
│   ├── index.ts             # Główny plik serwera
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # Warstwa dostępu do danych
│   └── db.ts               # Konfiguracja bazy danych
├── shared/                  # Współdzielone schematy
├── migrations/             # Migracje bazy danych
└── database.sqlite        # Baza danych SQLite
```

## 🎯 Funkcjonalności

### 📊 Dashboard Analityczny
- **Wykresy w czasie rzeczywistym** - użytkownicy aktywni, konwersje, przychody
- **Metryki biznesowe** - KPI, ROI, customer lifetime value
- **Raporty finansowe** - przychody w USD, eksport CSV/Excel
- **Analityka behawioralna** - ścieżki użytkowników, bounce rate

### 🖊️ System CMS
- **Zarządzanie stronami** - edycja bez kodu, SEO, wersjonowanie
- **FAQ dynamiczne** - kategorie, głosowanie, statystyki
- **Testimoniale** - system zatwierdzania, moderacja
- **Biblioteka mediów** - upload, optymalizacja obrazów

### 👥 Panel Administracyjny  
- **Zarządzanie użytkownikami** - subskrypcje, blokowanie, statystyki
- **Moderacja czatów** - podgląd, archiwizacja, eksport
- **Konfiguracja Google Ads** - tracking, konwersje, ROI
- **Ustawienia aplikacji** - SMTP, płatności, bezpieczeństwo

### 💬 System czatów
- **Czat w czasie rzeczywistym** - WebSocket, typing indicators
- **Mechanicy zweryfikowani** - system ocen, dostępność
- **Upload plików** - zdjęcia, dokumenty, kompresja
- **Historia rozmów** - archiwizacja, wyszukiwanie

### 💳 Integracje płatnicze
- **Stripe** - subskrypcje, jednorazowe płatności
- **PayPal** - alternatywna metoda płatności
- **Webhook handling** - automatyczne aktywacje
- **Faktury** - generowanie PDF, wysyłka email

## 🚀 Szybkie wdrożenie

### 1. Przygotowanie
```bash
# Spakuj wszystkie pliki do archiwum
zip -r automentor.zip AutoMentor/

# Lub użyj git
git clone https://github.com/twoje-repo/AutoMentor.git
```

### 2. Upload na PythonAnywhere
```bash
# W konsoli PythonAnywhere
cd ~
unzip automentor.zip
cd AutoMentor
```

### 3. Automatyczne wdrożenie
```bash
# Uruchom skrypt wdrożenia
chmod +x deploy-pythonanywhere.sh
./deploy-pythonanywhere.sh
```

### 4. Konfiguracja Web App
1. **Web tab → Add a new web app**
2. **Manual configuration → Python 3.10**
3. **Source code:** `/home/twoja-nazwa/AutoMentor`
4. **Zastąp WSGI file** zawartością z `wsgi_config.py`
5. **Static files:** URL=`/static/`, Directory=`/home/twoja-nazwa/AutoMentor/client/dist`

### 5. Zmienne środowiskowe
```bash
# Skopiuj szablon
cp env-template.txt .env

# Edytuj wartości produkcyjne
nano .env
```

## 🔧 Konfiguracja produkcyjna

### 📧 Email (Gmail)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=twoj-email@gmail.com
SMTP_PASS=twoje-haslo-aplikacji  # Nie zwykłe hasło!
```

### 💳 Stripe
```env
STRIPE_SECRET_KEY=sk_live_...    # Klucz produkcyjny
STRIPE_WEBHOOK_SECRET=whsec_...  # Endpoint webhook
```

### 🔐 Bezpieczeństwo
```env
JWT_SECRET=super-bezpieczny-klucz-256-bit
SESSION_SECRET=inny-bezpieczny-klucz
ALLOWED_ORIGINS=https://twoja-domena.pythonanywhere.com
```

## 👤 Dostęp administratora

### Pierwsze logowanie
```
URL: https://twoja-domena.pythonanywhere.com
Username: admin
Password: AutoMentor2024!
```

⚠️ **WAŻNE:** Zmień hasło po pierwszym logowaniu!

### Panel admina
- **Dashboard** - statystyki, przegląd
- **Users** - zarządzanie użytkownikami  
- **Chats** - moderacja rozmów
- **Analytics** - biznesowa analityka
- **CMS** - zarządzanie treścią
- **Subscriptions** - płatności i subskrypcje
- **Google Ads** - konfiguracja trackingu

## 📊 Monitoring i utrzymanie

### Logi aplikacji
```bash
# Podgląd logów
tail -f logs/app.log

# Logi błędów
tail -f logs/error.log
```

### Backup bazy danych
```bash
# Ręczny backup
./backup.sh

# Automatyczny backup (cron)
0 2 * * * /home/twoja-nazwa/AutoMentor/backup.sh
```

### Health check
```
GET /health
Response: {"status":"healthy","uptime":12345,"timestamp":"2024-..."}
```

## 🔍 Rozwiązywanie problemów

### Częste problemy
1. **Błąd 500** - sprawdź logi w `/var/log/twoja-nazwa.pythonanywhere.com.error.log`
2. **Brak CSS/JS** - sprawdź ścieżki static files
3. **Błędy bazy danych** - uruchom ponownie migracje
4. **Błędy email** - sprawdź hasło aplikacji Gmail

### Debugowanie
```bash
# Test połączenia z bazą
node -e "const db = require('./server/db'); console.log('DB OK');"

# Test buildu
npm run build

# Test serwera
npm run start
```

## 📞 Wsparcie

### Przydatne linki
- [PythonAnywhere Help](https://help.pythonanywhere.com/)
- [Node.js na PythonAnywhere](https://help.pythonanywhere.com/pages/Node/)
- [Stripe Documentation](https://stripe.com/docs)
- [React Documentation](https://react.dev/)

### Kontakt
W przypadku problemów z wdrożeniem, sprawdź:
1. Logi błędów w panelu PythonAnywhere
2. Console developera w przeglądarce
3. Status wszystkich serwisów zewnętrznych

---

**AutoMentor v2.0** - Profesjonalna platforma łącząca kierowców z mechanikami
🚗 Szybko | 👨‍🔧 Profesjonalnie | 💯 Niezawodnie