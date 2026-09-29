@echo off
title KBase System Stopper
echo ===================================================
echo              DANG DUNG TOAN BO HE THONG
echo ===================================================

echo Dang dung Frontend (Node.js)...
taskkill /f /im node.exe 2>nul

echo Dang dung Backend (Java)...
taskkill /f /im java.exe 2>nul

echo Dang dung PostgreSQL...
"%~dp0pgsql\bin\pg_ctl.exe" -D "%~dp0pgsql\data" stop -m fast 2>nul
taskkill /f /im postgres.exe 2>nul

echo ===================================================
echo        DA DUNG TOAN BO HE THONG KBASE!
echo ===================================================
pause
