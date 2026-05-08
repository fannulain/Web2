$ScriptDir = $PSScriptRoot

Write-Host "Starting project..." -ForegroundColor Cyan

Write-Host "[1/4] Starting RabbitMQ and MinIO..." -ForegroundColor Yellow
Set-Location -Path $ScriptDir
docker-compose up -d

Write-Host "Waiting 20 seconds for containers to fully start..." -ForegroundColor Cyan
Start-Sleep -Seconds 20

Write-Host "[2/4] Starting Node.js API..." -ForegroundColor Yellow
Start-Process powershell -WorkingDirectory "$ScriptDir\backend" -ArgumentList "-NoExit", "-Command", "npm start"
Start-Sleep -Seconds 2

Write-Host "[3/4] Starting Python Worker..." -ForegroundColor Yellow
Start-Process powershell -WorkingDirectory "$ScriptDir\python-worker" -ArgumentList "-NoExit", "-Command", "& .\venv\Scripts\python.exe worker.py"
Start-Sleep -Seconds 2

Write-Host "[4/4] Starting Frontend Dev Server..." -ForegroundColor Yellow
Start-Process powershell -WorkingDirectory "$ScriptDir\frontend" -ArgumentList "-NoExit", "-Command", "npx vite"

Write-Host ""
Write-Host "All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host "  Backend API: http://localhost:3000" -ForegroundColor White
Write-Host "  RabbitMQ UI: http://localhost:15672  (guest/guest)" -ForegroundColor DarkGray
Write-Host "  MinIO UI:    http://localhost:9001   (minioadmin/minioadmin)" -ForegroundColor DarkGray
Write-Host ""