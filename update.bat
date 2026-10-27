@echo off
setlocal
cd /d "%~dp0"
title emidb update
rem Pulls the latest version from GitHub and rebuilds. Your data (apps\api\data) is untouched.
rem start.bat calls this as "update.bat :update" to run the check without pausing.
if "%~1"==":update" (call :update & exit /b %ERRORLEVEL%)
call :update
pause
exit /b %ERRORLEVEL%

:update
where git >nul 2>nul || (echo Git is not installed; download it from https://git-scm.com and try again. & exit /b 1)
if not exist ".git" (echo This folder is not a git checkout; clone the repository instead of copying it. & exit /b 1)
echo Checking GitHub for a newer version...
git fetch --quiet origin || (echo Could not reach GitHub, keeping the current version. & exit /b 0)
for /f %%i in ('git rev-parse HEAD') do set "LOCAL=%%i"
for /f %%i in ('git rev-parse origin/main') do set "REMOTE=%%i"
if "%LOCAL%"=="%REMOTE%" (echo Already up to date. & exit /b 0)
echo Updating...
git pull --ff-only --quiet origin main || (echo Update failed, keeping the current version. & exit /b 1)
call npm install --no-audit --no-fund || exit /b 1
call npm run build || exit /b 1
echo Updated to the latest version.
exit /b 0
