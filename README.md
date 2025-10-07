# AutoMentor - Automatyczny deploy na Railway## Railway Frontend Deploy (Vite/React)



## 🚀 Deploy na Railway (bez bazy danych)Aby uruchomić frontend na Railway jako statyczny serwis:



1. **Fork/Clone repo na GitHub**1. Wejdź do folderu `client/` i zainstaluj zależności:

   - Skopiuj ten projekt na swoje GitHub konto   ```powershell

   cd client

2. **Utwórz projekt na Railway**   npm install

   - Wejdź na https://railway.app   npm run build

   - Kliknij "New Project" → "Deploy from GitHub"   ```

   - Wybierz to repozytorium2. Railway automatycznie wykryje plik `railway.toml` i zbuduje frontend.

3. Pliki z folderu `dist/` będą serwowane jako statyczny hosting.

3. **Ustaw zmienną środowiskową** (wymagane)

   - W panelu Railway → Variables → dodaj:## Railway Backend Deploy (Node.js)

   ```

   SESSION_SECRET=twoje-losowe-haslo-1231. W katalogu głównym uruchom:

   ```   ```powershell

   npm install

4. **Podłącz istniejącą bazę danych** (opcjonalne)   npm run build

   - Jeśli masz już bazę PostgreSQL na Railway, dodaj:   npm start

   ```   ```

   DATABASE_URL=postgresql://user:pass@host:port/db2. Railway uruchomi backend jako osobny serwis.

   ```

## Railway backend deploy (Node.js/Express)

5. **Deploy**

   - Railway automatycznie:1. Upewnij się, że masz w Railway zmienną środowiskową:

     - Zbuduje frontend (React/Vite)   - `SESSION_SECRET` (np. losowe hasło)

     - Zbuduje backend (Node.js/Express)2. Railway automatycznie wykona:

     - Uruchomi oba w jednym serwisie   ```

     - Frontend będzie dostępny pod głównym URL   npm install && npm run build

   npm start

## Jak to działa   ```

3. Jeśli chcesz podłączyć bazę PostgreSQL, dodaj zmienną `DATABASE_URL`.

- Railway buduje frontend w `client/dist/`

- Backend serwuje frontend jako statyczne pliki## Railway frontend deploy (Vite/React)

- API dostępne pod `/api/*`

- Frontend dostępny pod głównym URL1. W folderze `client/` Railway wykona:

   ```

## Lokalne uruchomienie   npm install && npm run build

   ```

```bash2. Pliki z `client/dist/` będą serwowane jako statyczny hosting.

# Zainstaluj zależności

npm install---

cd client && npm install && cd ..

Możesz mieć dwa serwisy na Railway:

# Zbuduj frontend- Backend (Node.js/Express)

cd client && npm run build && cd ..- Frontend (Vite/React, statyczny hosting)



# Zbuduj backendW razie problemów wrzuć logi z Railway (Build/Deploy), a pomogę rozwiązać!

npm run build

# Uruchom
npm start
```

Aplikacja będzie dostępna pod http://localhost:5000

---

Żadnych migracji, żadnej konfiguracji bazy danych - wszystko działa od razu! 🎉