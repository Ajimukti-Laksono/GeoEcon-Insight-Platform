Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  GEODATA ECONOMIC INTELLIGENCE PLATFORM (GeoEcon Insight)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Menjalankan Backend (FastAPI) dan Frontend (Vite)..." -ForegroundColor Yellow

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Jalankan Backend
Start-Process cmd -ArgumentList "/k cd /d `"$scriptDir\backend`" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Start-Sleep -Seconds 3

# 2. Jalankan Frontend
Start-Process cmd -ArgumentList "/k cd /d `"$scriptDir\frontend`" && npm run dev"

Start-Sleep -Seconds 3

# 3. Buka Browser
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "[OK] Backend aktif di:  http://127.0.0.1:8000 (Swagger: /docs)" -ForegroundColor Green
Write-Host "[OK] Frontend aktif di: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Browser telah terbuka secara otomatis." -ForegroundColor Cyan
