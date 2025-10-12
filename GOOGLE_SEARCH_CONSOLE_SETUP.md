# Google Search Console Setup dla AutoMentor

## 🎯 **Kroki Dodania Sitemap do Google Search Console**

### **1. Dodanie Strony do Google Search Console**
1. Idź na: https://search.google.com/search-console
2. Kliknij **"+ Add Property"**
3. Wybierz **"URL prefix"**
4. Wpisz: `https://automentor-k5xe.onrender.com` (lub twoją domenę)

### **2. Weryfikacja Własności Strony**
**Metoda A: Plik HTML (Rekomendowana)**
1. Google poda plik do pobrania (np. `google123abc.html`)
2. Umieść go w folderze `client/public/`
3. Sprawdź dostęp: `https://twoja-domena.com/google123abc.html`
4. Kliknij "Verify" w Google Search Console

**Metoda B: META tag**
1. Google poda META tag weryfikacyjny
2. Dodaj go do `client/index.html` w sekcji `<head>`
3. Kliknij "Verify"

### **3. Dodanie Sitemap**
Po weryfikacji:
1. W Google Search Console idź do **"Sitemaps"** (lewa strona)
2. Kliknij **"Add a new sitemap"**
3. Wpisz: `sitemap.xml`
4. Kliknij **"Submit"**

### **4. Dodanie Robots.txt**
1. Sprawdź w GSC: **"Settings"** → **"robots.txt Tester"**
2. Wpisz URL: `https://twoja-domena.com/robots.txt`
3. Sprawdź czy się ładuje poprawnie

---

## 📋 **Wygenerowane Pliki**

### **Sitemap.xml zawiera:**
- ✅ Strona główna (`/`) - priority 1.0, daily updates
- ✅ Cennik (`/pricing`) - priority 0.9, weekly updates  
- ✅ Jak to działa (`/how-it-works`) - priority 0.8
- ✅ Kontakt (`/contact`) - priority 0.7
- ✅ Polityka prywatności - priority 0.5
- ✅ Regulamin - priority 0.5
- ✅ O nas (`/about`) - priority 0.6
- ✅ FAQ (`/faq`) - priority 0.7

### **Robots.txt zawiera:**
- ✅ Allow wszystko dla crawlerów
- ✅ Disallow `/admin`, `/api/`, `/private/`
- ✅ Crawl-delay dla lepszej wydajności
- ✅ Link do sitemap
- ✅ Pozwolenia dla CSS/JS/obrazków

---

## 🚀 **Dostępne Endpointy**

### **Po wdrożeniu będą dostępne:**
- `https://twoja-domena.com/sitemap.xml` - XML Sitemap
- `https://twoja-domena.com/robots.txt` - Robots.txt

### **Testowanie lokalnie:**
- `http://localhost:3000/sitemap.xml`
- `http://localhost:3000/robots.txt`

---

## 📊 **Monitorowanie w Google Search Console**

### **Po dodaniu sprawdzaj:**
1. **Coverage** - czy wszystkie strony są zindeksowane
2. **Performance** - jakie zapytania generują ruch
3. **Enhancements** - problemy z Core Web Vitals
4. **Sitemaps** - status przetwarzania sitemap

### **Częstość aktualizacji:**
- Sitemap aktualizuje się automatycznie przy każdym żądaniu
- Sprawdzaj GSC co tydzień przez pierwsze miesiąc
- Później wystarczy co miesiąc

---

## 💡 **Pro Tips**

### **Dla lepszego SEO:**
1. **Internal Linking** - dodaj linki między stronami
2. **Meta Descriptions** - unikalne dla każdej strony
3. **Header Tags** - używaj H1, H2, H3 systematycznie
4. **Alt Text** - opisz wszystkie obrazki
5. **Page Speed** - optymalizuj czas ładowania

### **Monitoring:**
- Dodaj Google Analytics (już masz tracking code)
- Śledź organic traffic w GA
- Monitoruj keywords w GSC Performance

---

## ⚡ **Natychmiastowe Korzyści**

1. **Szybsze indeksowanie** nowych treści
2. **Lepsze rankings** w Google Search
3. **Wsparcie dla Google Ads** (lepsze Quality Score)
4. **Dane o wydajności** wyszukiwania
5. **Powiadomienia o problemach** technicznych

**Gotowy do dodania do Google Search Console! 🎯**