# 🧹 CZYSZCZENIE BAZY DANYCH NA RENDER

## 🚨 UWAGA: Ten skrypt działa TYLKO na Render (PostgreSQL)

### 📋 Co zostanie usunięte:
- ❌ Duplikatowi adminowie (`pizda2`, `wiktoriatopajew`) 
- ❌ Wszyscy testowi użytkownicy (30 → 1)
- ❌ Wszystkie powiązane sesje, wiadomości, czaty
- ✅ **Zostanie tylko**: `admin@wp.pl`

### 🔧 Jak uruchomić na Render:

#### **Opcja 1: Przez Render Console**
1. Idź do Render Dashboard
2. Wybierz swój service 
3. Kliknij "Shell" 
4. Uruchom:
```bash
node clean-render-database.cjs
```

#### **Opcja 2: Przez deploy trigger**
Dodaj do `package.json` script i deploy:
```json
{
  "scripts": {
    "clean-db": "node clean-render-database.cjs"
  }
}
```

Potem na Render Console:
```bash
npm run clean-db
```

### 🛡️ Bezpieczeństwo:
- ✅ Sprawdza czy działa na Render (wymaga DATABASE_URL)
- ✅ Znajduje i chroni główne konto admin@wp.pl
- ✅ Usuwa powiązania przed użytkownikami (FK safe)
- ✅ Pokazuje dokładnie co zostało usunięte

### 📊 Spodziewane rezultaty:
```
Przed: 30 użytkowników (3 adminów)
Po:    1 użytkownik (1 admin - admin@wp.pl)
```

### ⚡ Uruchom teraz:
**Render Console → Shell:**
```bash
node clean-render-database.cjs
```