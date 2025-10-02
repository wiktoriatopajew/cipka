#!/bin/bash

# AutoMentor Decho "📋 Adding sample data..."
node test-analytics-data.cjs

# Create admin user
echo "👤 Creating admin user..."
node create-admin.cjs

echo "🔧 Setting up file permissions..."
chmod 755 $PROJECT_DIR
chmod 644 $PROJECT_DIR/database.sqlite
chmod -R 755 $PROJECT_DIR/client/dist
chmod -R 755 $PROJECT_DIR/uploads

# Create logs directory
mkdir -p logs
chmod 755 logs

# Create backups directory
mkdir -p backups
chmod 755 backups

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to PythonAnywhere Web tab"
echo "2. Create a new web app (Manual configuration > Node.js)"
echo "3. Set source code directory to: $PROJECT_DIR"
echo "4. Update WSGI file with the configuration from DEPLOYMENT_GUIDE.md"
echo "5. Set static files: URL=/static/, Directory=$PROJECT_DIR/client/dist"
echo "6. Reload your web app"
echo ""
echo "🔐 Admin login:"
echo "   Username: admin"
echo "   Password: AutoMentor2024!"
echo "   URL: https://yourdomain.pythonanywhere.com"
echo ""
echo "⚠️  Remember to:"
echo "   - Change admin password after first login"
echo "   - Update .env with production values"
echo "   - Set up SSL certificate"
echo "   - Configure proper domain"ployment Script for PythonAnywhere
# Run this script on your PythonAnywhere console

echo "🚀 AutoMentor Deployment Script"
echo "================================"

# Set project directory
PROJECT_DIR="/home/$USER/automentor"
echo "📁 Project directory: $PROJECT_DIR"

# Navigate to project directory
cd $PROJECT_DIR || exit 1

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building the application..."
npm run build

echo "📊 Setting up database..."
# Run migrations
node migrate-analytics.cjs
node migrate-cms.cjs

# Add sample data
echo "� Adding sample data..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
if ! command -v node &> /dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  sudo npm install -g pm2
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
  echo "Installing Nginx..."
  sudo apt install -y nginx
fi

# Install Certbot
if ! command -v certbot &> /dev/null; then
  echo "Installing Certbot..."
  sudo apt install -y certbot python3-certbot-nginx
fi

echo "📁 Setting up application..."

# Create necessary directories
mkdir -p logs uploads backups

# Install dependencies
npm install

# Build application
npm run build

# Test database connection
echo "🔍 Testing database connection..."
npm run db:test

# Test email configuration
echo "📧 Testing email configuration..."
npm run test:email

echo "🔧 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Configure your domain DNS to point to this server"
echo "2. Set up Nginx configuration for your domain"
echo "3. Get SSL certificate with: sudo certbot --nginx -d yourdomain.com"
echo "4. Configure Stripe webhooks"
echo ""
echo "Useful commands:"
echo "- View logs: npm run logs"
echo "- Restart app: npm run restart"
echo "- Create backup: npm run backup"