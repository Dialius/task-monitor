@echo off
echo ========================================
echo   Task Monitor Bot - Restart Script
echo ========================================
echo.

echo [1/4] Stopping running bot processes...
taskkill /F /IM node.exe /T 2>nul
if %ERRORLEVEL% EQU 0 (
    echo   ^> Bot processes stopped
) else (
    echo   ^> No running bot processes found
)
echo.

echo [2/4] Waiting for processes to close...
timeout /t 3 /nobreak >nul
echo   ^> Ready to rebuild
echo.

echo [3/4] Building project...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo   ERROR: Build failed!
    echo ========================================
    echo   Please check the errors above and fix them.
    echo.
    pause
    exit /b 1
)
echo   ^> Build successful
echo.

echo [4/4] Starting bot...
echo   ^> Bot is starting in a new window...
echo.
start "Task Monitor Bot" cmd /k "npm start"

echo ========================================
echo   Bot restarted successfully!
echo ========================================
echo.
echo   Check the new window for bot logs.
echo   Press any key to close this window...
echo.
pause >nul
