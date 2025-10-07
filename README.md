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

---

Możesz mieć dwa serwisy na Railway:
- Backend (Node.js/Express)
- Frontend (Vite/React, statyczny hosting)

W razie problemów wrzuć logi — pomogę rozwiązać!
