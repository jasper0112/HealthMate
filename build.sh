#!/bin/bash

# HealthMate Project Build Script
# Purpose: Build backend and start Docker services

set -e  # Exit on error

echo "========================================"
echo "HealthMate Project Build Script"
echo "========================================"
echo ""

# Check if in project root
if [ ! -f "docker-compose.yml" ]; then
    echo "ERROR: Please run this script from project root directory"
    exit 1
fi

# Step 1: Build backend JAR
echo "Step 1/3: Building backend JAR file..."
cd backend

# Check if mvnw exists
if [ ! -f "mvnw" ]; then
    echo "ERROR: mvnw not found"
    exit 1
fi

# Add execute permission if needed
if [ ! -x "mvnw" ]; then
    echo "Adding execute permission to Maven Wrapper..."
    chmod +x mvnw
fi

# Build project
echo "Running Maven build..."
./mvnw clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "ERROR: Maven build failed"
    exit 1
fi

# Check if JAR file was generated
if [ ! -f "target/backend-0.0.1-SNAPSHOT.jar" ]; then
    echo "ERROR: JAR file not generated"
    exit 1
fi

echo "SUCCESS: Backend built successfully!"
cd ..

# Step 2: Check Docker
echo ""
echo "Step 2/3: Checking Docker environment..."
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running, please start Docker Desktop first"
    exit 1
fi
echo "SUCCESS: Docker is running"

# Step 3: Check .env file
if [ ! -f ".env" ]; then
    echo ""
    echo "WARNING: .env file not found"
    if [ -f "env.example" ]; then
        echo "Creating .env file from template..."
        cp env.example .env
        echo "SUCCESS: .env file created, please edit it and set MYSQL_ROOT_PASSWORD"
    else
        echo "ERROR: env.example template file not found"
        exit 1
    fi
fi

# Step 4: Start Docker Compose
echo ""
echo "Step 3/3: Starting Docker Compose services..."
docker compose up -d

if [ $? -ne 0 ]; then
    echo "ERROR: Docker Compose startup failed"
    exit 1
fi

echo ""
echo "========================================"
echo "SUCCESS: Build and startup completed!"
echo "========================================"
echo ""
echo "Service Status:"
docker compose ps
echo ""
echo "View Logs:"
echo "   - Backend: docker compose logs -f backend"
echo "   - Frontend: docker compose logs -f frontend"
echo "   - All: docker compose logs -f"
echo ""
echo "Service URLs:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:8080"
echo ""
echo "Stop services: docker compose down"
echo "Restart services: docker compose restart"


