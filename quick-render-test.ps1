# Quick Render monitoring commands

Write-Host "🚀 Quick Render Monitor" -ForegroundColor Green
Write-Host "App: https://cipka.onrender.com" -ForegroundColor Cyan

# Test basic endpoints
Write-Host "`n🧪 Testing API endpoints:" -ForegroundColor Yellow

try {
    $health = Invoke-RestMethod -Uri "https://cipka.onrender.com/api/health"
    Write-Host "✅ Health: $($health.status) ($($health.env))" -ForegroundColor Green
} catch {
    Write-Host "❌ Health: Failed" -ForegroundColor Red
}

try {
    $mechanics = Invoke-RestMethod -Uri "https://cipka.onrender.com/api/mechanics"
    Write-Host "✅ Mechanics: $($mechanics.mechanics.Count) online" -ForegroundColor Green
} catch {
    Write-Host "❌ Mechanics: Failed" -ForegroundColor Red
}

try {
    $stripe = Invoke-RestMethod -Uri "https://cipka.onrender.com/api/stripe-config"
    Write-Host "✅ Stripe: Config loaded" -ForegroundColor Green
} catch {
    Write-Host "❌ Stripe: Failed" -ForegroundColor Red
}

Write-Host "`n📋 Direct Access URLs:" -ForegroundColor Yellow
Write-Host "Frontend:    https://cipka.onrender.com/" -ForegroundColor White
Write-Host "Admin Panel: https://cipka.onrender.com/admin" -ForegroundColor White
Write-Host "Test Page:   https://cipka.onrender.com/render-test.html" -ForegroundColor White

Write-Host "`n🔐 Login Credentials:" -ForegroundColor Yellow
Write-Host "Admin: admin / admin" -ForegroundColor White
Write-Host "User:  test / 123456" -ForegroundColor White

Write-Host "`n📊 For real-time logs:" -ForegroundColor Yellow
Write-Host "1. Go to: https://dashboard.render.com" -ForegroundColor White
Write-Host "2. Click: cipka app" -ForegroundColor White
Write-Host "3. Click: Logs tab" -ForegroundColor White