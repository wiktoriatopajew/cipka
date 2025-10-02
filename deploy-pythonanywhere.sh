#!/bin/bash

# AutoMentor Deployment Script for PythonAnywhere
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
echo "📋 Adding sample data..."
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
echo "   - Configure proper domain"