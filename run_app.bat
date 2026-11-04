@echo off
setlocal
title GeoEcon Insight
cd /d "%~dp0"

echo Starting GeoEcon Insight...
echo.

where py >nul 2>nul
if not errorlevel 1 goto python_ok
python --version >nul 2>nul
if not errorlevel 1 goto python_ok
if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" goto python_ok

echo ERROR: Python 3 was not found.
echo Install Python 3.10 or newer, then run this file again.
echo During installation, enable "Add Python to PATH".
echo.
pause
exit /b 1

:python_ok
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js was not found. Install Node.js 18 or newer.
  pause
  exit /b 1
)

if not exist "frontend\node_modules" (
  echo Installing frontend dependencies...
  call npm --prefix frontend install
  if errorlevel 1 goto failed
)

start "GeoEcon Backend" /D "%~dp0backend" cmd /k call run_backend.bat

start "GeoEcon Frontend" /D "%~dp0frontend" cmd /k npm.cmd run dev
echo Menunggu backend aktif di http://127.0.0.1:8000 ...
set /a attempts=0
:wait_backend
curl.exe -s http://127.0.0.1:8000/api/health >nul 2>nul
if not errorlevel 1 goto services_ready
set /a attempts+=1
if %attempts% gtr 30 goto services_ready
timeout /t 1 /nobreak >nul
goto wait_backend

:services_ready
timeout /t 1 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo Frontend: http://localhost:5173
echo Backend:  http://127.0.0.1:8000/docs
exit /b 0

:failed
echo.
echo Startup failed. Check the error above.
pause
exit /b 1
