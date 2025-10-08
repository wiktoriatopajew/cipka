# Monitor Render deployment from PowerShell

# Your Render app URL
$RENDER_URL = "https://cipka.onrender.com"

Write-Host "🚀 Render Monitoring Tools" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host "App URL: $RENDER_URL" -ForegroundColor Cyan
Write-Host ""

function Test-RenderHealth {
    Write-Host "🔍 Testing Render Health..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$RENDER_URL/api/health" -Method GET -TimeoutSec 10
        Write-Host "✅ Health check passed!" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-RenderAPI {
    Write-Host "🧪 Testing Render API endpoints..." -ForegroundColor Yellow
    
    $endpoints = @(
        "/api/health",
        "/api/mechanics", 
        "/api/stripe-config",
        "/api/app-config"
    )
    
    foreach ($endpoint in $endpoints) {
        Write-Host "Testing: $endpoint" -ForegroundColor Cyan
        try {
            $response = Invoke-RestMethod -Uri "$RENDER_URL$endpoint" -Method GET -TimeoutSec 5
            Write-Host "  ✅ OK" -ForegroundColor Green
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "  ❌ Failed ($statusCode)" -ForegroundColor Red
        }
    }
}

function Test-RenderLogin {
    Write-Host "🔐 Testing admin login..." -ForegroundColor Yellow
    try {
        $body = @{
            username = "admin"
            password = "admin"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$RENDER_URL/api/admin/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
        Write-Host "✅ Admin login successful!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Watch-RenderLogs {
    Write-Host "📊 Simulating log monitoring..." -ForegroundColor Yellow
    Write-Host "Note: Real logs are only available in Render Dashboard" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To see real logs:" -ForegroundColor Cyan
    Write-Host "1. Go to https://dashboard.render.com" -ForegroundColor White
    Write-Host "2. Click your app 'cipka'" -ForegroundColor White
    Write-Host "3. Click 'Logs' tab" -ForegroundColor White
    Write-Host ""
    
    # Simulate monitoring by checking health repeatedly
    for ($i = 1; $i -le 5; $i++) {
        Write-Host "[$i] Checking health..." -ForegroundColor Gray
        try {
            $response = Invoke-RestMethod -Uri "$RENDER_URL/api/health" -Method GET -TimeoutSec 5
            $timestamp = Get-Date -Format "HH:mm:ss"
            Write-Host "[$timestamp] ✅ App is running" -ForegroundColor Green
        }
        catch {
            $timestamp = Get-Date -Format "HH:mm:ss"
            Write-Host "[$timestamp] ❌ App not responding" -ForegroundColor Red
        }
        Start-Sleep -Seconds 2
    }
}

function Show-RenderInfo {
    Write-Host "📋 Render App Information" -ForegroundColor Yellow
    Write-Host "========================" -ForegroundColor Yellow
    Write-Host "App Name: cipka" -ForegroundColor White
    Write-Host "URL: $RENDER_URL" -ForegroundColor White
    Write-Host "GitHub Repo: wiktoriatopajew/cipka" -ForegroundColor White
    Write-Host ""
    Write-Host "Admin Credentials:" -ForegroundColor Cyan
    Write-Host "  Username: admin" -ForegroundColor White
    Write-Host "  Password: admin" -ForegroundColor White
    Write-Host ""
    Write-Host "Test URLs:" -ForegroundColor Cyan
    Write-Host "  Frontend: $RENDER_URL/" -ForegroundColor White
    Write-Host "  Admin: $RENDER_URL/admin" -ForegroundColor White
    Write-Host "  API Test: $RENDER_URL/api/health" -ForegroundColor White
    Write-Host "  Test Panel: $RENDER_URL/render-test.html" -ForegroundColor White
}

# Show menu
Write-Host "Available commands:" -ForegroundColor Magenta
Write-Host "  Test-RenderHealth     - Check if app is running" -ForegroundColor White
Write-Host "  Test-RenderAPI        - Test all API endpoints" -ForegroundColor White  
Write-Host "  Test-RenderLogin      - Test admin login" -ForegroundColor White
Write-Host "  Watch-RenderLogs      - Monitor app (simulated)" -ForegroundColor White
Write-Host "  Show-RenderInfo       - Show app information" -ForegroundColor White
Write-Host ""
Write-Host "Example: Test-RenderHealth" -ForegroundColor Gray