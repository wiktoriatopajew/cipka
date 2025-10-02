# AutoMentor - Skrypt automatycznej instalacji
# Uruchom jako administrator: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AutoMentor - Automatyczna Instalacja " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Sprawdź czy skrypt jest uruchomiony jako administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  Uwaga: Niektóre operacje mogą wymagać uprawnień administratora" -ForegroundColor Yellow
    Write-Host "   Jeśli napotkasz problemy, uruchom PowerShell jako administrator" -ForegroundColor Yellow
    Write-Host ""
}

# Funkcja do sprawdzania czy program jest zainstalowany
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Funkcja do wyświetlania statusu
function Write-Status($message, $type = "Info") {
    switch ($type) {
        "Success" { Write-Host "✅ $message" -ForegroundColor Green }
        "Error" { Write-Host "❌ $message" -ForegroundColor Red }
        "Warning" { Write-Host "⚠️  $message" -ForegroundColor Yellow }
        "Info" { Write-Host "ℹ️  $message" -ForegroundColor Blue }
        default { Write-Host "$message" }
    }
}

# Sprawdź Node.js
Write-Host "1. Sprawdzanie Node.js..." -ForegroundColor White
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Status "Node.js jest zainstalowany: $nodeVersion" "Success"
} else {
    Write-Status "Node.js nie jest zainstalowany!" "Error"
    Write-Host "   Pobierz z: https://nodejs.org/" -ForegroundColor Yellow
    $choice = Read-Host "Czy chcesz kontynuować bez Node.js? (y/n)"
    if ($choice -ne "y") {
        exit 1
    }
}

# Sprawdź npm
Write-Host "`n2. Sprawdzanie npm..." -ForegroundColor White
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Status "npm jest zainstalowany: $npmVersion" "Success"
} else {
    Write-Status "npm nie jest zainstalowany!" "Error"
    Write-Host "   npm jest zwykle instalowany razem z Node.js" -ForegroundColor Yellow
    exit 1
}

# Sprawdź Python
Write-Host "`n3. Sprawdzanie Python..." -ForegroundColor White
$pythonCommand = $null
if (Test-Command "python") {
    $pythonCommand = "python"
} elseif (Test-Command "python3") {
    $pythonCommand = "python3"
} elseif (Test-Command "py") {
    $pythonCommand = "py"
}

if ($pythonCommand) {
    $pythonVersion = & $pythonCommand --version
    Write-Status "Python jest zainstalowany: $pythonVersion" "Success"
} else {
    Write-Status "Python nie jest zainstalowany!" "Warning"
    Write-Host "   Pobierz z: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "   Python jest opcjonalny dla tego projektu" -ForegroundColor Yellow
}

# Sprawdź pip
if ($pythonCommand) {
    Write-Host "`n4. Sprawdzanie pip..." -ForegroundColor White
    if (Test-Command "pip") {
        $pipVersion = pip --version
        Write-Status "pip jest zainstalowany: $pipVersion" "Success"
    } else {
        Write-Status "pip nie jest zainstalowany!" "Warning"
        Write-Host "   pip jest zwykle instalowany razem z Python" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Rozpoczynanie instalacji zależności  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Instalacja zależności Node.js
Write-Host "`n5. Instalowanie zależności Node.js..." -ForegroundColor White
try {
    Write-Status "Uruchamianie: npm install" "Info"
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Zależności Node.js zainstalowane pomyślnie!" "Success"
    } else {
        Write-Status "Błąd podczas instalacji zależności Node.js" "Error"
        exit 1
    }
} catch {
    Write-Status "Błąd podczas instalacji npm: $_" "Error"
    exit 1
}

# Instalacja zależności Python (jeśli Python jest dostępny)
if ($pythonCommand -and (Test-Command "pip")) {
    Write-Host "`n6. Instalowanie zależności Python..." -ForegroundColor White
    try {
        Write-Status "Uruchamianie: pip install -r requirements.txt" "Info"
        pip install -r requirements.txt
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Zależności Python zainstalowane pomyślnie!" "Success"
        } else {
            Write-Status "Błąd podczas instalacji zależności Python (można kontynuować)" "Warning"
        }
    } catch {
        Write-Status "Błąd podczas instalacji pip: $_" "Warning"
    }
} else {
    Write-Host "`n6. Pomijanie instalacji Python..." -ForegroundColor White
    Write-Status "Python lub pip nie jest dostępny - pomijam instalację zależności Python" "Warning"
}

# Sprawdź czy istnieje baza danych
Write-Host "`n7. Sprawdzanie bazy danych..." -ForegroundColor White
if (Test-Path "database.sqlite") {
    Write-Status "Baza danych database.sqlite już istnieje" "Success"
} else {
    Write-Status "Baza danych nie istnieje - zostanie utworzona przy pierwszym uruchomieniu" "Info"
}

# Sprawdź plik .env
Write-Host "`n8. Sprawdzanie konfiguracji..." -ForegroundColor White
if (Test-Path ".env") {
    Write-Status "Plik .env już istnieje" "Success"
} else {
    if (Test-Path "env-template.txt") {
        Write-Status "Kopiowanie szablonu konfiguracji..." "Info"
        Copy-Item "env-template.txt" ".env"
        Write-Status "Skopiowano env-template.txt do .env" "Success"
        Write-Status "WAŻNE: Skonfiguruj plik .env przed uruchomieniem aplikacji!" "Warning"
    } else {
        Write-Status "Brak pliku konfiguracji .env" "Warning"
        Write-Status "Utwórz plik .env z odpowiednią konfiguracją" "Warning"
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "         Instalacja zakończona!         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nDostępne komendy:" -ForegroundColor White
Write-Host "  npm run dev          - Uruchom w trybie deweloperskim" -ForegroundColor Green
Write-Host "  npm run build        - Zbuduj aplikację do produkcji" -ForegroundColor Green
Write-Host "  npm run start        - Uruchom w trybie produkcyjnym" -ForegroundColor Green
Write-Host "  npm run db:migrate   - Uruchom migracje bazy danych" -ForegroundColor Green
Write-Host "  npm run db:push      - Wypchnij zmiany do bazy danych" -ForegroundColor Green

if (-not (Test-Path ".env")) {
    Write-Host "`n⚠️  PAMIĘTAJ:" -ForegroundColor Yellow
    Write-Host "   1. Skonfiguruj plik .env przed uruchomieniem" -ForegroundColor Yellow
    Write-Host "   2. Uruchom migracje bazy danych: npm run db:migrate" -ForegroundColor Yellow
}

Write-Host "`n🚀 Projekt AutoMentor jest gotowy do użycia!" -ForegroundColor Green
Write-Host ""