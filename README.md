## Railway Frontend Deploy (Vite/React)

Aby uruchomić frontend na Railway jako statyczny serwis:

1. Wejdź do folderu `client/` i zainstaluj zależności:
   ```powershell
   cd client
   npm install
   npm run build
   ```
2. Railway automatycznie wykryje plik `railway.toml` i zbuduje frontend.
3. Pliki z folderu `dist/` będą serwowane jako statyczny hosting.

## Railway Backend Deploy (Node.js)

1. W katalogu głównym uruchom:
   ```powershell
   npm install
   npm run build
   npm start
   ```
2. Railway uruchomi backend jako osobny serwis.

## Railway backend deploy (Node.js/Express)

1. Upewnij się, że masz w Railway zmienną środowiskową:
   - `SESSION_SECRET` (np. losowe hasło)
2. Railway automatycznie wykona:
   ```
   npm install && npm run build
   npm start
   ```
3. Jeśli chcesz podłączyć bazę PostgreSQL, dodaj zmienną `DATABASE_URL`.

## Railway frontend deploy (Vite/React)

1. W folderze `client/` Railway wykona:
   ```
   npm install && npm run build
   ```
2. Pliki z `client/dist/` będą serwowane jako statyczny hosting.

---

Możesz mieć dwa serwisy na Railway:
- Backend (Node.js/Express)
- Frontend (Vite/React, statyczny hosting)

W razie problemów wrzuć logi z Railway (Build/Deploy), a pomogę rozwiązać!
