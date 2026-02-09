@echo off
REM MongoDB Backup Script for Windows
REM Creates a backup of the MongoDB database with timestamp

setlocal enabledelayedexpansion

REM Configuration
set BACKUP_DIR=backups
set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_NAME=multiplatform_class_bot_%TIMESTAMP%

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Starting MongoDB backup...
echo Backup name: %BACKUP_NAME%

REM Load MONGODB_URI from .env
for /f "tokens=1,2 delims==" %%a in (.env) do (
    if "%%a"=="MONGODB_URI" set MONGODB_URI=%%b
)

if "%MONGODB_URI%"=="" (
    echo Error: MONGODB_URI not set in .env
    exit /b 1
)

echo Database URI: %MONGODB_URI%

REM Run mongodump
mongodump --uri="%MONGODB_URI%" --out="%BACKUP_DIR%\%BACKUP_NAME%"

if %errorlevel% equ 0 (
    echo Backup completed successfully!
    echo Location: %BACKUP_DIR%\%BACKUP_NAME%
    
    REM Compress backup using tar (Windows 10+)
    echo Compressing backup...
    cd "%BACKUP_DIR%"
    tar -czf "%BACKUP_NAME%.tar.gz" "%BACKUP_NAME%"
    rmdir /s /q "%BACKUP_NAME%"
    cd ..
    
    echo Compressed backup: %BACKUP_DIR%\%BACKUP_NAME%.tar.gz
    echo Backup process completed!
) else (
    echo Backup failed!
    exit /b 1
)

endlocal
