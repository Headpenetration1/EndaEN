@echo off
REM 🚀 Henteklar Vercel Deployment Script for Windows
REM Dette scriptet deployer Henteklar til Vercel automatisk

echo 🚀 Deployer Henteklar til Vercel...
echo.

REM Sjekk om vercel CLI er installert
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Vercel CLI er ikke installert.
    echo 📦 Installerer Vercel CLI globalt...
    call npm install -g vercel
    echo ✅ Vercel CLI installert!
    echo.
)

REM Sjekk om node_modules finnes
if not exist "node_modules" (
    echo 📦 Installerer avhengigheter...
    call npm install
    echo ✅ Avhengigheter installert!
    echo.
)

REM Deploy til Vercel
echo 🚀 Starter deployment til Vercel...
echo.
call vercel --prod

echo.
echo ✅ Deployment fullført!
echo.
echo 🌐 Åpne URL-en ovenfor for å se nettsiden!
echo.
echo 🔐 Logg inn med:
echo    E-post: staff@barnehagen.no
echo    Passord: password123
echo.
echo 🎉 Henteklar er nå live!
echo.
pause
