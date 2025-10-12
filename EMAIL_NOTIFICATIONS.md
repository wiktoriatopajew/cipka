# 📧 Konfiguracja Powiadomień Email

## ✅ Skonfigurowano dla wiktoriatopajew@gmail.com

### 🔧 Ustawienia Gmail SMTP
- **Email**: wiktoriatopajew@gmail.com
- **App Password**: tjcnwadgvaiolgdo
- **SMTP Host**: smtp.gmail.com
- **SMTP Port**: 587

### 📬 Typy powiadomień

#### 1. **Powiadomienie o logowaniu użytkownika**
- Wysyłane: Po każdym logowaniu użytkownika
- Zawiera: Username, email, czas logowania
- Subject: `✅ New User Login - [username]`

#### 2. **Powiadomienie o pierwszej wiadomości na czacie**
- Wysyłane: Gdy użytkownik wysyła pierwszą wiadomość w sesji
- Zawiera: Username, email, treść wiadomości, session ID
- Subject: `AutoMentor Chat - Session: [sessionId]`

#### 3. **Powiadomienie o aktywności na czacie**
- Wysyłane: Co 15 minut podczas aktywnej konwersacji
- Zawiera: Podsumowanie aktywności, czas trwania sesji

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
1. ✅ Nowy użytkownik się zarejestruje/zaloguje
2. ✅ Użytkownik wyśle pierwszą wiadomość na czacie
3. ✅ Użytkownik kontynuuje długą konwersację (co 15 min)

**Wszystko automatycznie trafia na wiktoriatopajew@gmail.com** 📫