const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

// User to create
const userData = {
  email: 'nandwatimothykhalayi@gmail.com',
  password: 'Test1234!',
  firstName: 'Nandwa',
  lastName: 'Timothy',
  phoneNumber: '+254700000000',
  role: 'admin', // You can change this to 'patient', 'doctor', or 'pharmacist'
  isEmailVerified: true
};

async function createUser() {
  console.log('🚀 Creating user...');
  console.log(`Email: ${userData.email}`);
  console.log(`Password: ${userData.password}`);
  console.log(`Role: ${userData.role}`);
  
  try {
    const response = await axios.post(`${BASE_URL}/users`, userData);
    console.log('✅ User created successfully!');
    console.log('📋 Login credentials:');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Password: ${userData.password}`);
    console.log(`   Role: ${userData.role}`);
    
    // Test login
    console.log('\n🧪 Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/signin`, {
      email: userData.email,
      password: userData.password
    });
    
    console.log('✅ Login successful!');
    console.log('🎉 You can now use these credentials to login to the frontend.');
    
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️  User already exists. Testing login...');
      
      try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/signin`, {
          email: userData.email,
          password: userData.password
        });
        
        console.log('✅ Login successful!');
        console.log('📋 Login credentials:');
        console.log(`   Email: ${userData.email}`);
        console.log(`   Password: ${userData.password}`);
        console.log(`   Role: ${userData.role}`);
        
      } catch (loginError) {
        console.error('❌ Login failed:', loginError.response?.data || loginError.message);
        console.log('💡 The user exists but the password might be different.');
        console.log('💡 Try using a different password or create a new user with a different email.');
      }
    } else {
      console.error('❌ Failed to create user:', error.response?.data || error.message);
    }
  }
}

// Run the script
createUser(); 