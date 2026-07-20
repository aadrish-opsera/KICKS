@echo off
cd /d C:\Users\ADMIN\KICKS
set PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%
set PLAYWRIGHT_BROWSERS_PATH=%USERPROFILE%\AppData\Local\ms-playwright
set PLAYWRIGHT_CHROMIUM_USE_HEADLESS_SHELL=0

REM Unique log in TEMP so Cursor/IDE cannot lock it
set LOG=%TEMP%\kicks-e2e-%RANDOM%.log

echo Keep Vite at http://127.0.0.1:5173
echo.
echo === Smoke E2E (output on screen + %LOG%) ===
echo.

node node_modules\@playwright\test\cli.js test e2e\smoke.spec.ts --project=chromium --headed --reporter=line --timeout=30000 1>%LOG% 2>&1
set EXITCODE=%ERRORLEVEL%

echo ----- log start -----
type "%LOG%"
echo ----- log end -----
echo.
echo Exit code: %EXITCODE%
echo Log file: %LOG%
echo.
pause
