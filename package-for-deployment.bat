@echo off
echo 🚀 AutoMentor - Packaging for deployment...
echo =====================================

REM Create deployment package
echo 📦 Creating deployment package...

REM Build the application first
echo 🔨 Building application...
call npm run build

REM Create temporary deployment directory
if exist "deployment_package" rmdir /s /q "deployment_package"
mkdir deployment_package

REM Copy necessary files and directories
echo 📁 Copying files...
xcopy "client" "deployment_package\client" /e /i /q
xcopy "server" "deployment_package\server" /e /i /q  
xcopy "shared" "deployment_package\shared" /e /i /q
xcopy "migrations" "deployment_package\migrations" /e /i /q

REM Copy configuration files
copy "package.json" "deployment_package\"
copy "tsconfig.json" "deployment_package\"
copy "vite.config.ts" "deployment_package\"
copy "tailwind.config.ts" "deployment_package\"
copy "drizzle.config.ts" "deployment_package\"
copy "components.json" "deployment_package\"
copy "postcss.config.js" "deployment_package\"

REM Copy deployment files
copy "DEPLOYMENT_GUIDE.md" "deployment_package\"
copy "README_DEPLOYMENT.md" "deployment_package\"
copy "deploy-pythonanywhere.sh" "deployment_package\"
copy "create-admin.cjs" "deployment_package\"
copy "wsgi_config.py" "deployment_package\"
copy "env-template.txt" "deployment_package\"
copy "backup.sh" "deployment_package\"

REM Copy migration files
copy "migrate-analytics.cjs" "deployment_package\"
copy "migrate-cms.cjs" "deployment_package\"
copy "test-analytics-data.cjs" "deployment_package\"

REM Copy database if it exists
if exist "database.sqlite" copy "database.sqlite" "deployment_package\"

REM Create uploads directory
mkdir "deployment_package\uploads"

REM Create archive
echo 🗜️ Creating ZIP archive...
powershell Compress-Archive -Path "deployment_package\*" -DestinationPath "AutoMentor_Deployment.zip" -Force

REM Cleanup
rmdir /s /q "deployment_package"

echo ✅ Deployment package created successfully!
echo 📦 File: AutoMentor_Deployment.zip
echo 📊 Size: 
powershell "Write-Host ((Get-Item 'AutoMentor_Deployment.zip').Length / 1MB).ToString('F2') + ' MB'"

echo.
echo 🚀 Ready for deployment!
echo 📋 Next steps:
echo    1. Upload AutoMentor_Deployment.zip to your server
echo    2. Extract the archive
echo    3. Follow DEPLOYMENT_GUIDE.md instructions
echo    4. Run deploy-pythonanywhere.sh for automatic setup
echo.
pause