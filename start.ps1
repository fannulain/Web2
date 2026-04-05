Write-Host "Starting project..." -ForegroundColor Cyan

Write-Host "[1/3] Starting RabbitMQ..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "Waiting 10 seconds for RabbitMQ to fully start..." -ForegroundColor Cyan
Start-Sleep -Seconds 10
Write-Host "[2/3] Starting Node.js API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"

Write-Host "[3/3] Starting Python Worker..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd python-worker; .\venv\Scripts\python.exe worker.py"

Write-Host "Project started" -ForegroundColor Green