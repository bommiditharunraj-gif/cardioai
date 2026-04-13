@echo off
echo Initializing CardioAI Health Platform...
echo Checking for Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not installed or not running.
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
    pause
    exit /b
)

echo Starting services with Docker Compose...
docker-compose up --build
pause
