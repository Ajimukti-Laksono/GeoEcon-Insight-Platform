@echo off
setlocal
cd /d "%~dp0"

:: 1. Periksa apakah .venv sudah ada dan berfungsi normal
if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" -c "import pandas, numpy, fastapi, uvicorn" >nul 2>nul
  if not errorlevel 1 (
    set "PYTHON=.venv\Scripts\python.exe"
    goto start_uvicorn
  )
  echo Lingkungan .venv lama bermasalah. Memperbarui...
  rmdir /s /q .venv >nul 2>nul
)

:: 2. Prioritaskan Python stabil di PATH (contoh: Python 3.10)
where python >nul 2>nul
if not errorlevel 1 (
  python -c "import sys; assert sys.version_info >= (3, 9)" >nul 2>nul
  if not errorlevel 1 (
    echo Menyiapkan virtual environment dengan Python...
    python -m venv --system-site-packages .venv
    if exist ".venv\Scripts\python.exe" (
      set "PYTHON=.venv\Scripts\python.exe"
      goto check_deps
    )
  )
)

:: 3. Coba py launcher versi stabil
for %%V in (-3.12 -3.11 -3.10 -3) do (
  py %%V -c "import sys" >nul 2>nul
  if not errorlevel 1 (
    echo Menyiapkan virtual environment dengan py %%V...
    py %%V -m venv --system-site-packages .venv >nul 2>nul
    if exist ".venv\Scripts\python.exe" (
      set "PYTHON=.venv\Scripts\python.exe"
      goto check_deps
    )
  )
)

:: 4. Fallback langsung menggunakan python di PATH
where python >nul 2>nul
if not errorlevel 1 (
  set "PYTHON=python"
  goto check_deps
)

echo ERROR: Python 3.10+ tidak ditemukan.
echo Harap pasang Python 3.10 atau versi stabil lainnya dan aktifkan "Add Python to PATH".
pause
exit /b 1

:check_deps
"%PYTHON%" -c "import fastapi, uvicorn, pandas, numpy" >nul 2>nul
if errorlevel 1 (
  echo Memasang dependensi backend (fastapi, uvicorn, pandas, numpy)...
  "%PYTHON%" -m pip install -r requirements.txt
  if errorlevel 1 (
    echo Gagal memasang dependensi backend.
    pause
    exit /b 1
  )
)

:start_uvicorn
echo ========================================================
echo   GeoEcon Backend berjalan di http://127.0.0.1:8000
echo   Dokumentasi API: http://127.0.0.1:8000/docs
echo ========================================================
"%PYTHON%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
exit /b %errorlevel%
