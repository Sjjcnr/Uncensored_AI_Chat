@echo off
title Venice Bridge - Dedicated Chrome
echo ========================================================
echo Launching Dedicated Chrome with Remote Debugging (Port 9222)
echo Profile directory: %LOCALAPPDATA%\VeniceBridgeProfile
echo ========================================================

set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist %CHROME_PATH% (
    set CHROME_PATH="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

start "" %CHROME_PATH% --remote-debugging-port=9222 --user-data-dir="%LOCALAPPDATA%\VeniceBridgeProfile" https://venice.ai/chat/classic
echo Chrome launched. Using Venice Classic Chat in Guest Mode.
