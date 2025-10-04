@echo off
echo 🌌 Starting A World Away - Exoplanet Explorer Backend 🌌
echo.

cd /d "%~dp0"

echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo ✅ Python found

echo Installing required packages...
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ❌ Failed to install packages
    pause
    exit /b 1
)

echo ✅ Packages installed successfully

echo.
echo 🚀 Starting the server...
echo.
echo The server will be available at:
echo 🌐 http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

python app.py

pause