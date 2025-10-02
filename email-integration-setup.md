# Email-to-Chat Integration Setup

## Konfiguracja automatycznego przekazywania odpowiedzi email do chatu

### Metoda 1: Google Apps Script (Zalecana)

1. **Przejdź do Google Apps Script**
   - Otwórz https://script.google.com
   - Kliknij "Nowy projekt"

2. **Wklej kod skryptu:**

```javascript
function processEmailReplies() {
  // Szukaj emaili z etykietą "AutoMentor" w ostatnich 5 minutach
  const threads = GmailApp.search('label:AutoMentor newer_than:5m');
  
  threads.forEach(thread => {
    const messages = thread.getMessages();
    const lastMessage = messages[messages.length - 1];
    
    // Sprawdź czy to nie jest email wysłany przez system
    if (lastMessage.getFrom().includes('wiktoriatopajew@gmail.com')) {
      return; // Pomiń nasze własne emaile
    }
    
    // Wyciągnij sessionId z tematu emaila
    const subject = lastMessage.getSubject();
    const sessionIdMatch = subject.match(/Session: ([a-f0-9-]+)/);
    
    if (!sessionIdMatch) {
      console.log('Nie znaleziono sessionId w temacie:', subject);
      return;
    }
    
    const sessionId = sessionIdMatch[1];
    const emailContent = lastMessage.getPlainBody();
    
    // Wyślij do webhook
    const webhookUrl = 'http://localhost:3015/api/email-reply';
    
    try {
      const response = UrlFetchApp.fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({
          sessionId: sessionId,
          content: emailContent
        })
      });
      
      console.log('Webhook response:', response.getContentText());
      
      // Oznacz jako przetworzone
      thread.addLabel(GmailApp.getUserLabelByName('AutoMentor-Processed') || 
                     GmailApp.createLabel('AutoMentor-Processed'));
      thread.removeLabel(GmailApp.getUserLabelByName('AutoMentor'));
      
    } catch (error) {
      console.error('Błąd webhook:', error);
    }
  });
}

// Ustaw trigger do uruchamiania co 5 minut
function setupTrigger() {
  ScriptApp.newTrigger('processEmailReplies')
    .timeBased()
    .everyMinutes(5)
    .create();
}
```

3. **Zapisz projekt jako "AutoMentor Email Integration"**

4. **Uruchom funkcję setupTrigger() raz** (kliknij ▶️ obok nazwy funkcji)

5. **Utwórz etykiety w Gmail:**
   - Otwórz Gmail
   - Utwórz etykietę "AutoMentor"
   - Utwórz filtr: jeśli temat zawiera "AutoMentor Chat" → zastosuj etykietę "AutoMentor"

### Metoda 2: Zapier (Alternatywa)

1. **Utwórz konto na zapier.com**

2. **Utwórz nowy Zap:**
   - Trigger: Gmail "New Email Matching Search"
   - Search: `subject:"AutoMentor Chat"`

3. **Action: Webhooks by Zapier**
   - URL: `http://localhost:3015/api/email-reply`
   - Method: POST
   - Data:
     ```json
     {
       "sessionId": "{{extract from subject}}",
       "content": "{{body_plain}}"
     }
     ```

### Testowanie

1. **Wyślij testowy email** na adres wiktoriatopajew@gmail.com z tematem:
   ```
   Re: AutoMentor Chat - Session: [ACTUAL_SESSION_ID]
   ```

2. **Sprawdź logi serwera** - powinna pojawić się wiadomość w czacie

### Aktualizacja formatu emaili

Aby sessionId było łatwiej wyciągnąć z emaili, zmodyfikujmy format tematu:
