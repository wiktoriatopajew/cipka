@echo off
echo 🚀 AutoMentor Railway Deployment
echo =================================

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not installed!
    echo Install it with: npm install -g @railway/cli
    echo Or download from: https://railway.app/cli
    pause
    exit /b 1
)

echo ✅ Railway CLI found

REM Login check
echo 🔐 Checking Railway authentication...
railway whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo Please login to Railway first:
    railway login
)

echo ✅ Railway authentication confirmed

REM Create new project or link existing
echo 📁 Setting up Railway project...
if not exist "railway.json" (
    echo Creating new Railway project...
    railway init
) else (
    echo Using existing Railway project
)

REM Deploy to Railway
echo 🚀 Deploying to Railway...
railway up

echo.
echo 🎉 Deployment completed!
echo.
echo 📝 Next steps:
echo 1. Go to your Railway dashboard: https://railway.app/dashboard
echo 2. Add environment variables in the Variables tab:
echo    - SESSION_SECRET=your-secret-key
echo    - STRIPE_SECRET_KEY=your-stripe-key (optional)
echo    - EMAIL_USER=your-email (optional)
echo    - EMAIL_PASS=your-password (optional)
echo 3. Railway will automatically provision PostgreSQL database
echo 4. Your app will be available at the generated Railway URL
echo.
echo 🔗 Useful commands:
echo    railway status  - Check deployment status
echo    railway logs    - View application logs
echo    railway open    - Open app in browser
echo.
pause