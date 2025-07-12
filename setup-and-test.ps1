# Healthcare Connect Complete Setup for Windows
Write-Host "🔧 Healthcare Connect Complete Setup" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""

# Step 1: Create .env file
Write-Host "1. 🔧 Creating .env file..." -ForegroundColor White
$envPath = Join-Path $PSScriptRoot ".env"
$envContent = @"
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=healthcare_connect

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=your_access_token_secret_key_here_make_it_long_and_secure_123456789
JWT_REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here_make_it_long_and_secure_123456789

# Email Configuration (REQUIRED for email service)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Server Configuration
PORT=8000
NODE_ENV=development
"@

if (-not (Test-Path $envPath)) {
    Set-Content -Path $envPath -Value $envContent
    Write-Host "   ✅ Created .env file" -ForegroundColor Green
} else {
    Write-Host "   ✅ .env file already exists" -ForegroundColor Green
}

# Step 2: Check if backend is running
Write-Host ""
Write-Host "2. 🚀 Checking if backend is running..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✅ Backend is running on port 8000" -ForegroundColor Green
    $backendRunning = $true
} catch {
    Write-Host "   ❌ Backend is not running" -ForegroundColor Red
    $backendRunning = $false
}

# Step 3: Create test user if backend is running
if ($backendRunning) {
    Write-Host ""
    Write-Host "3. 👤 Creating test user..." -ForegroundColor White
    
    $userData = @{
        email = "timothykhalayi96@gmail.com"
        password = "Test1234!"
        firstName = "Timothy"
        lastName = "Khalayi"
        phoneNumber = "+254700000000"
        role = "admin"
        isEmailVerified = $true
    }
    
    $jsonData = $userData | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/users" -Method POST -ContentType "application/json" -Body $jsonData -TimeoutSec 5
        Write-Host "   ✅ Test user created successfully" -ForegroundColor Green
        $userCreated = $true
    } catch {
        Write-Host "   ❌ Failed to create user: $($_.Exception.Message)" -ForegroundColor Red
        $userCreated = $false
    }
    
    # Step 4: Test login
    if ($userCreated) {
        Write-Host ""
        Write-Host "4. 🧪 Testing login..." -ForegroundColor White
        
        $loginData = @{
            email = "timothykhalayi96@gmail.com"
            password = "Test1234!"
        }
        
        $loginJson = $loginData | ConvertTo-Json
        
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:8000/auth/signin" -Method POST -ContentType "application/json" -Body $loginJson -TimeoutSec 5
            Write-Host "   ✅ Login successful!" -ForegroundColor Green
            Write-Host "   📋 Login credentials:" -ForegroundColor Cyan
            Write-Host "      Email: timothykhalayi96@gmail.com" -ForegroundColor Gray
            Write-Host "      Password: Test1234!" -ForegroundColor Gray
        } catch {
            Write-Host "   ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "📋 SETUP INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🔧 UPDATE .env FILE:" -ForegroundColor White
Write-Host "   - Open healthcare-connect/.env" -ForegroundColor Gray
Write-Host "   - Change DB_PASSWORD to your actual PostgreSQL password" -ForegroundColor Gray
Write-Host "   - Change DB_USERNAME if different from 'postgres'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🗄️  SETUP DATABASE:" -ForegroundColor White
Write-Host "   - Make sure PostgreSQL is running" -ForegroundColor Gray
Write-Host "   - Create database: createdb healthcare_connect" -ForegroundColor Gray
Write-Host "   - Or use pgAdmin to create the database" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🚀 START BACKEND:" -ForegroundColor White
Write-Host "   cd healthcare-connect" -ForegroundColor Gray
Write-Host "   pnpm run start:dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 🧪 TEST SETUP:" -ForegroundColor White
Write-Host "   Run this script again after starting the backend" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 QUICK TEST CREDENTIALS:" -ForegroundColor Cyan
Write-Host "   Email: timoth@gmail.com, Password: 123" -ForegroundColor Gray
Write-Host "   Email: esthy.nandwa@example.com, Password: 123" -ForegroundColor Gray
Write-Host ""
Write-Host "❓ TROUBLESHOOTING:" -ForegroundColor Cyan
Write-Host "- If you get database connection errors, check PostgreSQL is running" -ForegroundColor Gray
Write-Host "- If you get 500 errors, check your .env file is properly configured" -ForegroundColor Gray
Write-Host "- If user creation fails, check the backend logs for specific errors" -ForegroundColor Gray 