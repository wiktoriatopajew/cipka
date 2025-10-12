# 🎯 Google Ads Purchase Conversion - Simplified Setup

## ✅ Co już jest skonfigurowane:

### **Tylko Purchase Conversion (pojedyncza konwersja)**
Since registration happens only after purchase, you only need **one conversion action** in Google Ads.

### **Current Configuration:**
- **Conversion ID:** `AW-17646488974` ✅ 
- **Purchase Tracking:** IMPLEMENTED ✅
- **Signup Tracking:** REMOVED (not needed) ✅

## 🎯 Single Conversion Setup in Google Ads:

### 1. Go to Google Ads → Conversions
Create only **ONE** conversion action:

```
Name: "Subscription Purchase"
Category: "Purchase" 
Value: "Use different values for each conversion"
Count: "One"
Attribution model: "Data-driven"
```

### 2. Copy the Conversion Label
After creating the action, copy the conversion label (format: `abc123def/xyz789`)

### 3. Update Configuration
Replace `purchase_conversion` with your real label:

**Option A: Via SQL**
```sql
UPDATE google_ads_config SET 
  purchase_label = 'YOUR_ACTUAL_PURCHASE_LABEL'
WHERE conversion_id = 'AW-17646488974';
```

**Option B: Via API**
```javascript
fetch('/api/admin/google-ads-config', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversionId: 'AW-17646488974',
    purchaseLabel: 'YOUR_ACTUAL_PURCHASE_LABEL',
    signupLabel: null, // Not needed
    enabled: true
  })
});
```

## 📊 What Gets Tracked:

### Every Purchase Conversion Includes:
- **Transaction ID:** Payment ID from Stripe/PayPal
- **Value:** Plan price (with referral discounts)
- **Currency:** USD
- **Items:** Plan details (Basic/Professional/Expert)
- **User Registration:** Automatically included since it happens after purchase

### Additional Events:
- `begin_checkout` - When user opens payment modal
- `add_payment_info` - When user selects payment method  
- `purchase` - When payment is completed ✅

## 🎯 Perfect for Your Business Model:

Since your users can only register AFTER purchasing:
- ✅ **One conversion = One customer = One revenue**
- ✅ **Simple tracking setup**
- ✅ **Clean conversion data**
- ✅ **Easy optimization**

## 🚀 Benefits:

1. **Accurate ROI:** Every conversion = real revenue
2. **Simple Optimization:** Focus on purchase conversions only  
3. **Better Bidding:** Google optimizes for paying customers
4. **Clean Data:** No confusion between signups and purchases

## 🧪 Testing:

1. Complete a test purchase (any plan)
2. Check Google Ads > Conversions 
3. Should see: "1 conversion, $X.XX value"

**Perfect setup for subscription business! 🎯**