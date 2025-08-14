@echo off
echo ================================
echo QASD Performance Fix Script
echo ================================

cd /d "c:\Users\GIGABYTE\Desktop\QASD"

echo.
echo [1/7] Backing up current package.json...
copy package.json package.backup.json

echo.
echo [2/7] Replacing with optimized package.json...
copy package-optimized.json package.json

echo.
echo [3/7] Removing node_modules and package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo [4/7] Installing optimized dependencies...
npm install --no-audit --no-fund

echo.
echo [5/7] Starting backend server in a new window...
start "QASD Backend" cmd /c "cd backend && npm start"

echo.
echo [6/7] Waiting 5 seconds for backend to start...
timeout /t 5

echo.
echo [7/7] Starting frontend development server...
echo Frontend will open in browser at http://localhost:5173
echo Backend API is running at http://localhost:5000

npm run dev

pause