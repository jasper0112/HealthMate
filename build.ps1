# HealthMate Project Build Script (Windows PowerShell)
# Purpose: Build backend and start Docker services

$ErrorActionPreference = "Stop"

Write-Host "Starting HealthMate project build..." -ForegroundColor Cyan
Write-Host ""

# Check if in project root
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "ERROR: Please run this script from project root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Build backend JAR
Write-Host "Step 1/3: Building backend JAR file..." -ForegroundColor Yellow
Push-Location backend

# Check if mvnw.cmd exists
if (-not (Test-Path "mvnw.cmd")) {
    Write-Host "ERROR: mvnw.cmd not found" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Build project
Write-Host "Running Maven build..." -ForegroundColor Yellow
& .\mvnw.cmd clean package -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Maven build failed" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Check if JAR file was generated
if (-not (Test-Path "target\backend-0.0.1-SNAPSHOT.jar")) {
    Write-Host "ERROR: JAR file not generated" -ForegroundColor Red
    Pop-Location
    exit 1
}

$jarSize = (Get-Item "target\backend-0.0.1-SNAPSHOT.jar").Length / 1MB
Write-Host "SUCCESS: Backend built successfully! (JAR size: $([math]::Round($jarSize, 2)) MB)" -ForegroundColor Green
Pop-Location

# Step 2: Check Docker
Write-Host ""
Write-Host "Step 2/3: Checking Docker environment..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "SUCCESS: Docker is running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not running, please start Docker Desktop first" -ForegroundColor Red
    exit 1
}

# Step 3: Check .env file
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "WARNING: .env file not found" -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Write-Host "Creating .env file from template..." -ForegroundColor Yellow
        Copy-Item "env.example" ".env"
        Write-Host "SUCCESS: .env file created, please edit it and set MYSQL_ROOT_PASSWORD" -ForegroundColor Yellow
    } else {
        Write-Host "ERROR: env.example template file not found" -ForegroundColor Red
        exit 1
    }
}

# Step 4: Start Docker Compose
Write-Host ""
Write-Host "Step 3/3: Starting Docker Compose services..." -ForegroundColor Yellow
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker Compose startup failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "SUCCESS: Build and startup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Cyan
docker compose ps
Write-Host ""
Write-Host "View Logs:" -ForegroundColor Cyan
Write-Host "   - Backend: docker compose logs -f backend" -ForegroundColor White
Write-Host "   - Frontend: docker compose logs -f frontend" -ForegroundColor White
Write-Host "   - All: docker compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   - Backend: http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "Stop services: docker compose down" -ForegroundColor Yellow
Write-Host "Restart services: docker compose restart" -ForegroundColor Yellow

