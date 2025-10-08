#!/bin/bash

echo "🚀 Przygotowywanie AutoMentor do wdrożenia na Render..."

# Sprawdź czy jesteś w głównym katalogu projektu
if [ ! -f "package.json" ]; then
    echo "❌ Błąd: Uruchom skrypt z głównego katalogu projektu"
    exit 1
fi

echo "📦 Instalowanie zależności..."
npm install

echo "🔨 Budowanie aplikacji..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build zakończony sukcesem!"
    echo ""
    echo "📋 Następne kroki:"
    echo "1. Wgraj kod na GitHub"
    echo "2. Utwórz PostgreSQL database na Render.com"
    echo "3. Utwórz Web Service na Render.com"
    echo "4. Ustaw environment variables (patrz .env.render)"
    echo "5. Deploy!"
    echo ""
    echo "📚 Szczegóły: RENDER_DEPLOY.md"
else
    echo "❌ Build nieudany! Sprawdź błędy powyżej"
    exit 1
fi