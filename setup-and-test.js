const fs = require('fs');
const path = require('path');

console.log('🔧 Healthcare Connect Complete Setup');
console.log('===================================\n');

// Step 1: Create .env file
console.log('1. 🔧 Creating .env file...');
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
  console.log('   ✅ Created .env file');
} else {
  console.log('   ✅ .env file already exists');
}

// Step 2: Check if backend is running
console.log('\n2. 🚀 Checking if backend is running...');
const http = require('http');

function checkBackend() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8000,
      path: '/',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      console.log('   ✅ Backend is running on port 8000');
      resolve(true);
    });

    req.on('error', () => {
      console.log('   ❌ Backend is not running');
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('   ❌ Backend connection timeout');
      resolve(false);
    });

    req.end();
  });
}

// Step 3: Create test user
async function createTestUser() {
  console.log('\n3. 👤 Creating test user...');
  
  const userData = {
    email: 'timothykhalayi96@gmail.com',
    password: 'Test1234!',
    firstName: 'Timothy',
    lastName: 'Khalayi',
    phoneNumber: '+254700000000',
    role: 'admin',
    isEmailVerified: true
  };

  const postData = JSON.stringify(userData);

  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8000,
      path: '/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log('   ✅ Test user created successfully');
          resolve(true);
        } else {
          console.log(`   ❌ Failed to create user: ${res.statusCode}`);
          console.log(`   Response: ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ Error creating user: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('   ❌ Request timeout');
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Step 4: Test login
async function testLogin() {
  console.log('\n4. 🧪 Testing login...');
  
  const loginData = {
    email: 'timothykhalayi96@gmail.com',
    password: 'Test1234!'
  };

  const postData = JSON.stringify(loginData);

  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8000,
      path: '/auth/signin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✅ Login successful!');
          console.log('   📋 Login credentials:');
          console.log('      Email: timothykhalayi96@gmail.com');
          console.log('      Password: Test1234!');
          resolve(true);
        } else {
          console.log(`   ❌ Login failed: ${res.statusCode}`);
          console.log(`   Response: ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ Error testing login: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('   ❌ Request timeout');
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Main execution
async function main() {
  console.log('📋 SETUP INSTRUCTIONS:');
  console.log('======================');
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
  console.log('4. 🧪 TEST SETUP:');
  console.log('   Run this script again after starting the backend');
  console.log('');
  console.log('🔗 QUICK TEST CREDENTIALS:');
  console.log('   Email: timoth@gmail.com, Password: 123');
  console.log('   Email: esthy.nandwa@example.com, Password: 123');
  console.log('');
  console.log('❓ TROUBLESHOOTING:');
  console.log('- If you get database connection errors, check PostgreSQL is running');
  console.log('- If you get 500 errors, check your .env file is properly configured');
  console.log('- If user creation fails, check the backend logs for specific errors');
  console.log('');
  
  // Check if backend is running
  const backendRunning = await checkBackend();
  
  if (backendRunning) {
    // Try to create test user
    const userCreated = await createTestUser();
    
    if (userCreated) {
      // Test login
      await testLogin();
    } else {
      console.log('\n💡 TIP: The user might already exist. Try logging in directly.');
    }
  } else {
    console.log('\n💡 TIP: Start the backend first, then run this script again.');
  }
}

main().catch(console.error); 