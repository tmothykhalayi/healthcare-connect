const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test data
const testOrder = {
  patientId: 1,
  pharmacyId: 1,
  orderDate: new Date().toISOString(),
  status: 'pending',
  totalAmount: 150.00,
  OrderId: `TEST-${Date.now()}`
};

let createdOrderId = null;

async function testOrdersCRUD() {
  console.log('🧪 Testing Orders CRUD Operations...\n');

  try {
    // Test 1: Create Order
    console.log('1️⃣ Testing CREATE order...');
    const createResponse = await axios.post(`${BASE_URL}/orders`, testOrder);
    console.log('✅ Create order successful:', createResponse.data);
    createdOrderId = createResponse.data.data.id;
    console.log('📝 Created order ID:', createdOrderId);

    // Test 2: Get All Orders
    console.log('\n2️⃣ Testing GET all orders...');
    const getAllResponse = await axios.get(`${BASE_URL}/orders`);
    console.log('✅ Get all orders successful. Total orders:', getAllResponse.data.data.length);

    // Test 3: Get Order by ID
    console.log('\n3️⃣ Testing GET order by ID...');
    const getByIdResponse = await axios.get(`${BASE_URL}/orders/${createdOrderId}`);
    console.log('✅ Get order by ID successful:', getByIdResponse.data);

    // Test 4: Get Orders by Pharmacy ID
    console.log('\n4️⃣ Testing GET orders by pharmacy ID...');
    const getByPharmacyResponse = await axios.get(`${BASE_URL}/orders/pharmacy/1`);
    console.log('✅ Get orders by pharmacy ID successful. Orders found:', getByPharmacyResponse.data.data.length);

    // Test 5: Get Orders by Patient ID
    console.log('\n5️⃣ Testing GET orders by patient ID...');
    const getByPatientResponse = await axios.get(`${BASE_URL}/orders/patient/1`);
    console.log('✅ Get orders by patient ID successful. Orders found:', getByPatientResponse.data.data.length);

    // Test 6: Get Orders by Status
    console.log('\n6️⃣ Testing GET orders by status...');
    const getByStatusResponse = await axios.get(`${BASE_URL}/orders/status/pending`);
    console.log('✅ Get orders by status successful. Pending orders found:', getByStatusResponse.data.data.length);

    // Test 7: Update Order Status
    console.log('\n7️⃣ Testing UPDATE order status...');
    const updateStatusResponse = await axios.patch(`${BASE_URL}/orders/${createdOrderId}/status`, {
      status: 'processed'
    });
    console.log('✅ Update order status successful:', updateStatusResponse.data);

    // Test 8: Update Order
    console.log('\n8️⃣ Testing UPDATE order...');
    const updateResponse = await axios.patch(`${BASE_URL}/orders/${createdOrderId}`, {
      totalAmount: 175.50,
      status: 'completed'
    });
    console.log('✅ Update order successful:', updateResponse.data);

    // Test 9: Verify Updated Order
    console.log('\n9️⃣ Testing GET updated order...');
    const getUpdatedResponse = await axios.get(`${BASE_URL}/orders/${createdOrderId}`);
    console.log('✅ Get updated order successful:', getUpdatedResponse.data);

    // Test 10: Delete Order
    console.log('\n🔟 Testing DELETE order...');
    const deleteResponse = await axios.delete(`${BASE_URL}/orders/${createdOrderId}`);
    console.log('✅ Delete order successful:', deleteResponse.data);

    // Test 11: Verify Order Deleted
    console.log('\n1️⃣1️⃣ Testing GET deleted order (should fail)...');
    try {
      await axios.get(`${BASE_URL}/orders/${createdOrderId}`);
      console.log('❌ Order still exists after deletion');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Order successfully deleted (404 as expected)');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    console.log('\n🎉 All Orders CRUD tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Test error cases
async function testErrorCases() {
  console.log('\n🧪 Testing Error Cases...\n');

  try {
    // Test 1: Create order with invalid patient ID
    console.log('1️⃣ Testing CREATE order with invalid patient ID...');
    try {
      await axios.post(`${BASE_URL}/orders`, {
        ...testOrder,
        patientId: 999999,
        OrderId: `TEST-ERROR-${Date.now()}`
      });
      console.log('❌ Should have failed with invalid patient ID');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Correctly failed with invalid patient ID');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test 2: Create order with invalid pharmacy ID
    console.log('\n2️⃣ Testing CREATE order with invalid pharmacy ID...');
    try {
      await axios.post(`${BASE_URL}/orders`, {
        ...testOrder,
        pharmacyId: 999999,
        OrderId: `TEST-ERROR-2-${Date.now()}`
      });
      console.log('❌ Should have failed with invalid pharmacy ID');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Correctly failed with invalid pharmacy ID');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test 3: Create order with duplicate OrderId
    console.log('\n3️⃣ Testing CREATE order with duplicate OrderId...');
    const duplicateOrder = {
      ...testOrder,
      OrderId: 'DUPLICATE-TEST'
    };
    
    // Create first order
    await axios.post(`${BASE_URL}/orders`, duplicateOrder);
    console.log('✅ First order created');
    
    // Try to create second order with same OrderId
    try {
      await axios.post(`${BASE_URL}/orders`, duplicateOrder);
      console.log('❌ Should have failed with duplicate OrderId');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Correctly failed with duplicate OrderId');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test 4: Get non-existent order
    console.log('\n4️⃣ Testing GET non-existent order...');
    try {
      await axios.get(`${BASE_URL}/orders/999999`);
      console.log('❌ Should have failed with non-existent order');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Correctly failed with non-existent order');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    console.log('\n🎉 All error case tests completed!');

  } catch (error) {
    console.error('\n❌ Error case test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting Orders CRUD Tests...\n');
  
  await testOrdersCRUD();
  await testErrorCases();
  
  console.log('\n✨ All tests completed!');
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first.');
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  }
}

main().catch(console.error); 