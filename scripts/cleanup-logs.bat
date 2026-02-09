@echo off
REM Log Cleanup Script for Windows
REM Removes log files older than specified days

setlocal enabledelayedexpansion

REM Configuration
set LOG_DIR=logs
set DAYS_TO_KEEP=30

echo Starting log cleanup...
echo Log directory: %LOG_DIR%
echo Keeping logs from last %DAYS_TO_KEEP% days

if not exist "%LOG_DIR%" (
    echo Log directory does not exist: %LOG_DIR%
    exit /b 1
)

REM Count files before cleanup
set BEFORE_COUNT=0
for %%f in ("%LOG_DIR%\*.log") do set /a BEFORE_COUNT+=1
echo Total log files before cleanup: %BEFORE_COUNT%

REM Remove old log files (older than DAYS_TO_KEEP)
forfiles /p "%LOG_DIR%" /s /m *.log /d -%DAYS_TO_KEEP% /c "cmd /c del @path" 2>nul

REM Count files after cleanup
set AFTER_COUNT=0
for %%f in ("%LOG_DIR%\*.log") do set /a AFTER_COUNT+=1

set /a DELETED_COUNT=%BEFORE_COUNT%-%AFTER_COUNT%
echo Deleted %DELETED_COUNT% log files
echo Remaining log files: %AFTER_COUNT%

echo Log cleanup completed!

endlocal
