@echo off
title CampusBridge - Integrated Launcher
color 0B

echo =======================================================================
echo           __        __   _                  _             
echo           \ \      / /__| | ___ ___  _ __ ___   ___ 
echo            \ \ /\ / / _ \ |/ __/ _ \| '_ ` _ \ / _ \
9:             \ V  V /  __/ | (_| (_) | | | | | | |  __/
10:             \_/\_/ \___|_|\___\___/|_| |_| |_|\___|
echo.                                                           
echo        CAMPUSBRIDGE: INTEGRATED DEVELOPMENT LAUNCHER
echo =======================================================================
echo.

:: 1. Verify environment
echo [*] Verifying Node.js and npm environments...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not found in your system PATH. Please install Node.js!
    pause
    exit /b 1
)
echo [PASS] Node.js environment detected.

:: 2. Verify folders
if not exist "backend" (
    color 0C
    echo [ERROR] 'backend' folder not found. Please place this launcher in the root workspace!
    pause
    exit /b 1
)
if not exist "frontend" (
    color 0C
    echo [ERROR] 'frontend' folder not found. Please place this launcher in the root workspace!
    pause
    exit /b 1
)

:: 3. Automatically restore packages if missing
echo [*] Checking node_modules...
if not exist "backend\node_modules" (
    echo [*] Installing backend dependencies (this may take a moment)...
    cmd /c "cd backend && npm install"
)
if not exist "frontend\node_modules" (
    echo [*] Installing frontend dependencies (this may take a moment)...
    cmd /c "cd frontend && npm install"
)
echo [PASS] Dependencies verified.

:: 4. Generate Prisma Client
echo [*] Initializing database client...
cmd /c "cd backend && npx prisma generate"
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Failed to generate database client. Please verify backend/.env!
    pause
    exit /b 1
)

:: 5. Test Database Connection
echo [*] Verifying PostgreSQL database server status...
cmd /c "cd backend && node check-db.js"
if %errorlevel% neq 0 (
    color 0E
    echo [WARNING] Database connection failed or is unreachable!
    echo Please ensure the Supabase/PostgreSQL connection string in backend/.env is correct.
    echo.
    set /p choice="Do you want to launch the servers anyway? [Y/N]: "
    if /I "%choice%" neq "Y" exit /b 1
)

:: 6. Launch applications in separate windows
color 0A
echo.
echo =======================================================================
echo               LAUNCHING CAMPUSBRIDGE SERVICES
echo =======================================================================
echo [*] Starting Backend Server (Express on http://localhost:5000)...
start "CampusBridge Backend API" cmd /k "cd backend && color 0A && cmd /c \"npm run dev\""

echo [*] Starting Frontend App (Next.js on http://localhost:3000)...
start "CampusBridge Frontend Client" cmd /k "cd frontend && color 0D && cmd /c \"npm run dev\""

echo.
echo =======================================================================
echo  CampusBridge successfully initiated!
echo  - Frontend URL: http://localhost:3000
echo  - Backend API: http://localhost:5000
echo =======================================================================
echo.
echo  LOGIN TEST CREDENTIALS (Password: 123456):
echo  - SUPER_ADMIN:   superadmin@test.com
echo  - COLLEGE_ADMIN: admin@abc.com
echo  - STUDENT:       student1@abc.com
echo  - ALUMNI:        alumni1@abc.com
echo =======================================================================
echo.
echo  Keep this window open. Press any key to stop all servers and exit.
pause >nul

echo [*] Stopping servers...
taskkill /FI "WINDOWTITLE eq CampusBridge Backend API*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq CampusBridge Frontend Client*" /F >nul 2>nul
echo [PASS] All services successfully stopped.
exit
