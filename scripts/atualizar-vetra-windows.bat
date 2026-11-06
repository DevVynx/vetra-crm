@echo off
rem Updates Vetra on Windows: double click this file. The work is in win-auxiliar-atualizar.ps1, next to it.
rem Optional: a version after the name (atualizar-vetra-windows.bat 0.2.0) and -Yes to not ask for confirmation.
title Vetra - atualizar
cd /d "%~dp0.."
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0win-auxiliar-atualizar.ps1" %*
set code=%errorlevel%
echo.
pause
exit /b %code%
