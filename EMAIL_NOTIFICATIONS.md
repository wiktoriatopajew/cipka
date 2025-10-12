# 📧 Konfiguracja Powiadomień Email

## ✅ Skonfigurowano dla wiktoriatopajew@gmail.com

### 🔧 Ustawienia Gmail SMTP
- **Email**: wiktoriatopajew@gmail.com
- **App Password**: tjcnwadgvaiolgdo
- **SMTP Host**: smtp.gmail.com
- **SMTP Port**: 587

### 📬 Typy powiadomień

#### 1. **Powiadomienie o logowaniu użytkownika** (do admina)
- Wysyłane: Po każdym logowaniu użytkownika  
- Docelowy: wiktoriatopajew@gmail.com
- Zawiera: Username, email, czas logowania
- Subject: `✅ New User Login - [username]`

#### 2. **Powiadomienie o pierwszej wiadomości na czacie** (do admina)
- Wysyłane: Gdy użytkownik wysyła pierwszą wiadomość w sesji
- Docelowy: wiktoriatopajew@gmail.com
- Zawiera: Username, email, treść wiadomości, session ID
- Subject: `AutoMentor Chat - Session: [sessionId]`

#### 3. **Powiadomienie o aktywności na czacie** (do admina)
- Wysyłane: Co 15 minut podczas aktywnej konwersacji
- Docelowy: wiktoriatopajew@gmail.com
- Zawiera: Podsumowanie aktywności, czas trwania sesji

#### 4. **🆕 Powiadomienie o odpowiedzi admina** (do użytkownika)
- Wysyłane: Gdy admin odpowie na wiadomość użytkownika
- Docelowy: Email użytkownika (podany przy rejestracji)
- Zawiera: Treść odpowiedzi, link do kontynuacji rozmowy
- Subject: `✉️ Chat With Mechanic - You have a reply from our expert`
- **Language**: English (international users)
- **Branding**: Chat With Mechanic
- **Anti-spam**: Max 1 email na 15 minut na użytkownika

### 🚀 Konfiguracja Render

#### Zmienne środowiskowe w render.yaml:
```yaml
- key: SMTP_HOST
  value: smtp.gmail.com
- key: SMTP_PORT
  value: 587  
- key: SMTP_USER
  value: wiktoriatopajew@gmail.com
- key: SMTP_PASS
  value: tjcnwadgvaiolgdo
```

### 🧪 Testowanie

#### Lokalnie:
```bash
node test-email.mjs
```

#### Produkcja:
Po wdrożeniu na Render, powiadomienia będą automatycznie wysyłane gdy:
- Nowy użytkownik się zaloguje
- Użytkownik wyśle pierwszą wiadomość na czacie

### 🔍 Monitoring

#### Logi email (w konsoli serwera):
```
✅ Login notification sent for user: [username]
✅ First message notification sent  
❌ Failed to send email: [error details]
```

#### Gmail (odbiorca):
- Sprawdź skrzynkę odbiorczą: wiktoriatopajew@gmail.com
- Sprawdź folder spam/promotional w razie problemów

### 🛡️ Bezpieczeństwo

#### App Password Gmail:
- **tjcnwadgvaiolgdo** - dedykowany dla AutoMentor
- Można odwołać w Google Account Security
- Nie wymaga 2FA przy każdym użyciu

#### Weryfikacja:
```javascript
// Email transporter weryfikuje połączenie przy starcie
transporter.verify((error, success) => {
  if (error) console.log('Email config error:', error);
  else console.log('Email server ready');
});
```

### 🎯 Rezultat

Po wdrożeniu na Render otrzymasz email za każdym razem gdy:
1. ✅ Nowy użytkownik się zarejestruje/zaloguje (→ do Ciebie)
2. ✅ Użytkownik wyśle pierwszą wiadomość na czacie (→ do Ciebie)  
3. ✅ Użytkownik kontynuuje długą konwersację (→ do Ciebie, co 15 min)
4. 🆕 **Ty odpowiesz z panelu admina (→ do użytkownika na jego email)**

### 🔄 **Przepływ komunikacji (NOWE!)**

#### Admin → Użytkownik
1. **Użytkownik** wysyła wiadomość → **Email do Ciebie** ✉️
2. **Ty** odpowiadasz przez panel → **Email do użytkownika** ✉️
3. **Użytkownik** klika link w emailu → Wraca na czat
4. Konwersacja kontynuowana w czasie rzeczywistym

#### Inteligentny anty-spam
- **Użytkownik**: Max 1 powiadomienie na 15 minut (nie spam)
- **Ty**: Wszystkie powiadomienia (musisz wiedzieć o aktywności)

**Dwukierunkowa komunikacja email ↔ czat gotowa!** 📫