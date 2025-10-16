# Quick Deploy Script for Render
# Run this after making changes

Write-Host "🚀 AutoMentor Render Deployment Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if changes exist
Write-Host "📋 Step 1: Checking for changes..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "✅ Found changes to commit" -ForegroundColor Green
    git status --short
} else {
    Write-Host "⚠️  No changes detected" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit
    }
}
Write-Host ""

# Step 2: Commit and push
Write-Host "📤 Step 2: Commit and push to GitHub..." -ForegroundColor Yellow
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: Analytics and Favicon features"
}

git add .
git commit -m "$commitMessage"
git push origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Pushed to GitHub successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Push failed. Check git credentials." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Wait for Render build
Write-Host "⏳ Step 3: Render will now build and deploy..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 Monitor deployment:" -ForegroundColor Cyan
Write-Host "   1. Open: https://dashboard.render.com" -ForegroundColor White
Write-Host "   2. Select your service: cipka" -ForegroundColor White
Write-Host "   3. Watch the 'Events' tab for build status" -ForegroundColor White
Write-Host ""

$openDashboard = Read-Host "Open Render Dashboard? (y/n)"
if ($openDashboard -eq "y") {
    Start-Process "https://dashboard.render.com"
}
Write-Host ""

# Step 4: Database migration
Write-Host "🗄️  Step 4: Database Migration" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: You need to run the migration on Render database" -ForegroundColor Red
Write-Host ""
Write-Host "Option A - From your computer (RECOMMENDED):" -ForegroundColor Cyan
Write-Host "1. Get DATABASE_URL from Render Dashboard → Environment" -ForegroundColor White
Write-Host "2. Run in PowerShell:" -ForegroundColor White
Write-Host '   $env:DATABASE_URL="your-database-url-here"' -ForegroundColor Gray
Write-Host '   node migrate-analytics-render.mjs' -ForegroundColor Gray
Write-Host ""
Write-Host "Option B - From Render Shell:" -ForegroundColor Cyan
Write-Host "1. Render Dashboard → Your Service → Shell" -ForegroundColor White
Write-Host "2. Run: node migrate-analytics-render.mjs" -ForegroundColor Gray
Write-Host ""

$runMigration = Read-Host "Do you have DATABASE_URL ready to run migration now? (y/n)"
if ($runMigration -eq "y") {
    Write-Host ""
    Write-Host "📝 Paste your DATABASE_URL (it will be hidden):" -ForegroundColor Yellow
    $databaseUrl = Read-Host -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($databaseUrl)
    $PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    $env:DATABASE_URL = $PlainPassword
    
    Write-Host ""
    Write-Host "🚀 Running migration..." -ForegroundColor Yellow
    node migrate-analytics-render.mjs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Migration failed. Check the error above." -ForegroundColor Red
    }
    
    # Clear the sensitive data
    $env:DATABASE_URL = ""
} else {
    Write-Host ""
    Write-Host "⚠️  Remember to run migration manually!" -ForegroundColor Yellow
    Write-Host "   The analytics won't work until you do." -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Verification
Write-Host "✅ Step 5: Verification Checklist" -ForegroundColor Yellow
Write-Host ""
Write-Host "After Render finishes building (3-5 minutes), verify:" -ForegroundColor White
Write-Host "  [ ] Open your site: https://cipka.onrender.com" -ForegroundColor Gray
Write-Host "  [ ] Login to admin panel" -ForegroundColor Gray
Write-Host "  [ ] Check 'Statystyki Odwiedzin' tab exists" -ForegroundColor Gray
Write-Host "  [ ] Visit a few pages on the site" -ForegroundColor Gray
Write-Host "  [ ] Refresh admin panel - see new visits" -ForegroundColor Gray
Write-Host "  [ ] Test favicon upload in 'Konfiguracja' tab" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 Deployment process started!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 For more help, read:" -ForegroundColor Cyan
Write-Host "   - RENDER_DEPLOYMENT.md (deployment guide)" -ForegroundColor White
Write-Host "   - ANALYTICS_AND_FAVICON_GUIDE.md (feature guide)" -ForegroundColor White
Write-Host "   - CHANGES_SUMMARY.md (what changed)" -ForegroundColor White
Write-Host ""
Write-Host "Good luck! 🚀" -ForegroundColor Green
