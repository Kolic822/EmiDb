@echo off
setlocal
cd /d "%~dp0"
title emidb

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 or newer is required. Download it from https://nodejs.org and run this file again.
  pause
  exit /b 1
)

rem In a git checkout, pick up new versions from GitHub automatically (skipped when offline).
if exist ".git" call update.bat :update

if not exist "apps\api\dist\main.js" (
  echo First start: installing dependencies and building the app. This takes a few minutes...
  call npm install --no-audit --no-fund || goto :fail
  call npm run build || goto :fail
) else if not exist "node_modules" (
  echo First start: installing runtime dependencies. This needs an internet connection...
  call npm install --omit=dev --no-audit --no-fund || goto :fail
)

if "%PORT%"=="" set PORT=3210
echo.
echo emidb is starting. The addresses to use are printed below.
echo On a tablet or another computer on the same Wi-Fi, open the "On this network" address.
echo If Windows asks whether Node.js may accept connections, allow it on private networks.
echo Keep this window open while you use the app. Close it to stop.
echo.
start "" /b cmd /c "timeout /t 3 >nul && start http://localhost:%PORT%"
node apps\api\dist\main.js
goto :eof

:fail
echo.
echo Something went wrong, see the messages above.
pause
exit /b 1
