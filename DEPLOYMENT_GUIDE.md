# AutoMentor - Deployment Guide for PythonAnywhere

## 📋 Pre-deployment Checklist

### 1. Files to Upload
```
AutoMentor/
├── client/                 # Frontend React app
├── server/                 # Backend Express.js
├── shared/                 # Shared schemas
├── migrations/             # Database migrations
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite config
├── tailwind.config.ts     # Tailwind config
├── drizzle.config.ts      # Database config
└── .env                   # Environment variables (create new)
```

### 2. Environment Variables (.env file)
Create a new `.env` file with production values:
```env
# Database
DATABASE_URL=sqlite:./database.sqlite

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_here_change_this

# Email Configuration (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox

# Application
NODE_ENV=production
PORT=3000
```

## 🚀 Deployment Steps

### Step 1: Prepare Files for Upload
1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Remove development files:**
   - Delete `node_modules/`
   - Delete `.vite/`
   - Delete `dist/` (will be rebuilt)

### Step 2: Upload to PythonAnywhere
1. **Upload via Files tab** or **use git clone:**
   ```bash
   git clone https://github.com/yourusername/automentor.git
   cd automentor
   ```

### Step 3: Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install TypeScript globally
npm install -g typescript tsx

# Build the project
npm run build
```

### Step 4: Database Setup
```bash
# Run migrations
node migrate-analytics.cjs
node migrate-cms.cjs

# Add sample data
node test-analytics-data.cjs

# Create admin user (run this once)
node create-admin.cjs
```

### Step 5: Configure Web App
1. **Go to Web tab in PythonAnywhere**
2. **Create new web app:**
   - Choose "Manual configuration"
   - Select Node.js
   - Set source code: `/home/yourusername/automentor`

3. **WSGI Configuration:**
   Replace content of WSGI file with:
   ```python
   import subprocess
   import sys
   import os

   # Add your project directory to sys.path
   path = '/home/yourusername/automentor'
   if path not in sys.path:
       sys.path.append(path)

   def application(environ, start_response):
       # Start Node.js server
       os.chdir('/home/yourusername/automentor')
       result = subprocess.run(['node', 'server/index.js'], 
                              capture_output=True, text=True)
       
       status = '200 OK'
       response_headers = [('Content-type', 'text/html')]
       start_response(status, response_headers)
       return [result.stdout.encode()]
   ```

### Step 6: Static Files
1. **Set static files directory:** `/home/yourusername/automentor/client/dist`
2. **Set static URL:** `/static/`

### Step 7: Custom Domains (Optional)
Add your domain in the Web tab if you have one.

## 🔧 Production Optimizations

### 1. Update package.json scripts
Add production scripts:
```json
{
  "scripts": {
    "start": "NODE_ENV=production tsx server/index.ts",
    "build": "tsc && vite build",
    "deploy": "npm run build && npm run start"
  }
}
```

### 2. Create production server file
Create `server/production.js`:
```javascript
const express = require('express');
const path = require('path');
const { fileURLToPath } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// API routes
app.use('/api', require('./routes'));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 📁 File Structure After Deployment
```
/home/yourusername/automentor/
├── client/dist/           # Built React app
├── server/                # Backend code
├── database.sqlite        # Production database
├── uploads/               # User uploads
├── .env                   # Production environment
└── logs/                  # Application logs
```

## 🛡️ Security Considerations

### 1. Environment Variables
- Never commit `.env` file
- Use strong JWT secrets
- Use production Stripe keys
- Set up proper CORS origins

### 2. Database Backup
Create automatic backup script:
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
cp database.sqlite "backups/database_$DATE.sqlite"
find backups/ -name "*.sqlite" -mtime +7 -delete
```

### 3. SSL Certificate
Enable HTTPS in PythonAnywhere dashboard.

## 🔍 Monitoring & Maintenance

### 1. Log Files
Monitor logs in `/var/log/` or create custom logging:
```javascript
// In server/index.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### 2. Health Check Endpoint
Add health check in `server/routes.ts`:
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

## 🚨 Troubleshooting

### Common Issues:
1. **Build failures:** Check Node.js version compatibility
2. **Database errors:** Ensure proper file permissions
3. **Static files not loading:** Verify paths in vite.config.ts
4. **API calls failing:** Check CORS configuration

### Debug Commands:
```bash
# Check Node.js version
node --version

# Test build
npm run build

# Check server startup
npm run start

# View logs
tail -f logs/error.log
```

## 📞 Support
- Check PythonAnywhere help docs
- Monitor error logs
- Test all functionality after deployment

---
**Note:** This guide assumes you're using PythonAnywhere's Node.js support. Adjust paths and configurations based on your specific hosting environment.