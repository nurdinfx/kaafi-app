@echo off
title Fududeeye Flutter App (Chrome / Web Preview)
echo ===================================================
echo  Starting Fududeeye Mobile Flutter on Chrome...
echo ===================================================

set FLUTTER_BIN=C:\Users\nuurd\OneDrive\Documents\flutter\bin\flutter.bat

cd apps\mobile
if exist "%FLUTTER_BIN%" (
    "%FLUTTER_BIN%" run -d chrome --web-port 8080
) else (
    flutter run -d chrome --web-port 8080
)
pause
