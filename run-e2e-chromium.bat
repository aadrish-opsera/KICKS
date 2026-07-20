@echo off
cd /d C:\Users\ADMIN\KICKS
set PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%
set PLAYWRIGHT_BROWSERS_PATH=%USERPROFILE%\AppData\Local\ms-playwright
set PLAYWRIGHT_CHROMIUM_USE_HEADLESS_SHELL=0

echo Keep Vite running at http://127.0.0.1:5173
echo.
echo === Running home-page E2E (headed) ===
node node_modules\@playwright\test\cli.js test e2e\home-page.spec.ts --project=chromium --headed --reporter=line
echo.
echo Exit code: %ERRORLEVEL%
echo.
if %ERRORLEVEL% EQU 0 (
  echo Home-page passed. Press a key to run ALL chromium E2E tests...
  pause >nul
  node node_modules\@playwright\test\cli.js test --project=chromium --reporter=line
  echo.
  echo Full suite exit code: %ERRORLEVEL%
)
pause
