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
echo emidb is starting on http://localhost:%PORT%
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
