#!/bin/bash

# AutoMentor Railway Deployment Script
echo "🚀 AutoMentor Railway Deployment"
echo "================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not installed!"
    echo "Install it with: npm install -g @railway/cli"
    echo "Or download from: https://railway.app/cli"
    exit 1
fi

echo "✅ Railway CLI found"

# Login check
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "Please login to Railway first:"
    railway login
fi

echo "✅ Railway authentication confirmed"

# Create new project or link existing
echo "📁 Setting up Railway project..."
if [ ! -f "railway.json" ]; then
    echo "Creating new Railway project..."
    railway init
else
    echo "Using existing Railway project"
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Go to your Railway dashboard: https://railway.app/dashboard"
echo "2. Add environment variables in the Variables tab:"
echo "   - SESSION_SECRET=your-secret-key"
echo "   - STRIPE_SECRET_KEY=your-stripe-key (optional)"
echo "   - EMAIL_USER=your-email (optional)"
echo "   - EMAIL_PASS=your-password (optional)"
echo "3. Railway will automatically provision PostgreSQL database"
echo "4. Your app will be available at the generated Railway URL"
echo ""
echo "🔗 Useful commands:"
echo "   railway status  - Check deployment status"
echo "   railway logs    - View application logs"
echo "   railway open    - Open app in browser"