@echo off
echo ========================================================
echo KBase PostgreSQL Interactive Console (psql)
echo Connected to: kbasedb on 127.0.0.1:5432
echo Useful commands:
echo   \dt                - List all tables
echo   \d [table_name]    - Describe table structure
echo   SELECT * FROM users;
echo   SELECT * FROM projects;
echo   SELECT * FROM documents;
echo   \q                 - Quit
echo ========================================================
"%~dp0pgsql\bin\psql.exe" -h 127.0.0.1 -p 5432 -U postgres -d kbasedb
