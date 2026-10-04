@echo off
setlocal
cd /d "%~dp0.."
if errorlevel 1 goto failed

git add .
if errorlevel 1 goto failed
git diff --cached --quiet
if errorlevel 2 goto failed
if errorlevel 1 (
  git commit -m "Build Campus Relay growth lab"
  if errorlevel 1 goto failed
)
git branch -M main
if errorlevel 1 goto failed

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  git remote add origin https://github.com/glitch4560/Build-Campus-Relay-growth-lab.git
) else (
  git remote set-url origin https://github.com/glitch4560/Build-Campus-Relay-growth-lab.git
)
if errorlevel 1 goto failed

git push -u origin main
if errorlevel 1 goto failed
echo.
echo Push completed: https://github.com/glitch4560/Build-Campus-Relay-growth-lab
pause
exit /b 0

:failed
echo.
echo Git could not finish. Copy the error above and share it with Codex.
pause
exit /b 1
