@echo off
rem Optional: lets other devices on the local network reach emidb without the
rem Windows Firewall prompt. Right-click and "Run as administrator".
netsh advfirewall firewall add rule name="emidb (Node.js)" dir=in action=allow protocol=TCP localport=3210 profile=private
pause
