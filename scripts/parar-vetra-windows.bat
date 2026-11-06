@echo off
rem Stops Vetra for good (containers and network are removed, so it does not come back by itself). The data stays in its volumes (never -v); run iniciar-vetra-windows.bat to start it again.
title Vetra
cd /d "%~dp0.."
docker compose -f compose.yaml --profile app down
echo.
echo O Vetra foi parado. Para iniciar de novo, abra o iniciar-vetra-windows.
timeout /t 5 >nul
