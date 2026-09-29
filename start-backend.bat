@echo off
title KBase Backend (Spring Boot)
echo ===================================================
echo           KBASE BACKEND STARTUP (JDK 21)
echo ===================================================

set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

cd /d "%~dp0backend"
echo Dang khoi dong Spring Boot Backend tren port 8080...
java -jar target\kbase-backend-1.0.0.jar
pause
