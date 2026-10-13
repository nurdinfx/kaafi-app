@echo off
title Fududeeye Full Stack Marketplace
echo ===================================================
echo  Starting Full Stack Fududeeye (Backend + Web)...
echo ===================================================

start "Fududeeye Backend API :5000" cmd.exe /c "cd /d \"%~dp0services\api\" && npx tsx src/server.ts"
timeout /t 3 /nobreak >nul
start "Fududeeye Web Frontend :3000" cmd.exe /c "cd /d \"%~dp0apps\web\" && npm run dev"

echo Backend started on http://localhost:5000
echo Frontend started on http://localhost:3000
echo Enjoy!
timeout /t 5 >nul
