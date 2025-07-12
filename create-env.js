const fs = require('fs');
const path = require('path');

console.log('🔧 Creating Missing .env File');
console.log('=============================\n');

// Create .env file
const envPath = path.join(__dirname, '.env');
const envContent = `# Database Configuration
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
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with default configuration');
  console.log('⚠️  IMPORTANT: Update the .env file with your actual database credentials');
} else {
  console.log('✅ .env file already exists');
}

console.log('\n📋 CRITICAL STEPS TO FIX THE LOGIN ISSUE:');
console.log('');
console.log('1. 🔧 UPDATE .env FILE:');
console.log('   - Open healthcare-connect/.env');
console.log('   - Change DB_PASSWORD to your actual PostgreSQL password');
console.log('   - Change DB_USERNAME if different from "postgres"');
console.log('');
console.log('2. 🗄️  SETUP DATABASE:');
console.log('   - Make sure PostgreSQL is running');
console.log('   - Create database: createdb healthcare_connect');
console.log('   - Or use pgAdmin to create the database');
console.log('');
console.log('3. 🚀 START BACKEND:');
console.log('   cd healthcare-connect');
console.log('   pnpm run start:dev');
console.log('');
console.log('4. 👤 CREATE TEST USER:');
console.log('   Use one of these methods:');
console.log('');
console.log('   Method A - Using PowerShell:');
console.log('   Invoke-RestMethod -Uri "http://localhost:8000/users" -Method POST -ContentType "application/json" -Body \'{"email": "timothykhalayi96@gmail.com", "password": "Test1234!", "firstName": "Timothy", "lastName": "Khalayi", "phoneNumber": "+254700000000", "role": "admin", "isEmailVerified": true}\'');
console.log('');
console.log('   Method B - Using VS Code REST Client:');
console.log('   - Open test-valid-users.http in VS Code');
console.log('   - Install "REST Client" extension');
console.log('   - Click "Send Request" on the user creation request');
console.log('');
console.log('5. 🧪 TEST LOGIN:');
console.log('   - Email: timothykhalayi96@gmail.com');
console.log('   - Password: Test1234!');
console.log('');
console.log('🔗 QUICK TEST (if you want to test immediately):');
console.log('   - Email: timoth@gmail.com, Password: 123');
console.log('   - Email: esthy.nandwa@example.com, Password: 123');
console.log('');
console.log('❓ TROUBLESHOOTING:');
console.log('- If you get database connection errors, check PostgreSQL is running');
console.log('- If you get 500 errors, check your .env file is properly configured');
console.log('- If user creation fails, check the backend logs for specific errors'); 