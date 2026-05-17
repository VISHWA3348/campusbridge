@echo off
echo Starting Alumni Reference System Backend...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Starting Alumni Reference System Frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Application servers are starting in new windows!
