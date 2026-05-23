@echo off
title CampusBridge Application Launcher
color 0B

echo =======================================================================
echo           __        __   _                  _             
echo           \ \      / /__| | ___ ___  _ __ ___   ___ 
echo            \ \ /\ / / _ \ |/ __/ _ \| '_ ` _ \ / _ \
echo             \ V  V /  __/ | (_| (_) | | | | | | |  __/
echo              \_/\_/ \___|_|\___\___/|_| |_| |_|\___|
echo                                                           
echo           CAMPUSBRIDGE - ALUMNI REFERENCE SYSTEM LAUNCHER
echo =======================================================================
echo.

:: 1. Checking Prerequisites
echo [*] Checking environment prerequisites...

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js!
    pause
    exit /b 1
)
echo [PASS] Node.js is installed.

where npm >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] npm is not installed. Please install Node.js (which includes npm).
    pause
    exit /b 1
)
echo [PASS] npm is installed.

:: 2. Directory Validation
if not exist "backend" (
    color 0C
    echo [ERROR] Backend folder not found. Please run this in the project root!
    pause
    exit /b 1
)
if not exist "frontend" (
    color 0C
    echo [ERROR] Frontend folder not found. Please run this in the project root!
    pause
    exit /b 1
)
echo [PASS] Folder structure validated.

:: 3. Install Dependencies if needed
echo [*] Checking node_modules...
if not exist "backend\node_modules" (
    echo [*] Installing backend dependencies...
    cd backend && call npm install && cd ..
)
if not exist "frontend\node_modules" (
    echo [*] Installing frontend dependencies...
    cd frontend && call npm install && cd ..
)
echo [PASS] Dependencies verified.

:: 4. Database / Prisma Client Setup
echo [*] Verifying and generating database client (Prisma)...
cd backend
call npx prisma generate
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Prisma Client generation failed!
    cd ..
    pause
    exit /b 1
)

:: 5. Database Connection Check
echo [*] Testing database connection...
call node check-db.js
if %errorlevel% equ 0 goto db_ok

color 0E
echo [WARNING] Database is not reachable!
echo Please make sure your database server is running (e.g., PostgreSQL)
echo and that the DATABASE_URL in backend/.env is correct.
echo.
set /p choice="Do you want to continue anyway? [Y/N]: "
if /I "%choice%" neq "Y" (
    cd ..
    exit /b 1
)
color 0B
goto db_done

:db_ok
echo [PASS] Database connection verified successfully.

:db_done
cd ..

echo.
echo =======================================================================
echo               LAUNCHING APPLICATION CHANNELS
echo =======================================================================
echo.
echo [1/2] Starting Backend Server (Express + Socket.io on Port 5000)...
start "CampusBridge Backend API" cmd /k "cd backend && color 0A && npm run dev"

echo [2/2] Starting Frontend App (Next.js with Turbopack on Port 3000)...
start "CampusBridge Frontend Client" cmd /k "cd frontend && color 0D && npm run dev"

echo.
echo =======================================================================
echo  CampusBridge has been successfully launched!
echo.
echo  - Backend API: http://localhost:5000
echo  - Frontend Client: http://localhost:3000
echo.
echo  Keep this window open. Press any key to stop both servers and exit.
echo =======================================================================
pause >nul

echo [*] Shutting down servers...
taskkill /FI "WINDOWTITLE eq CampusBridge Backend API*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq CampusBridge Frontend Client*" /F >nul 2>nul
echo [PASS] Shutdown complete.
exit
