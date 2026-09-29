@echo off
title KBase Frontend (Vite React)
echo ===================================================
echo             KBASE FRONTEND STARTUP
echo ===================================================

cd /d "%~dp0frontend"
echo Dang khoi dong Frontend tren port 5173...
npm run dev
pause
