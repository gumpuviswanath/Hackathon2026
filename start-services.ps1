# Hackathon 2026 - Build and Run Script

param(
    [string]$action = "help"
)

$rootDir = Get-Location
$modules = @(
    "Bank-Customer-Id",
    "Bank-KYC-Service", 
    "Bank-Account-Service",
    "Bank-Product-Service"
)

function Build-Services {
    Write-Host "🔨 Building all microservices..." -ForegroundColor Green
    
    # Check if Maven is available
    $mvnCheck = mvn --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Maven not found. Please install Maven or add it to PATH" -ForegroundColor Red
        return
    }
    
    Write-Host "Maven version: $mvnCheck" -ForegroundColor Cyan
    
    Write-Host "Cleaning and building..." -ForegroundColor Yellow
    mvn clean package -DskipTests -q
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
    }
}

function Start-Docker {
    Write-Host "🐳 Starting services with Docker Compose..." -ForegroundColor Green
    
    $dockerCheck = docker --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker not found. Please install Docker" -ForegroundColor Red
        return
    }
    
    Write-Host "Building Docker images..." -ForegroundColor Yellow
    docker-compose up --build
}

function Start-Local {
    Write-Host "🚀 Starting services locally..." -ForegroundColor Green
    Write-Host "Prerequisites:" -ForegroundColor Yellow
    Write-Host "  - JAR files built in target/ directories (run '.\start-services.ps1 build' first)"
    Write-Host "  - Data is stored in an embedded H2 file database per service (./data/), no separate DB to install or run"
    Write-Host ""
    
    Write-Host "Starting services in background..." -ForegroundColor Yellow
    
    $services = @(
        @{ Name = "Customer"; Port = 3000; Path = "Bank-Customer-Id"; Jar = "customer-service" },
        @{ Name = "KYC"; Port = 3001; Path = "Bank-KYC-Service"; Jar = "kyc-service" },
        @{ Name = "Account"; Port = 3002; Path = "Bank-Account-Service"; Jar = "account-service" },
        @{ Name = "Product"; Port = 3003; Path = "Bank-Product-Service"; Jar = "product-service" }
    )
    
    foreach ($service in $services) {
        $jarPath = Join-Path $service.Path "target\$($service.Jar)-*.jar"
        $jars = Get-Item $jarPath -ErrorAction SilentlyContinue
        
        if ($jars) {
            $jar = $jars[0].FullName
            $serviceDir = Join-Path $rootDir $service.Path
            Write-Host "Starting $($service.Name) Service on port $($service.Port)..." -ForegroundColor Cyan
            # WorkingDirectory pins the relative H2 data path (./data) to this service's own folder
            Start-Process java -ArgumentList "-jar", $jar -WorkingDirectory $serviceDir -NoNewWindow
        } else {
            Write-Host "❌ JAR not found for $($service.Name) service" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Starting Portal..." -ForegroundColor Cyan
    $portalPath = Join-Path $rootDir "Customer-Onboarding-Portal"
    Push-Location $portalPath
    
    # Install deps if needed
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing Portal dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # npm on Windows is npm.cmd, which Start-Process can't launch directly - run it via cmd.exe
    Start-Process cmd.exe -ArgumentList "/c", "npm start" -NoNewWindow
    Pop-Location
    
    Write-Host ""
    Write-Host "✅ All services starting!" -ForegroundColor Green
    Write-Host "Dashboard: http://localhost:3005" -ForegroundColor Cyan
}

function Show-Status {
    Write-Host "📊 Checking service status..." -ForegroundColor Green
    Write-Host ""
    
    $ports = @(
        @{ Name = "Customer Service"; Port = 3000; Url = "http://localhost:3000/customer/all" },
        @{ Name = "KYC Service"; Port = 3001; Url = "http://localhost:3001/kyc/all" },
        @{ Name = "Account Service"; Port = 3002; Url = "http://localhost:3002/account/all" },
        @{ Name = "Product Service"; Port = 3003; Url = "http://localhost:3003/product/all" },
        @{ Name = "Portal"; Port = 3005; Url = "http://localhost:3005" }
    )
    
    foreach ($service in $ports) {
        try {
            $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 2 -ErrorAction Stop
            Write-Host "✅ $($service.Name) (Port $($service.Port)) - RUNNING" -ForegroundColor Green
        } catch {
            Write-Host "❌ $($service.Name) (Port $($service.Port)) - DOWN" -ForegroundColor Red
        }
    }
}

function Show-Help {
    Write-Host "Hackathon 2026 - Service Management Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\start-services.ps1 [action]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Green
    Write-Host "  build      - Build all services with Maven"
    Write-Host "  docker     - Start services with Docker Compose (recommended)"
    Write-Host "  local      - Start services locally (embedded H2, no DB install needed)"
    Write-Host "  status     - Check service status"
    Write-Host "  help       - Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\start-services.ps1 build"
    Write-Host "  .\start-services.ps1 docker"
    Write-Host "  .\start-services.ps1 status"
    Write-Host ""
    Write-Host "Quick Start:" -ForegroundColor Yellow
    Write-Host "  1. .\start-services.ps1 build"
    Write-Host "  2. .\start-services.ps1 docker"
    Write-Host "  3. Open http://localhost:3005"
    Write-Host ""
}

switch ($action.ToLower()) {
    "build" { Build-Services }
    "docker" { Start-Docker }
    "local" { Start-Local }
    "status" { Show-Status }
    default { Show-Help }
}
