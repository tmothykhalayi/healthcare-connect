const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testData = {
  patients: [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
      dateOfBirth: '1985-03-15',
      address: '123 Main St, City, State',
      medicalHistory: 'Hypertension, Diabetes',
      allergies: 'Penicillin',
      status: 'active'
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '+1234567891',
      dateOfBirth: '1990-07-22',
      address: '456 Oak Ave, City, State',
      medicalHistory: 'Asthma',
      allergies: 'None',
      status: 'active'
    }
  ],
  payments: [
    {
      paymentId: 'PAY-001',
      orderId: 'ORD-001',
      patientId: 1,
      patientName: 'John Doe',
      amount: 150.50,
      paymentMethod: 'credit_card',
      status: 'completed',
      description: 'Prescription medication payment'
    },
    {
      paymentId: 'PAY-002',
      orderId: 'ORD-002',
      patientId: 2,
      patientName: 'Jane Smith',
      amount: 89.99,
      paymentMethod: 'cash',
      status: 'pending',
      description: 'Over-the-counter medications'
    }
  ],
  prescriptions: [
    {
      prescriptionId: 'PRESC-001',
      patientId: 1,
      patientName: 'John Doe',
      doctorId: 1,
      doctorName: 'Dr. Johnson',
      medication: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '30 days',
      instructions: 'Take with food',
      status: 'active'
    },
    {
      prescriptionId: 'PRESC-002',
      patientId: 2,
      patientName: 'Jane Smith',
      doctorId: 2,
      doctorName: 'Dr. Williams',
      medication: 'Albuterol',
      dosage: '2 puffs',
      frequency: 'As needed',
      duration: '90 days',
      instructions: 'Use inhaler as directed',
      status: 'active'
    }
  ],
  records: [
    {
      recordId: 'REC-001',
      patientId: 1,
      patientName: 'John Doe',
      doctorId: 1,
      doctorName: 'Dr. Johnson',
      diagnosis: 'Type 2 Diabetes',
      symptoms: 'Increased thirst, frequent urination',
      treatment: 'Metformin medication',
      medications: 'Metformin 500mg',
      notes: 'Patient responding well to treatment',
      status: 'active'
    },
    {
      recordId: 'REC-002',
      patientId: 2,
      patientName: 'Jane Smith',
      doctorId: 2,
      doctorName: 'Dr. Williams',
      diagnosis: 'Asthma',
      symptoms: 'Wheezing, shortness of breath',
      treatment: 'Inhaler therapy',
      medications: 'Albuterol inhaler',
      notes: 'Patient needs regular monitoring',
      status: 'active'
    }
  ]
};

async function testPatientsCRUD() {
  console.log('\n=== Testing Patients CRUD Operations ===');
  
  try {
    // Test GET patients
    console.log('1. Testing GET /patients');
    const getResponse = await axios.get(`${BASE_URL}/patients`);
    console.log('✅ GET patients successful:', getResponse.data.length, 'patients found');
    
    // Test CREATE patient
    console.log('\n2. Testing CREATE patient');
    const createResponse = await axios.post(`${BASE_URL}/patients`, testData.patients[0]);
    console.log('✅ CREATE patient successful:', createResponse.data);
    const createdPatientId = createResponse.data.id;
    
    // Test GET single patient
    console.log('\n3. Testing GET /patients/:id');
    const getSingleResponse = await axios.get(`${BASE_URL}/patients/${createdPatientId}`);
    console.log('✅ GET single patient successful:', getSingleResponse.data);
    
    // Test UPDATE patient
    console.log('\n4. Testing UPDATE patient');
    const updateData = { ...testData.patients[0], firstName: 'Updated John' };
    const updateResponse = await axios.patch(`${BASE_URL}/patients/${createdPatientId}`, updateData);
    console.log('✅ UPDATE patient successful:', updateResponse.data);
    
    // Test DELETE patient
    console.log('\n5. Testing DELETE patient');
    const deleteResponse = await axios.delete(`${BASE_URL}/patients/${createdPatientId}`);
    console.log('✅ DELETE patient successful:', deleteResponse.data);
    
  } catch (error) {
    console.error('❌ Patients CRUD test failed:', error.response?.data || error.message);
  }
}

async function testPaymentsCRUD() {
  console.log('\n=== Testing Payments CRUD Operations ===');
  
  try {
    // Test GET payments
    console.log('1. Testing GET /payments');
    const getResponse = await axios.get(`${BASE_URL}/payments`);
    console.log('✅ GET payments successful:', getResponse.data.length, 'payments found');
    
    // Test CREATE payment
    console.log('\n2. Testing CREATE payment');
    const createResponse = await axios.post(`${BASE_URL}/payments`, testData.payments[0]);
    console.log('✅ CREATE payment successful:', createResponse.data);
    const createdPaymentId = createResponse.data.id;
    
    // Test GET single payment
    console.log('\n3. Testing GET /payments/:id');
    const getSingleResponse = await axios.get(`${BASE_URL}/payments/${createdPaymentId}`);
    console.log('✅ GET single payment successful:', getSingleResponse.data);
    
    // Test UPDATE payment
    console.log('\n4. Testing UPDATE payment');
    const updateData = { ...testData.payments[0], status: 'completed' };
    const updateResponse = await axios.patch(`${BASE_URL}/payments/${createdPaymentId}`, updateData);
    console.log('✅ UPDATE payment successful:', updateResponse.data);
    
    // Test DELETE payment
    console.log('\n5. Testing DELETE payment');
    const deleteResponse = await axios.delete(`${BASE_URL}/payments/${createdPaymentId}`);
    console.log('✅ DELETE payment successful:', deleteResponse.data);
    
  } catch (error) {
    console.error('❌ Payments CRUD test failed:', error.response?.data || error.message);
  }
}

async function testPrescriptionsCRUD() {
  console.log('\n=== Testing Prescriptions CRUD Operations ===');
  
  try {
    // Test GET medical records (prescriptions)
    console.log('1. Testing GET /medical-records');
    const getResponse = await axios.get(`${BASE_URL}/medical-records`);
    console.log('✅ GET medical records successful:', getResponse.data.length, 'records found');
    
    // Test CREATE medical record (prescription)
    console.log('\n2. Testing CREATE medical record');
    const createResponse = await axios.post(`${BASE_URL}/medical-records`, testData.prescriptions[0]);
    console.log('✅ CREATE medical record successful:', createResponse.data);
    const createdRecordId = createResponse.data.id;
    
    // Test GET single medical record
    console.log('\n3. Testing GET /medical-records/:id');
    const getSingleResponse = await axios.get(`${BASE_URL}/medical-records/${createdRecordId}`);
    console.log('✅ GET single medical record successful:', getSingleResponse.data);
    
    // Test UPDATE medical record
    console.log('\n4. Testing UPDATE medical record');
    const updateData = { ...testData.prescriptions[0], dosage: '1000mg' };
    const updateResponse = await axios.patch(`${BASE_URL}/medical-records/${createdRecordId}`, updateData);
    console.log('✅ UPDATE medical record successful:', updateResponse.data);
    
    // Test DELETE medical record
    console.log('\n5. Testing DELETE medical record');
    const deleteResponse = await axios.delete(`${BASE_URL}/medical-records/${createdRecordId}`);
    console.log('✅ DELETE medical record successful:', deleteResponse.data);
    
  } catch (error) {
    console.error('❌ Prescriptions CRUD test failed:', error.response?.data || error.message);
  }
}

async function testRecordsCRUD() {
  console.log('\n=== Testing Medical Records CRUD Operations ===');
  
  try {
    // Test GET medical records
    console.log('1. Testing GET /medical-records');
    const getResponse = await axios.get(`${BASE_URL}/medical-records`);
    console.log('✅ GET medical records successful:', getResponse.data.length, 'records found');
    
    // Test CREATE medical record
    console.log('\n2. Testing CREATE medical record');
    const createResponse = await axios.post(`${BASE_URL}/medical-records`, testData.records[0]);
    console.log('✅ CREATE medical record successful:', createResponse.data);
    const createdRecordId = createResponse.data.id;
    
    // Test GET single medical record
    console.log('\n3. Testing GET /medical-records/:id');
    const getSingleResponse = await axios.get(`${BASE_URL}/medical-records/${createdRecordId}`);
    console.log('✅ GET single medical record successful:', getSingleResponse.data);
    
    // Test UPDATE medical record
    console.log('\n4. Testing UPDATE medical record');
    const updateData = { ...testData.records[0], diagnosis: 'Updated Diagnosis' };
    const updateResponse = await axios.patch(`${BASE_URL}/medical-records/${createdRecordId}`, updateData);
    console.log('✅ UPDATE medical record successful:', updateResponse.data);
    
    // Test DELETE medical record
    console.log('\n5. Testing DELETE medical record');
    const deleteResponse = await axios.delete(`${BASE_URL}/medical-records/${createdRecordId}`);
    console.log('✅ DELETE medical record successful:', deleteResponse.data);
    
  } catch (error) {
    console.error('❌ Medical Records CRUD test failed:', error.response?.data || error.message);
  }
}

async function testPharmacyEndpoints() {
  console.log('\n=== Testing Pharmacy-Specific Endpoints ===');
  
  try {
    // Test GET pharmacy patients
    console.log('1. Testing GET /pharmacy/patients');
    const patientsResponse = await axios.get(`${BASE_URL}/pharmacy/patients`);
    console.log('✅ GET pharmacy patients successful:', patientsResponse.data);
    
    // Test GET pharmacy payments
    console.log('\n2. Testing GET /pharmacy/payments');
    const paymentsResponse = await axios.get(`${BASE_URL}/pharmacy/payments`);
    console.log('✅ GET pharmacy payments successful:', paymentsResponse.data);
    
    // Test GET pharmacy prescriptions
    console.log('\n3. Testing GET /pharmacy/prescriptions');
    const prescriptionsResponse = await axios.get(`${BASE_URL}/pharmacy/prescriptions`);
    console.log('✅ GET pharmacy prescriptions successful:', prescriptionsResponse.data);
    
    // Test GET pharmacy records
    console.log('\n4. Testing GET /pharmacy/records');
    const recordsResponse = await axios.get(`${BASE_URL}/pharmacy/records`);
    console.log('✅ GET pharmacy records successful:', recordsResponse.data);
    
  } catch (error) {
    console.error('❌ Pharmacy endpoints test failed:', error.response?.data || error.message);
  }
}

async function testErrorHandling() {
  console.log('\n=== Testing Error Handling ===');
  
  try {
    // Test invalid patient ID
    console.log('1. Testing invalid patient ID');
    try {
      await axios.get(`${BASE_URL}/patients/999999`);
    } catch (error) {
      console.log('✅ Invalid patient ID handled correctly:', error.response?.status);
    }
    
    // Test invalid payment ID
    console.log('\n2. Testing invalid payment ID');
    try {
      await axios.get(`${BASE_URL}/payments/999999`);
    } catch (error) {
      console.log('✅ Invalid payment ID handled correctly:', error.response?.status);
    }
    
    // Test invalid medical record ID
    console.log('\n3. Testing invalid medical record ID');
    try {
      await axios.get(`${BASE_URL}/medical-records/999999`);
    } catch (error) {
      console.log('✅ Invalid medical record ID handled correctly:', error.response?.status);
    }
    
    // Test invalid data for creation
    console.log('\n4. Testing invalid data for creation');
    try {
      await axios.post(`${BASE_URL}/patients`, {});
    } catch (error) {
      console.log('✅ Invalid data handled correctly:', error.response?.status);
    }
    
  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Pharmacist CRUD Tests...\n');
  
  try {
    await testPatientsCRUD();
    await testPaymentsCRUD();
    await testPrescriptionsCRUD();
    await testRecordsCRUD();
    await testPharmacyEndpoints();
    await testErrorHandling();
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the tests
runAllTests(); 