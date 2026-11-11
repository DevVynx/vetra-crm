@echo off
rem Starts Vetra on Windows: double click this file. The work is in win-auxiliar.ps1, next to it.
title Vetra
cd /d "%~dp0..\.."
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0win-auxiliar.ps1"
if errorlevel 1 (
  echo.
  pause
  exit /b 1
)
timeout /t 5 >nul
