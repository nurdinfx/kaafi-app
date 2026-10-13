@echo off
title Fududeeye Backend API (Port 5000)
echo ===================================================
echo  Starting Fududeeye Backend API (Port 5000)...
echo ===================================================

cd /d "%~dp0services\api"
cmd.exe /c "npx tsx src/server.ts"
pause
