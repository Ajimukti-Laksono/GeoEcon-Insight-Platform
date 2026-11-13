Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  GEODATA ECONOMIC INTELLIGENCE PLATFORM (GeoEcon Insight)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Periksa Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js tidak ditemukan. Pasang Node.js 18+ terlebih dahulu." -ForegroundColor Red
    Pause
    Exit 1
}

# 2. Periksa dependensi frontend
if (-not (Test-Path "$scriptDir\frontend\node_modules")) {
    Write-Host "Memasang dependensi frontend (npm install)..." -ForegroundColor Yellow
    cmd /c "npm --prefix `"$scriptDir\frontend`" install"
}

# 3. Jalankan Backend melalui run_backend.bat
Write-Host "Menjalankan Backend (FastAPI)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$scriptDir\backend`" && call run_backend.bat"

# 4. Jalankan Frontend (Vite)
Write-Host "Menjalankan Frontend (Vite)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$scriptDir\frontend`" && npm run dev"

# 5. Tunggu hingga Backend siap (Healthcheck)
Write-Host "Menunggu Backend aktif di http://127.0.0.1:8000 ..." -ForegroundColor Cyan
$maxAttempts = 30
$attempts = 0
$backendReady = $false

while ($attempts -lt $maxAttempts) {
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -Method Get -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.status -eq "healthy") {
            $backendReady = $true
            break
        }
    } catch {
        # Backend belum siap
    }
    Start-Sleep -Seconds 1
    $attempts++
}

if ($backendReady) {
    Write-Host "[OK] Backend siap! Membuka browser..." -ForegroundColor Green
} else {
    Write-Host "[PERINGATAN] Backend memerlukan waktu lebih lama untuk inisialisasi." -ForegroundColor DarkYellow
}

Start-Sleep -Milliseconds 800

# 6. Buka Browser
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host " [OK] Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host " [OK] Backend:  http://127.0.0.1:8000 (Swagger: /docs)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Browser telah terbuka secara otomatis." -ForegroundColor Cyan
