# AutoMentor - Quick Setup Guide

## 🚀 Ready for Production Deployment

Your AutoMentor application is now configured for production deployment. Here's what you need to do:

### 1. Configure Environment Variables

```bash
# Copy the production environment template
cp .env.production .env

# Edit the file with your actual values
nano .env
```

**Fill in these required values:**

| Variable | Where to get it | Example |
|----------|----------------|---------|
| `DATABASE_URL` | Your hosting provider | `postgresql://user:pass@host:5432/automentor` |
| `STRIPE_PUBLISHABLE_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) | `pk_live_...` |
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | [Stripe Webhooks](https://dashboard.stripe.com/webhooks) | `whsec_...` |
| `SMTP_USER` | Your email address | `support@yourdomain.com` |
| `SMTP_PASS` | Email app password | See email setup below |
| `FRONTEND_URL` | Your domain | `https://yourdomain.com` |
| `SESSION_SECRET` | Generate random string | `openssl rand -base64 32` |

### 2. Email Setup (Gmail)

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords → Generate new password
4. Use the 16-character password in `SMTP_PASS`

### 3. Stripe Setup

1. **Get API Keys**: [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. **Setup Webhooks**: [Webhook Settings](https://dashboard.stripe.com/webhooks)
   - Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
3. **Configure Products**: Create your service packages in Stripe

### 4. Deploy to Server

#### Option A: Automated Deployment
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run automated setup
./deploy.sh
```

#### Option B: Manual Deployment
```bash
# Install dependencies
npm install

# Build application
npm run build

# Test configuration
npm run db:test
npm run test:email

# Start with PM2
npm run start:prod
```

### 5. Configure Domain & SSL

1. **Point your domain** to your server IP
2. **Setup Nginx** (configuration provided in DEPLOYMENT.md)
3. **Get SSL certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

### 6. Verify Everything Works

```bash
# Check application status
pm2 status

# View logs
npm run logs

# Test endpoints
curl https://yourdomain.com/api/health
```

---

## 📁 What's Included

- ✅ **Production configuration** files
- ✅ **PM2 process manager** setup
- ✅ **Nginx configuration** template
- ✅ **SSL certificate** automation
- ✅ **Database migration** scripts
- ✅ **Email testing** utilities
- ✅ **Backup system** 
- ✅ **Monitoring & logging**
- ✅ **Security hardening**

## 🔧 Management Commands

```bash
# Application
npm run start:prod     # Start with PM2
npm run restart        # Restart application
npm run stop          # Stop application
npm run logs          # View logs

# Maintenance
npm run backup        # Create backup
npm run db:test       # Test database
npm run test:email    # Test email config

# Deployment
npm run deploy:setup  # Full deployment setup
```

## 📞 Support

- 📖 **Full Documentation**: See `DEPLOYMENT.md`
- 🔍 **Troubleshooting**: Check logs with `npm run logs`
- 🔧 **Configuration**: All settings in `.env` file

---

**Ready to deploy? Start with step 1 above!** 🚀