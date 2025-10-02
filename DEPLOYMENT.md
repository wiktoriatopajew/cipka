# AutoMentor - Deployment Guide

## 🚀 Production Deployment Setup

### 1. Environment Configuration

Copy `.env.example` to `.env` and fill in your production values:

```bash
cp .env.example .env
```

**Required Configuration:**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Your production database connection string | `postgresql://user:pass@host:5432/dbname` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe live publishable key | `pk_live_...` |
| `STRIPE_SECRET_KEY` | Stripe live secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret | `whsec_...` |
| `SMTP_USER` | Your email address for notifications | `support@yourdomain.com` |
| `SMTP_PASS` | Email app password (not regular password) | Generated from email provider |
| `FRONTEND_URL` | Your domain URL | `https://yourdomain.com` |
| `SESSION_SECRET` | Random string for session security | Generate with `openssl rand -base64 32` |

### 2. Database Setup

#### Option A: PostgreSQL (Recommended)
```bash
# Install PostgreSQL on your server
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE automentor;
CREATE USER automentor_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE automentor TO automentor_user;
\q
```

#### Option B: SQLite (For small deployments)
```bash
# Database file will be created automatically
# Just ensure write permissions in the app directory
```

### 3. Server Requirements

**Minimum Server Specs:**
- CPU: 1 vCore
- RAM: 1GB
- Storage: 10GB SSD
- OS: Ubuntu 20.04+ / CentOS 8+ / Debian 11+

**Required Software:**
- Node.js 18+
- npm 9+
- PM2 (process manager)
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt)

### 4. Installation Steps

#### Step 1: Clone and Setup
```bash
# Clone repository
git clone <your-repo-url> automentor
cd automentor

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Fill in your values
```

#### Step 2: Database Migration
```bash
# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

#### Step 3: Build Application
```bash
# Build for production
npm run build

# Test production build
npm run start
```

#### Step 4: Process Manager (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Step 5: Nginx Configuration
```nginx
# /etc/nginx/sites-available/automentor
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # File upload limit
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Step 6: SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 5. Stripe Configuration

#### Webhooks Setup:
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

#### Payment Links:
- Update payment success/cancel URLs in Stripe Dashboard
- Success: `https://yourdomain.com/?payment=success`
- Cancel: `https://yourdomain.com/?payment=cancel`

### 6. Email Configuration

#### Gmail Setup:
1. Enable 2-Factor Authentication
2. Generate App Password: Google Account → Security → App passwords
3. Use App Password in `SMTP_PASS` (not regular password)

#### Custom SMTP:
```env
SMTP_HOST="mail.yourdomain.com"
SMTP_PORT="587"
SMTP_USER="support@yourdomain.com"
SMTP_PASS="your_email_password"
```

### 7. Security Checklist

- [ ] Change all default passwords
- [ ] Use environment variables for secrets
- [ ] Enable firewall (allow only 22, 80, 443)
- [ ] Regular security updates
- [ ] Database backups
- [ ] SSL certificate auto-renewal
- [ ] Rate limiting enabled
- [ ] File upload validation

### 8. Monitoring & Maintenance

#### Logs:
```bash
# Application logs
pm2 logs automentor

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

#### Backup:
```bash
# Database backup (PostgreSQL)
pg_dump -U automentor_user automentor > backup_$(date +%Y%m%d).sql

# Files backup
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

#### Updates:
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Rebuild
npm run build

# Restart with PM2
pm2 restart automentor
```

### 9. Performance Optimization

- Enable gzip compression in Nginx
- Setup Redis for session storage (optional)
- CDN for static assets (Cloudflare)
- Database connection pooling
- Image optimization and resizing

### 10. Domain & DNS

Point your domain A records to your server IP:
```
A    @              your.server.ip.address
A    www            your.server.ip.address
```

---

## 🔧 Quick Start Commands

```bash
# Complete setup in one go
npm run deploy:setup

# Start production
npm run start:prod

# View logs
npm run logs

# Backup
npm run backup
```

## 📞 Support

For deployment issues, check:
1. Logs: `pm2 logs`
2. Environment variables: `printenv | grep -E "STRIPE|SMTP|DATABASE"`
3. Database connection: `npm run db:test`
4. Email configuration: `npm run test:email`