@echo off
REM HealthMate Project Build Script (Windows Batch)
REM Purpose: Build backend and start Docker services

echo ========================================
echo HealthMate Project Build Script
echo ========================================
echo.

REM Check if in project root
if not exist "docker-compose.yml" (
    echo ERROR: Please run this script from project root directory
    pause
    exit /b 1
)

REM Step 1: Build backend JAR
echo Step 1/3: Building backend JAR file...
cd backend

REM Check if mvnw.cmd exists
if not exist "mvnw.cmd" (
    echo ERROR: mvnw.cmd not found
    cd ..
    pause
    exit /b 1
)

REM Build project
echo Running Maven build...
call mvnw.cmd clean package -DskipTests

if errorlevel 1 (
    echo ERROR: Maven build failed
    cd ..
    pause
    exit /b 1
)

REM Check if JAR file was generated
if not exist "target\backend-0.0.1-SNAPSHOT.jar" (
    echo ERROR: JAR file not generated
    cd ..
    pause
    exit /b 1
)

echo SUCCESS: Backend built successfully!
cd ..

REM Step 2: Check Docker
echo.
echo Step 2/3: Checking Docker environment...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running, please start Docker Desktop first
    pause
    exit /b 1
)
echo SUCCESS: Docker is running

REM Step 3: Check .env file
if not exist ".env" (
    echo.
    echo WARNING: .env file not found
    if exist "env.example" (
        echo Creating .env file from template...
        copy /Y env.example .env >nul
        echo SUCCESS: .env file created, please edit it and set MYSQL_ROOT_PASSWORD
    ) else (
        echo ERROR: env.example template file not found
        pause
        exit /b 1
    )
)

REM Step 4: Start Docker Compose
echo.
echo Step 3/3: Starting Docker Compose services...
docker compose up -d

if errorlevel 1 (
    echo ERROR: Docker Compose startup failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS: Build and startup completed!
echo ========================================
echo.
echo Service Status:
docker compose ps
echo.
echo View Logs:
echo    - Backend: docker compose logs -f backend
echo    - Frontend: docker compose logs -f frontend
echo    - All: docker compose logs -f
echo.
echo Service URLs:
echo    - Frontend: http://localhost:3000
echo    - Backend: http://localhost:8080
echo.
echo Stop services: docker compose down
echo Restart services: docker compose restart
echo.
pause

