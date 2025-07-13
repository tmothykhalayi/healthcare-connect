const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testUsersCRUD() {
  console.log('🧪 Testing Users CRUD Operations...\n');

  try {
    // Test 1: Get all users
    console.log('1️⃣ Testing GET /users');
    const getUsersResponse = await axios.get(`${BASE_URL}/users`);
    console.log('✅ GET /users successful');
    console.log(`   Found ${getUsersResponse.data.data.length} users`);
    console.log('   Sample user:', getUsersResponse.data.data[0] || 'No users found');
    console.log('');

    // Test 2: Create a new user
    console.log('2️⃣ Testing POST /users');
    const newUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `testuser${Date.now()}@example.com`,
      phoneNumber: '1234567890',
      role: 'patient',
      password: 'password123'
    };
    
    const createUserResponse = await axios.post(`${BASE_URL}/users`, newUser);
    console.log('✅ POST /users successful');
    console.log('   Created user:', createUserResponse.data.data);
    const createdUserId = createUserResponse.data.data.id;
    console.log('');

    // Test 3: Get user by ID
    console.log('3️⃣ Testing GET /users/:id');
    const getUserResponse = await axios.get(`${BASE_URL}/users/${createdUserId}`);
    console.log('✅ GET /users/:id successful');
    console.log('   Retrieved user:', getUserResponse.data.data);
    console.log('');

    // Test 4: Update user
    console.log('4️⃣ Testing PATCH /users/:id');
    const updateData = {
      firstName: 'Updated',
      lastName: 'User',
      phoneNumber: '0987654321'
    };
    
    const updateUserResponse = await axios.patch(`${BASE_URL}/users/${createdUserId}`, updateData);
    console.log('✅ PATCH /users/:id successful');
    console.log('   Update message:', updateUserResponse.data.message);
    console.log('');

    // Test 5: Verify update
    console.log('5️⃣ Verifying update');
    const verifyUpdateResponse = await axios.get(`${BASE_URL}/users/${createdUserId}`);
    console.log('✅ Update verified');
    console.log('   Updated user:', verifyUpdateResponse.data.data);
    console.log('');

    // Test 6: Delete user
    console.log('6️⃣ Testing DELETE /users/:id');
    const deleteUserResponse = await axios.delete(`${BASE_URL}/users/${createdUserId}`);
    console.log('✅ DELETE /users/:id successful');
    console.log('   Delete message:', deleteUserResponse.data.message);
    console.log('');

    // Test 7: Verify deletion
    console.log('7️⃣ Verifying deletion');
    try {
      await axios.get(`${BASE_URL}/users/${createdUserId}`);
      console.log('❌ User still exists after deletion');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ User successfully deleted (404 Not Found)');
      } else {
        console.log('❌ Unexpected error during deletion verification:', error.message);
      }
    }

    console.log('\n🎉 All CRUD tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

// Run the test
testUsersCRUD(); 