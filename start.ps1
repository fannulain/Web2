$ScriptDir = $PSScriptRoot

Write-Host "Starting project..." -ForegroundColor Cyan

Write-Host "[1/3] Starting RabbitMQ and MinIO..." -ForegroundColor Yellow
Set-Location -Path $ScriptDir
docker-compose up -d

Write-Host "Waiting 10 seconds for containers to fully start..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "[2/3] Starting Node.js API..." -ForegroundColor Yellow
Start-Process powershell -WorkingDirectory "$ScriptDir\backend" -ArgumentList "-NoExit", "-Command", "npm start"

Write-Host "[3/3] Starting Python Worker..." -ForegroundColor Yellow
Start-Process powershell -WorkingDirectory "$ScriptDir\python-worker" -ArgumentList "-NoExit", "-Command", "& .\venv\Scripts\python.exe worker.py"

Write-Host "Project started" -ForegroundColor Green