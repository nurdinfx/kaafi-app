@echo off
title Fududeeye Flutter App (Edge Preview)
echo ===================================================
echo  Starting Fududeeye Mobile Flutter on Microsoft Edge...
echo ===================================================

set FLUTTER_BIN=C:\Users\nuurd\OneDrive\Documents\flutter\bin\flutter.bat

cd apps\mobile
if exist "%FLUTTER_BIN%" (
    "%FLUTTER_BIN%" run -d edge --web-port 8081
) else (
    flutter run -d edge --web-port 8081
)
pause
