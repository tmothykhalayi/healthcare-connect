const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

// Sample appointments for doctor ID 27
const appointments = [
  {
    patientId: 1,
    doctorId: 27,
    appointmentDate: "2024-01-20",
    appointmentTime: "09:00 AM",
    duration: 30,
    reason: "Regular checkup",
    status: "scheduled"
  },
  {
    patientId: 2,
    doctorId: 27,
    appointmentDate: "2024-01-20",
    appointmentTime: "10:30 AM",
    duration: 45,
    reason: "Follow-up consultation",
    status: "confirmed"
  },
  {
    patientId: 3,
    doctorId: 27,
    appointmentDate: "2024-01-21",
    appointmentTime: "02:00 PM",
    duration: 60,
    reason: "Initial consultation",
    status: "scheduled"
  },
  {
    patientId: 1,
    doctorId: 27,
    appointmentDate: "2024-01-22",
    appointmentTime: "11:00 AM",
    duration: 30,
    reason: "Blood pressure check",
    status: "pending"
  },
  {
    patientId: 4,
    doctorId: 27,
    appointmentDate: "2024-01-23",
    appointmentTime: "03:30 PM",
    duration: 45,
    reason: "Diabetes management",
    status: "scheduled"
  }
];

async function createAppointments() {
  console.log('Creating appointments for doctor ID 27...');
  
  for (let i = 0; i < appointments.length; i++) {
    try {
      const response = await axios.post(`${BASE_URL}/appointments`, appointments[i]);
      console.log(`✅ Created appointment ${i + 1}: ${appointments[i].reason}`);
    } catch (error) {
      console.error(`❌ Failed to create appointment ${i + 1}:`, error.response?.data || error.message);
    }
  }
}

async function testGetAppointments() {
  console.log('\nTesting GET /appointments endpoint...');
  
  try {
    const response = await axios.get(`${BASE_URL}/appointments`);
    console.log(`✅ Successfully retrieved ${response.data.data?.length || 0} appointments`);
    
    // Show appointments for doctor 27
    const doctor27Appointments = response.data.data?.filter(apt => apt.doctorId === 27) || [];
    console.log(`📋 Doctor 27 has ${doctor27Appointments.length} appointments:`);
    doctor27Appointments.forEach((apt, index) => {
      console.log(`  ${index + 1}. ${apt.reason} - ${apt.appointmentDate} ${apt.appointmentTime} (${apt.status})`);
    });
  } catch (error) {
    console.error('❌ Failed to get appointments:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Creating sample appointments for doctor ID 27...\n');
  
  try {
    await createAppointments();
    await testGetAppointments();
    
    console.log('\n✅ Setup complete! Doctor 27 should now have appointments in the dashboard.');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the script
main(); 