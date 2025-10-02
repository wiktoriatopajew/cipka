# Google Ads Conversion Tracking - Setup Guide

## 🎯 **Kroki Konfiguracji Google Ads**

### 1. **Tworzenie Konwersji w Google Ads**

1. **Zaloguj się do Google Ads:**
   - Przejdź do https://ads.google.com
   - Wybierz właściwe konto reklamowe

2. **Utwórz Konwersję Zakupu:**
   - Idź do: `Tools & Settings` → `Measurement` → `Conversions`
   - Kliknij `+ New Conversion Action`
   - Wybierz `Website`
   - Wybierz `Purchase` jako kategoria
   - Nazwa: "Purchase - Mechanic Subscription"
   - Wartość: "Use different values for each conversion"
   - Count: "Every conversion"
   - Attribution model: "Data-driven"

3. **Utwórz Konwersję Rejestracji:**
   - Powtórz powyższe kroki
   - Nazwa: "Sign Up - New Account"
   - Kategoria: "Sign-up"

### 2. **Uzyskanie ID Konwersji**

Po utworzeniu konwersji otrzymasz:
- **Conversion ID**: `AW-XXXXXXXXXX`
- **Conversion Label dla zakupu**: `abcDEF123456`
- **Conversion Label dla rejestracji**: `ghiJKL789012`

### 3. **Aktualizacja Kodu w Aplikacji**

**Plik 1: `client/index.html`**
```html
<!-- Znajdź linię z AW-CONVERSION_ID i zastąp -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-TWOJE_CONVERSION_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-TWOJE_CONVERSION_ID');
</script>
```

**Plik 2: `client/src/lib/googleAdsTracking.ts`**
```typescript
// Znajdź te linie i zastąp wartościami z Google Ads:
private static conversionId = 'AW-TWOJE_CONVERSION_ID';
private static purchaseLabel = 'TWOJ_PURCHASE_LABEL';
private static signupLabel = 'TWOJ_SIGNUP_LABEL';
```

### 4. **Testowanie Konwersji**

1. **Google Ads Helper:**
   - Zainstaluj rozszerzenie "Google Ads Helper" w Chrome
   - Przejdź przez proces zakupu na swojej stronie
   - Sprawdź czy konwersje są wykrywane

2. **Google Tag Assistant:**
   - Użyj Google Tag Assistant Legacy
   - Sprawdź czy tagi są prawidłowo ładowane

3. **Google Ads Interface:**
   - W Google Ads idź do `Tools & Settings` → `Conversions`
   - Sprawdź status konwersji (powinien być "Active")
   - Poszukaj testowych konwersji w ciągu 24h

### 5. **Monitorowanie Konwersji**

**Gdzie sprawdzać wyniki:**
- `Campaigns` → wybierz kampanię → kolumna "Conversions"
- `Tools & Settings` → `Measurement` → `Conversions` → szczegóły konwersji
- `Reports` → `Attribution` → Conversion paths

---

## 🚀 **Zaimplementowane Eventi Trackingowe**

### **1. Begin Checkout** 
- **Kiedy:** Modal płatności się otwiera
- **Dane:** wartość planu, currency

### **2. Add Payment Info**
- **Kiedy:** Użytkownik pomyślnie wprowadza dane płatności (Stripe/PayPal)
- **Dane:** wartość transakcji

### **3. Purchase Conversion**
- **Kiedy:** Płatność zostaje potwierdzona i subskrypcja utworzona
- **Dane:** transaction_id, wartość, currency, szczegóły produktu

### **4. Sign Up Conversion**
- **Kiedy:** Nowy użytkownik tworzy konto (tylko dla nowych użytkowników)
- **Dane:** email (opcjonalnie)

---

## 💡 **Dodatkowe Ustawienia**

### **Enhanced Conversions (Zalecane)**
W Google Ads można włączyć Enhanced Conversions dla lepszego trackingu:
1. `Tools & Settings` → `Measurement` → `Conversions`
2. Wybierz konwersję → `Settings` → `Enhanced conversions`
3. Włącz i skonfiguruj

### **Audience Building**
Automatycznie zbierane dane pozwalają tworzyć audiences:
- **Converters:** Użytkownicy którzy kupili
- **Cart Abandoners:** Rozpoczęli checkout ale nie kupili
- **Visitors:** Wszyscy odwiedzający

### **Bidding Strategies**
Z danymi konwersji możesz używać Smart Bidding:
- Target CPA (docelowy koszt pozyskania)
- Target ROAS (docelowy ROAS)
- Maximize Conversions

---

## 🔧 **Troubleshooting**

### **Konwersje nie są widoczne:**
1. Sprawdź czy Conversion ID i Labels są prawidłowe
2. Upewnij się że gtag jest załadowany przed wywołaniem
3. Sprawdź konsole przeglądarki pod kątem błędów
4. Konwersje mogą pojawić się z opóźnieniem do 24h

### **Duplikowanie konwersji:**
- Ustawiono "Every conversion" więc każda płatność będzie liczona
- To prawidłowe dla modelu subskrypcyjnego

### **Testowanie:**
- Użyj trybu debug w Google Tag Assistant
- Sprawdź Network tab w DevTools dla żądań do Google Analytics

---

## 📊 **Struktura Eventów**

```javascript
// Przykładowy event purchase
gtag('event', 'conversion', {
  'send_to': 'AW-123456789/AbC-D1efGHijk',
  'value': 49.99,
  'currency': 'USD',
  'transaction_id': 'pi_1234567890',
  'items': [{
    'item_id': 'professional',
    'item_name': 'Professional Plan',
    'category': 'Automotive Services',
    'quantity': 1,
    'price': 49.99
  }]
});
```

Ten setup zapewnia kompletny tracking konwersji dla Google Ads! 🎯