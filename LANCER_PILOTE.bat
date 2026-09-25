@echo off
title SunuSchool Express - Lancement Mode Pilote Etablissements
color 0B

echo ===================================================================
echo           SUNUSCHOOL EXPRESS - MODE PILOTE ETABLISSEMENTS 
echo    Plateforme SaaS Unifiee Ecoles Privees et Daaras Modernes Senegal
echo ===================================================================
echo.

cd /d "%~dp0"

:: 1. Recuperation de l'adresse IP locale pour acces reseau (Wi-Fi de l'ecole)
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0 ^| findstr /v "127.0.0.1"') do (
    set LOCAL_IP=%%a
    goto :ip_trouvee
)
:ip_trouvee
if "%LOCAL_IP%"=="" set LOCAL_IP=localhost

echo [1/3] Verification de l'environnement...
echo  - Dossier de travail : %~dp0
echo  - Adresse IP detectee : %LOCAL_IP%
echo.

echo [2/3] Verification de Node.js pour l'API backend...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [AVERTISSEMENT] Node.js n'est pas installe dans le PATH.
    echo La plateforme fonctionnera en MODE AUTONOME LOCAL (LocalStorage ACID).
    echo Toutes les donnees saisies seront parfaitement sauvegardees dans votre navigateur.
    echo.
    echo Pour des tests multi-postes complets sur le Wi-Fi, installez Node.js depuis https://nodejs.org/
    echo.
    echo Ouverture de SunuSchool Express...
    start "" "%~dp0index.html"
    goto :fin
)

cd /d "%~dp0backend"
if not exist "node_modules" (
    echo [INFO] Installation des modules Express et CORS...
    call npm install
    echo.
)

echo [3/3] Demarrage du Serveur Node.js sur le port 5000...
echo.
echo ===================================================================
echo   LIENS D'ACCES POUR VOS TESTS EN CONDITIONS REELLES :
echo.
echo   * Sur ce PC (Direction)       : http://localhost:5000/index.html
echo   * Tableau de Bord Central SaaS : http://localhost:5000/dashboard.html
echo   * Depuis smartphone / Wi-Fi   : http://%LOCAL_IP%:5000/index.html
echo ===================================================================
echo.
echo Ouverture automatique de votre Espace SunuSchool Express...
start http://localhost:5000/index.html

call npm start

:fin
echo.
pause
