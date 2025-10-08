# 🚀 Deploy AutoMentor do Render.com

## Krok 1: Przygotowanie kodu
✅ Aplikacja jest już gotowa do wdrożenia!

## Krok 2: Utwórz konto na Render.com
1. Idź na https://render.com
2. Zarejestruj się (możesz użyć GitHub)

## Krok 3: Utwórz repozytorium na GitHub
1. Utwórz nowe repozytorium na GitHub
2. Wgraj cały kod aplikacji

## Krok 4: Deploy na Render

### A) Utwórz PostgreSQL Database
1. Na Render dashboard, kliknij "New +"
2. Wybierz "PostgreSQL"
3. Nazwa: `automentor-db`
4. Plan: Free
5. Kliknij "Create Database"
6. **SKOPIUJ CONNECTION STRING** (będzie potrzebny)

### B) Utwórz Web Service
1. Kliknij "New +" → "Web Service"
2. Połącz GitHub i wybierz swoje repo
3. Konfiguracja:
   - **Name**: `automentor`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

### C) Ustaw Environment Variables
W sekcji "Environment":

**WYMAGANE:**
```
NODE_ENV=production
PORT=10000
DATABASE_URL=[wklej connection string z PostgreSQL]
SESSION_SECRET=super-secret-session-key-123456789
```

**OPCJONALNE (ale zalecane):**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### D) Deploy
1. Kliknij "Create Web Service"
2. Poczekaj na build (3-5 minut)
3. Aplikacja będzie dostępna na: `https://automentor.onrender.com`

## Krok 5: Testowanie
- Health check: `https://automentor.onrender.com/api/health`
- Admin panel: `https://automentor.onrender.com/admin`
- Główna strona: `https://automentor.onrender.com`

## ⚡ Zalety Render vs Vercel
- ✅ Pełna obsługa bazy danych PostgreSQL
- ✅ Trwałe sesje użytkowników
- ✅ Upload plików
- ✅ Długotrwałe requesty (chat)
- ✅ Prawdziwy full-stack hosting

## 🎯 Gotowe!
Twoja aplikacja AutoMentor działa teraz na Render z pełną funkcjonalnością!