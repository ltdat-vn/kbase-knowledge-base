@echo off
title KBase System Launcher
echo ===================================================
echo       KBASE KNOWLEDGE BASE - TOAN BO HE THONG
echo ===================================================

echo [1/3] Dang khoi dong PostgreSQL Database tren port 5432...
start "KBase PostgreSQL" cmd /c "%~dp0pgsql\bin\postgres.exe -D %~dp0pgsql\data"
timeout /t 3 /nobreak >nul

echo [2/3] Dang khoi dong Spring Boot Backend (JDK 21) tren port 8080...
start "KBase Backend" cmd /k "title KBase Backend && set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot&& set PATH=%%JAVA_HOME%%\bin;%%PATH%%&& cd /d %~dp0backend && java -jar target\kbase-backend-1.0.0.jar"
timeout /t 6 /nobreak >nul

echo [3/3] Dang khoi dong Frontend (React Vite) tren port 5173...
start "KBase Frontend" cmd /k "title KBase Frontend && cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo  HE THONG DA DUOC KHOI DONG!
echo  - Frontend (Giao dien):  http://localhost:5173
echo  - Backend (API/Swagger): http://localhost:8080/swagger-ui/index.html
echo  - Database PostgreSQL:   127.0.0.1:5432
echo ===================================================
echo Nhan phim bat ky de mo trinh duyet...
pause >nul
start http://localhost:5173
