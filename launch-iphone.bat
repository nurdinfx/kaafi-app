@echo off
title Fududeeye iPhone Simulator
echo ===================================================
echo  Furaya Fududeeye iPhone Standalone Screen...
echo ===================================================

where msedge >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start "" msedge.exe --app="http://localhost:3000/preview" --window-size=415,890
) else (
    start "" chrome.exe --app="http://localhost:3000/preview" --window-size=415,890
)
