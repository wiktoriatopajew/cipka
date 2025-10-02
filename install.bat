@echo off
chcp 65001 >nul
echo ========================================
echo   AutoMentor - Automatyczna Instalacja 
echo ========================================
echo.

echo Sprawdzanie wymagań systemowych...

:: Sprawdź Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nie jest zainstalowany!
    echo    Pobierz z: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js jest zainstalowany
)

:: Sprawdź npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm nie jest zainstalowany!
    pause
    exit /b 1
) else (
    echo ✅ npm jest zainstalowany
)

:: Sprawdź Python (opcjonalnie)
python --version >nul 2>&1
if %errorlevel% neq 0 (
    py --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ⚠️  Python nie jest zainstalowany (opcjonalny)
        set PYTHON_AVAILABLE=false
    ) else (
        echo ✅ Python jest zainstalowany (py)
        set PYTHON_AVAILABLE=true
        set PYTHON_CMD=py
    )
) else (
    echo ✅ Python jest zainstalowany
    set PYTHON_AVAILABLE=true
    set PYTHON_CMD=python
)

echo.
echo ========================================
echo   Instalowanie zależności...
echo ========================================

:: Instaluj zależności Node.js
echo.
echo Instalowanie zależności Node.js...
npm install
if %errorlevel% neq 0 (
    echo ❌ Błąd podczas instalacji npm!
    pause
    exit /b 1
)
echo ✅ Zależności Node.js zainstalowane!

:: Instaluj zależności Python (jeśli dostępne)
if "%PYTHON_AVAILABLE%"=="true" (
    echo.
    echo Instalowanie zależności Python...
    %PYTHON_CMD% -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ⚠️  Błąd podczas instalacji Python (można kontynuować)
    ) else (
        echo ✅ Zależności Python zainstalowane!
    )
) else (
    echo.
    echo Pomijanie instalacji Python (nie jest dostępny)
)

:: Sprawdź konfigurację
echo.
echo Sprawdzanie konfiguracji...
if exist .env (
    echo ✅ Plik .env już istnieje
) else (
    if exist env-template.txt (
        copy env-template.txt .env >nul
        echo ✅ Skopiowano szablon konfiguracji do .env
        echo ⚠️  WAŻNE: Skonfiguruj plik .env przed uruchomieniem!
    ) else (
        echo ⚠️  Brak pliku konfiguracji .env
    )
)

echo.
echo ========================================
echo         Instalacja zakończona!
echo ========================================
echo.
echo Dostępne komendy:
echo   npm run dev          - Uruchom w trybie deweloperskim
echo   npm run build        - Zbuduj aplikację do produkcji
echo   npm run start        - Uruchom w trybie produkcyjnym
echo   npm run db:migrate   - Uruchom migracje bazy danych
echo.

if not exist .env (
    echo ⚠️  PAMIĘTAJ:
    echo    1. Skonfiguruj plik .env przed uruchomieniem
    echo    2. Uruchom migracje bazy danych: npm run db:migrate
    echo.
)

echo 🚀 Projekt AutoMentor jest gotowy do użycia!
echo.
pause