# AutoMentor - Przewodnik Instalacji

## 🚀 Szybka Instalacja

### Opcja 1: PowerShell (Rekomendowane)
```powershell
# Uruchom PowerShell jako administrator (opcjonalnie)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\install.ps1
```

### Opcja 2: Batch (Prostsze)
```cmd
install.bat
```

### Opcja 3: Manualna Instalacja
```bash
# Zainstaluj zależności Node.js
npm install

# Zainstaluj zależności Python (opcjonalne)
pip install -r requirements.txt

# Skopiuj szablon konfiguracji
copy env-template.txt .env

# Skonfiguruj plik .env
# Uruchom migracje bazy danych
npm run db:migrate
```

## 📋 Wymagania Systemowe

### Wymagane:
- **Node.js** (v18 lub nowszy) - [Pobierz tutaj](https://nodejs.org/)
- **npm** (instalowany z Node.js)

### Opcjonalne:
- **Python** (v3.8 lub nowszy) - [Pobierz tutaj](https://www.python.org/downloads/)
- **pip** (instalowany z Python)

## 🔧 Konfiguracja

### 1. Plik .env
Po instalacji skonfiguruj plik `.env`:

```env
# Baza danych
DATABASE_URL="./database.sqlite"

# Sesje
SESSION_SECRET="your-secret-key-here"

# Email (opcjonalne)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# PayPal (opcjonalne)
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"

# OpenAI (opcjonalne)
OPENAI_API_KEY="your-openai-api-key"
```

### 2. Baza danych
```bash
# Uruchom migracje
npm run db:migrate

# Lub wypchnij schemat
npm run db:push
```

## 🏃‍♂️ Uruchamianie

### Tryb deweloperski:
```bash
npm run dev
```

### Tryb produkcyjny:
```bash
npm run build
npm run start
```

### Z PM2:
```bash
npm run start:prod
```

## 📝 Dostępne Komendy

| Komenda | Opis |
|---------|------|
| `npm run dev` | Uruchom w trybie deweloperskim |
| `npm run build` | Zbuduj aplikację do produkcji |
| `npm run start` | Uruchom w trybie produkcyjnym |
| `npm run start:prod` | Uruchom z PM2 |
| `npm run db:migrate` | Uruchom migracje bazy danych |
| `npm run db:push` | Wypchnij schemat do bazy |
| `npm run db:seed` | Załaduj dane testowe |
| `npm run test:email` | Przetestuj konfigurację email |
| `npm run backup` | Utwórz kopię zapasową |

## ❗ Troubleshooting

### Problem z PowerShell ExecutionPolicy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problem z instalacją npm
```bash
# Wyczyść cache npm
npm cache clean --force

# Usuń node_modules i zainstaluj ponownie
rmdir /s node_modules
npm install
```

### Problem z Python
```bash
# Sprawdź wersję Python
python --version

# Zainstaluj pip (jeśli brak)
python -m ensurepip --upgrade

# Zainstaluj zależności z konkretną wersją
python -m pip install -r requirements.txt
```

### Problem z bazą danych
```bash
# Usuń bazę i stwórz nową
del database.sqlite
npm run db:migrate
```

## 🔗 Przydatne Linki

- [Node.js Download](https://nodejs.org/)
- [Python Download](https://www.python.org/downloads/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Git for Windows](https://git-scm.com/download/win)

## 📞 Wsparcie

Jeśli napotkasz problemy:
1. Sprawdź czy wszystkie wymagania są spełnione
2. Uruchom skrypt instalacyjny ponownie
3. Sprawdź logi błędów w konsoli
4. Skontaktuj się z zespołem wsparcia