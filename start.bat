@echo off
echo Starting TISS Reader...
echo.

cd /d "%~dp0"

start cmd /k "npm run dev"

timeout /t 3 /nobreak >nul 2>&1

start http://localhost:5173

echo Done! Open http://localhost:5173 in your browser.
echo Press any key to close this window...
pause >nul 2>&1
