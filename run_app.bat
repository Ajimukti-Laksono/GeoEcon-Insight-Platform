@echo off
title GeoEcon Insight Runner
echo ========================================================
echo   GEODATA ECONOMIC INTELLIGENCE PLATFORM (GeoEcon Insight)
echo ========================================================
echo.
echo Menjalankan Backend (FastAPI) dan Frontend (Vite)...
echo.

:: Pindah ke direktori tempat file bat berada
cd /d "%~dp0"

:: Jalankan Backend di jendela cmd terpisah
start "GeoEcon Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Tunggu 3 detik
ping 127.0.0.1 -n 3 >nul

:: Jalankan Frontend di jendela cmd terpisah
start "GeoEcon Frontend (Vite)" cmd /k "cd frontend && npm run dev"

:: Tunggu 3 detik
ping 127.0.0.1 -n 3 >nul

:: Buka browser secara otomatis
start http://localhost:5173

echo.
echo [OK] Backend aktif di:  http://127.0.0.1:8000
echo [OK] Frontend aktif di: http://localhost:5173
echo.
echo Browser telah dibuka otomatis. Jendela ini dapat ditutup.
pause
