@echo off
title Fududeeye Flutter Mobile App
echo ===================================================
echo  Launching Fududeeye Flutter App (iOS / Android / Web)
echo ===================================================

set FLUTTER_BIN=C:\Users\nuurd\OneDrive\Documents\flutter\bin\flutter.bat

if exist "%FLUTTER_BIN%" (
    cd apps\mobile
    "%FLUTTER_BIN%" run
) else (
    echo Flutter not found in default path, trying system PATH...
    cd apps\mobile
    flutter run
)
pause
