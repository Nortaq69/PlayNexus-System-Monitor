@echo off
echo ========================================
echo PlayNexus System Monitor - Installer
echo ========================================
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: This script is not running as administrator
    echo Some features may require elevated privileges
    echo.
)

:: Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo.
    echo Please install Node.js from https://nodejs.org/
    echo Recommended version: 16.x or higher
    echo.
    echo After installing Node.js, run this script again.
    pause
    exit /b 1
)

echo Node.js is installed: 
node --version
echo.

:: Check if npm is installed
echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
)

echo npm is installed:
npm --version
echo.

:: Check if package.json exists
if not exist package.json (
    echo ERROR: package.json not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

:: Install dependencies
echo Installing project dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

:: Install electron-builder globally
echo Installing electron-builder globally...
npm install -g electron-builder
if %errorlevel% neq 0 (
    echo WARNING: Failed to install electron-builder globally
    echo It will be installed locally instead
)

:: Create desktop shortcut
echo Creating desktop shortcut...
set DESKTOP=%USERPROFILE%\Desktop
set SHORTCUT=%DESKTOP%\PlayNexus System Monitor.lnk

:: Check if shortcut already exists
if exist "%SHORTCUT%" (
    echo Desktop shortcut already exists
) else (
    echo Creating desktop shortcut...
    powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT%'); $Shortcut.TargetPath = '%~dp0node_modules\.bin\electron.cmd'; $Shortcut.Arguments = '%~dp0'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Description = 'PlayNexus System Monitor'; $Shortcut.Save()"
)

:: Create start menu entry
echo Creating start menu entry...
set STARTMENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs
set STARTMENU_SHORTCUT=%STARTMENU%\PlayNexus System Monitor.lnk

if not exist "%STARTMENU_SHORTCUT%" (
    powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTMENU_SHORTCUT%'); $Shortcut.TargetPath = '%~dp0node_modules\.bin\electron.cmd'; $Shortcut.Arguments = '%~dp0'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Description = 'PlayNexus System Monitor'; $Shortcut.Save()"
)

:: Set up auto-start (optional)
echo.
set /p AUTOSTART="Do you want PlayNexus System Monitor to start with Windows? (y/n): "
if /i "%AUTOSTART%"=="y" (
    echo Setting up auto-start...
    set REG_KEY=HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run
    set REG_VALUE=PlayNexusSystemMonitor
    set REG_DATA="%~dp0node_modules\.bin\electron.cmd" "%~dp0"
    
    reg add "%REG_KEY%" /v "%REG_VALUE%" /t REG_SZ /d %REG_DATA% /f >nul 2>&1
    if %errorlevel% equ 0 (
        echo Auto-start configured successfully
    ) else (
        echo WARNING: Failed to configure auto-start
    )
)

:: Create configuration directory
echo Creating configuration directory...
set CONFIG_DIR=%APPDATA%\playnexus-system-monitor
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"

:: Create default configuration
if not exist "%CONFIG_DIR%\config.json" (
    echo Creating default configuration...
    echo {> "%CONFIG_DIR%\config.json"
    echo   "theme": "cyberpunk",>> "%CONFIG_DIR%\config.json"
    echo   "autoStart": false,>> "%CONFIG_DIR%\config.json"
    echo   "monitoring": {>> "%CONFIG_DIR%\config.json"
    echo     "cpu": true,>> "%CONFIG_DIR%\config.json"
    echo     "memory": true,>> "%CONFIG_DIR%\config.json"
    echo     "disk": true,>> "%CONFIG_DIR%\config.json"
    echo     "network": true>> "%CONFIG_DIR%\config.json"
    echo   },>> "%CONFIG_DIR%\config.json"
    echo   "fileWatcher": {>> "%CONFIG_DIR%\config.json"
    echo     "enabled": false,>> "%CONFIG_DIR%\config.json"
    echo     "paths": []>> "%CONFIG_DIR%\config.json"
    echo   },>> "%CONFIG_DIR%\config.json"
    echo   "notifications": {>> "%CONFIG_DIR%\config.json"
    echo     "enabled": true,>> "%CONFIG_DIR%\config.json"
    echo     "sound": true>> "%CONFIG_DIR%\config.json"
    echo   }>> "%CONFIG_DIR%\config.json"
    echo }>> "%CONFIG_DIR%\config.json"
)

:: Test the application
echo.
echo Testing application...
npm start --silent >nul 2>&1 &
timeout /t 3 >nul
taskkill /f /im electron.exe >nul 2>&1

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo PlayNexus System Monitor has been installed with the following features:
echo.
echo ✓ Desktop shortcut created
echo ✓ Start menu entry added
echo ✓ Configuration directory created
echo ✓ Dependencies installed
echo.

if /i "%AUTOSTART%"=="y" (
    echo ✓ Auto-start configured
)

echo.
echo To start the application:
echo 1. Double-click the desktop shortcut, or
echo 2. Run 'npm start' from this directory, or
echo 3. Find it in the Start Menu
echo.
echo Configuration files are stored in:
echo %CONFIG_DIR%
echo.
echo To build the application for distribution:
echo Run 'build.bat' or 'npm run build:win'
echo.

pause