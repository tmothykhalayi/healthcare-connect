const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

// User data
const userData = {
  email: 'TIMOTHYKHALAYI@GMAIL.COM',
  password: 'Test1234!',
  firstName: 'Timothy',
  lastName: 'Khalayi',
  phoneNumber: '+254700000000',
  role: 'patient',
  isEmailVerified: true
};

async function updateTimothyPassword() {
  console.log('🔧 Updating Timothy user password...');
  console.log(`Email: ${userData.email}`);
  console.log(`New Password: ${userData.password}`);
  
  try {
    // First try to update the user via the users endpoint
    const response = await axios.patch(`${BASE_URL}/users/email/${userData.email}`, {
      password: userData.password
    });
    
    console.log('✅ Password updated successfully!');
    console.log('📋 Login credentials:');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Password: ${userData.password}`);
    
    // Test login
    console.log('\n🧪 Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/signin`, {
      email: userData.email,
      password: userData.password
    });
    
    console.log('✅ Login successful!');
    console.log('🎉 You can now use these credentials to login to the frontend.');
    
  } catch (error) {
    console.error('❌ Failed to update password:', error.response?.data || error.message);
    console.log('💡 The user might not exist or the endpoint might not be available.');
    console.log('💡 Try running the create-timothy-user.js script instead.');
  }
}

// Run the script
updateTimothyPassword(); 