@echo off
echo Starting PostgreSQL 16 Server for KBase...
"%~dp0pgsql\bin\pg_ctl.exe" -D "%~dp0pgsql\data" -l "%~dp0pgsql\logfile" start
"%~dp0pgsql\bin\pg_isready.exe" -h 127.0.0.1 -p 5432 -U postgres
echo PostgreSQL is ready on port 5432!
pause
