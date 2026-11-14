@echo off
cd /d "%~dp0"
title Aether AI Master Launcher

echo ========================================================
echo            AETHER AI - 1-CLICK MASTER LAUNCHER
echo ========================================================
echo.

:: 1. Clear any stuck old server or ngrok process
echo [1/5] Checking port 3500 and ngrok...
taskkill /f /im ngrok.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3500') do (
    taskkill /f /pid %%a >nul 2>&1
)

:: 2. Check and Launch Dedicated Chrome on port 9222
echo [2/5] Checking Chrome on port 9222...
netstat -ano | findstr 9222 >nul
if %ERRORLEVEL% neq 0 (
    echo       Chrome is not running. Launching dedicated Chrome...
    call launch-chrome.bat
    ping -n 3 127.0.0.1 >nul
) else (
    echo       Chrome is already active on port 9222.
)

:: 3. Launch Node.js Bridge Server in its own persistent window
echo [3/5] Starting Bridge Server...
start "Aether AI - Server Window (DO NOT CLOSE)" cmd /k "cd /d "%~dp0" && node server.js"

:: 4. Launch ngrok Tunnel with your permanent domain
echo [4/5] Starting ngrok tunnel (jigsaw-glucose-mankind.ngrok-free.dev)...
start "Aether AI - ngrok Tunnel (DO NOT CLOSE)" cmd /k "ngrok http 3500 --url https://jigsaw-glucose-mankind.ngrok-free.dev"

:: 5. Wait 3 seconds for services to initialize
echo [5/5] Initializing connections...
ping -n 4 127.0.0.1 >nul

:: 6. Open the live public website in browser
echo.
echo ========================================================
echo   SUCCESS! Aether AI is now LIVE on the internet!
echo   Public URL: https://jigsaw-glucose-mankind.ngrok-free.dev
echo   Local URL:  http://localhost:3500
echo ========================================================
start https://jigsaw-glucose-mankind.ngrok-free.dev

ping -n 3 127.0.0.1 >nul
exit
