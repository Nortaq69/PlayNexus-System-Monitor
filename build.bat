@echo off
echo ========================================
echo PlayNexus System Monitor - Build Script
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo npm version:
npm --version
echo.

:: Install dependencies
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

:: Install electron-builder globally if not present
echo Checking electron-builder...
npm list -g electron-builder >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing electron-builder globally...
    npm install -g electron-builder
)

:: Clean previous builds
echo Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist node_modules\.cache rmdir /s /q node_modules\.cache

:: Build the application
echo.
echo Building PlayNexus System Monitor...
echo.

:: Development build
echo 1. Creating development build...
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Development build failed
    pause
    exit /b 1
)

:: Windows installer
echo.
echo 2. Creating Windows installer...
npm run build:win
if %errorlevel% neq 0 (
    echo ERROR: Windows build failed
    pause
    exit /b 1
)

:: Portable version
echo.
echo 3. Creating portable version...
npm run dist
if %errorlevel% neq 0 (
    echo ERROR: Portable build failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Build outputs:
echo - dist/PlayNexus System Monitor Setup.exe (Installer)
echo - dist/PlayNexus System Monitor.exe (Portable)
echo - dist/win-unpacked/ (Unpacked application)
echo.

:: Open dist folder
echo Opening dist folder...
start dist

echo Build process completed!
pause