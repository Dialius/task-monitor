@echo off
echo ========================================
echo   Task Monitor Bot - Dashboard Starter
echo ========================================
echo.

echo [1/3] Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

echo.
echo [2/3] Starting Backend API + Bot...
start "Backend API" cmd /k "npm start"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo [3/3] Starting Frontend Dashboard...
start "Frontend Dashboard" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Dashboard is starting!
echo ========================================
echo.
echo Backend API: http://localhost:3001
echo Frontend:    http://localhost:5173
echo.
echo Login credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo Press any key to open dashboard in browser...
pause > nul

start http://localhost:5173

echo.
echo Dashboard opened in browser!
echo.
echo To stop:
echo   - Close the Backend API window
echo   - Close the Frontend Dashboard window
echo.
pause
