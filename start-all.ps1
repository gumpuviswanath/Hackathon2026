$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$services = @(
  @{ Name = 'customer-service'; Module = 'Bank-Customer-Id'; Port = '3000' },
  @{ Name = 'kyc-service'; Module = 'Bank-KYC-Service'; Port = '3001' },
  @{ Name = 'account-service'; Module = 'Bank-Account-Service'; Port = '3002' },
  @{ Name = 'product-service'; Module = 'Bank-Product-Service'; Port = '3003' }
)

$mvn = Get-Command mvn -ErrorAction SilentlyContinue
if (-not $mvn -and (Test-Path "$env:USERPROFILE\apache-maven-3.9.16\bin\mvn.cmd")) {
  $mvn = Get-Item "$env:USERPROFILE\apache-maven-3.9.16\bin\mvn.cmd"
}

if (-not $mvn) {
  Write-Host 'Maven is required to start the Spring Boot microservices.'
  Write-Host 'Install Maven, then run this script again.'
  exit 1
}

foreach ($service in $services) {
  Start-Process -FilePath $mvn.Source -ArgumentList "-pl", $service.Module, "spring-boot:run" -WorkingDirectory $root -WindowStyle Hidden
  Write-Host "Started $($service.Name) at http://localhost:$($service.Port)"
}

Write-Host ''
Write-Host 'Spring Boot microservices are starting in background windows.'
Write-Host 'Customer: http://localhost:3000/customer/all'
Write-Host 'KYC:      http://localhost:3001/kyc/all'
Write-Host 'Account:  http://localhost:3002/account/all'
Write-Host 'Product:  http://localhost:3003/product/all'
