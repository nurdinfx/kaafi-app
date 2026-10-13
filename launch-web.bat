@echo off
title Fududeeye Web Marketplace (Port 3000)
echo ===================================================
echo  Starting Fududeeye Web Next.js (Port 3000)...
echo ===================================================

cd /d "%~dp0apps\web"
cmd.exe /c "npm run dev"
pause
