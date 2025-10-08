# 🧪 AutoMentor Render Testing Guide

## 📋 How to Test Your Render Deployment

### Method 1: Web-Based Tester (Recommended)
After deploying to Render:
1. Open your Render URL: `https://your-app-name.onrender.com`
2. Add `/render-test.html` to the URL
3. Click the test buttons to verify everything works

### Method 2: Browser Console Testing
1. Open your Render app in browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Paste and run:
```javascript
// Test all endpoints
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test admin login
fetch('/api/admin/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'admin', password: 'admin'})
}).then(r => r.json()).then(console.log);
```

### Method 3: External Testing
Use the deployment test script:
```bash
node render-deployment-test.js
```

## ✅ What to Check

### 1. Basic Connectivity
- [ ] Health endpoint responds: `/api/health`
- [ ] Frontend loads: `/`
- [ ] Mechanics count works: `/api/mechanics`

### 2. Authentication
- [ ] Admin login works: `admin` / `admin`
- [ ] User login works: `test` / `123456`
- [ ] Session persistence works

### 3. Database Connection
- [ ] Users can be created
- [ ] Chat sessions work
- [ ] Admin dashboard loads

### 4. Environment
- [ ] PostgreSQL connection established
- [ ] Environment variables loaded
- [ ] Static files served correctly

## 🚨 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:** Check DATABASE_URL environment variable in Render

### Issue: "403 Forbidden" on admin endpoints
**Solution:** Check if admin user exists and isn't blocked

### Issue: "Session not found"
**Solution:** Check if sessions are persisting (might need Redis on Render)

### Issue: Frontend not loading
**Solution:** Check build process and static file serving

## 📊 Expected Test Results

### ✅ Success Indicators:
- Health check returns JSON with status "OK"
- Admin login returns success message
- Frontend loads without errors
- Database queries execute successfully

### ❌ Failure Indicators:
- 500 errors (server issues)
- 403 errors (permission issues) 
- Connection timeouts (database issues)
- 404 errors (routing issues)

## 🔧 Debug Commands

### Check Render Logs:
1. Go to Render dashboard
2. Click your service
3. Check "Logs" tab for errors

### Test Specific Endpoints:
```bash
curl https://your-app.onrender.com/api/health
curl -X POST https://your-app.onrender.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ All API endpoints respond correctly
- ✅ Admin can log in and access dashboard
- ✅ Users can register and log in
- ✅ Database operations work
- ✅ Frontend renders without errors
- ✅ No console errors in browser

Run these tests after every deployment to ensure everything works correctly!