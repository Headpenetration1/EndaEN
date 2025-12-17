#!/bin/bash

# 🚀 Henteklar Vercel Deployment Script
# Dette scriptet deployer Henteklar til Vercel automatisk

echo "🚀 Deployer Henteklar til Vercel..."
echo ""

# Sjekk om vercel CLI er installert
if ! command -v vercel &> /dev/null
then
    echo "⚠️  Vercel CLI er ikke installert."
    echo "📦 Installerer Vercel CLI globalt..."
    npm install -g vercel
    echo "✅ Vercel CLI installert!"
    echo ""
fi

# Sjekk om node_modules finnes
if [ ! -d "node_modules" ]; then
    echo "📦 Installerer avhengigheter..."
    npm install
    echo "✅ Avhengigheter installert!"
    echo ""
fi

# Deploy til Vercel
echo "🚀 Starter deployment til Vercel..."
echo ""
vercel --prod

echo ""
echo "✅ Deployment fullført!"
echo ""
echo "🌐 Åpne URL-en ovenfor for å se nettsiden!"
echo ""
echo "🔐 Logg inn med:"
echo "   E-post: staff@barnehagen.no"
echo "   Passord: password123"
echo ""
echo "🎉 Henteklar er nå live!"
