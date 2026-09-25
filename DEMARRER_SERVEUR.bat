@echo off
title SunuSchool Express - Serveur API Backend
color 0A
echo ===================================================
echo   SunuSchool Express - Demarrage du Serveur API
echo ===================================================
echo.

cd /d "%~dp0backend"

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [INFO] Node.js n'est pas detecte dans le PATH systeme.
    echo Pour activer l'API REST persistante sur le port 5000 :
    echo 1. Installez Node.js depuis https://nodejs.org/
    echo 2. Relancez ce script.
    echo.
    echo Note : Le Dashboard fonctionne parfaitement en mode autonome
    echo avec le stockage securise integre (LocalStorage ACID).
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installation des dependances Express et CORS...
    call npm install
    echo.
)

echo Demarrage de l'API SunuSchool Express sur le port 5000...
echo API Health: http://localhost:5000/api/health
echo Ouverture automatique du Dashboard : http://localhost:5000/dashboard.html
echo.
start http://localhost:5000/dashboard.html
call npm start

pause
