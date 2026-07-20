@echo off
cd /d C:\Users\ADMIN\KICKS
set PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%
set PLAYWRIGHT_BROWSERS_PATH=%USERPROFILE%\AppData\Local\ms-playwright
set PLAYWRIGHT_CHROMIUM_USE_HEADLESS_SHELL=0

echo === Check Vite ===
curl -s -o NUL -w "HTTP %%{http_code}\n" http://127.0.0.1:5173/
echo.

echo === Launch Chromium only (no test runner) ===
node scripts\check-playwright-chrome.mjs
echo Exit: %ERRORLEVEL%
pause
