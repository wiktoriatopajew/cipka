# 🚀 Railway Quick Deploy

## Najszybszy sposób na deploy ($5/miesiąc)

### 1. Zainstaluj Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Zaloguj się
```bash
railway login
```

### 3. Deploy jedną komendą!
```bash
npm run railway:deploy
```

### 4. Skonfiguruj zmienne środowiskowe

W Railway Dashboard dodaj:
```env
NODE_ENV=production
SESSION_SECRET=your-super-secret-key-here
STRIPE_SECRET_KEY=sk_live_... (opcjonalne)
EMAIL_USER=your-email@gmail.com (opcjonalne)
EMAIL_PASS=your-password (opcjonalne)
```

### 5. Gotowe! 🎉

Railway automatycznie:
- ✅ Stworzy PostgreSQL bazę danych
- ✅ Ustawi DATABASE_URL
- ✅ Zbuduje i uruchomi aplikację
- ✅ Przydzieli domain (np. `automentor-production.up.railway.app`)

## 🔗 Przydatne komendy

```bash
railway status     # Status deploymentu
railway logs       # Logi aplikacji
railway open       # Otwórz aplikację w przeglądarce
railway connect    # Połącz z bazą danych
```

## 💡 Automatyczny Deploy z GitHub

1. Połącz Railway z GitHub
2. Każdy `git push` = automatyczny deploy
3. Zero downtime deployment

## 💰 Koszt: $5/miesiąc za wszystko

- Web hosting + PostgreSQL
- Unlimited deploys
- Custom domain + SSL
- Monitoring & backup