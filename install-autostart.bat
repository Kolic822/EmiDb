@echo off
setlocal
cd /d "%~dp0"
rem Puts a shortcut to start.bat into the current user's Startup folder, so emidb
rem starts (minimised) whenever this Windows user logs in. Run again to refresh;
rem delete the shortcut from shell:startup to undo.
set "SHORTCUT=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\emidb.lnk"
powershell -NoProfile -Command ^
  "$s = (New-Object -ComObject WScript.Shell).CreateShortcut('%SHORTCUT%');" ^
  "$s.TargetPath = '%~dp0start.bat';" ^
  "$s.WorkingDirectory = '%~dp0';" ^
  "$s.WindowStyle = 7;" ^
  "$s.Description = 'Start emidb';" ^
  "$s.Save()"
if errorlevel 1 (
  echo Could not create the shortcut.
) else (
  echo emidb will now start automatically when you log in to Windows.
  echo Shortcut: %SHORTCUT%
)
pause
