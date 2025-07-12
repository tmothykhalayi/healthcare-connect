const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

// Sample doctor users to create
const doctorUsers = [
  {
    email: "doctor.smith@example.com",
    password: "Test1234!",
    firstName: "John",
    lastName: "Smith",
    phoneNumber: "+1234567890",
    role: "doctor",
    isEmailVerified: true
  },
  {
    email: "doctor.johnson@example.com",
    password: "Test1234!",
    firstName: "Sarah",
    lastName: "Johnson",
    phoneNumber: "+1234567891",
    role: "doctor",
    isEmailVerified: true
  },
  {
    email: "doctor.wilson@example.com",
    password: "Test1234!",
    firstName: "Michael",
    lastName: "Wilson",
    phoneNumber: "+1234567892",
    role: "doctor",
    isEmailVerified: true
  },
  {
    email: "doctor.brown@example.com",
    password: "Test1234!",
    firstName: "Emily",
    lastName: "Brown",
    phoneNumber: "+1234567893",
    role: "doctor",
    isEmailVerified: true
  }
];

// Sample doctor profiles to create
const doctorProfiles = [
  {
    userId: 1,
    licenseNumber: "MD123456",
    specialization: "Cardiology",
    yearsOfExperience: 15,
    education: "MBBS, MD Cardiology",
    phoneNumber: "+1234567890",
    officeAddress: "123 Medical Center Dr, Suite 100",
    consultationFee: 150.00,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableHours: "9:00 AM - 5:00 PM",
    bio: "Experienced cardiologist with over 15 years of practice in treating heart conditions and cardiovascular diseases.",
    status: "active"
  },
  {
    userId: 2,
    licenseNumber: "MD123457",
    specialization: "Neurology",
    yearsOfExperience: 12,
    education: "MBBS, MD Neurology",
    phoneNumber: "+1234567891",
    officeAddress: "456 Neurology Clinic, Suite 200",
    consultationFee: 180.00,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    availableHours: "8:00 AM - 4:00 PM",
    bio: "Specialized neurologist focusing on brain and nervous system disorders with extensive experience in stroke treatment.",
    status: "active"
  },
  {
    userId: 3,
    licenseNumber: "MD123458",
    specialization: "Pediatrics",
    yearsOfExperience: 10,
    education: "MBBS, MD Pediatrics",
    phoneNumber: "+1234567892",
    officeAddress: "789 Children's Hospital, Suite 150",
    consultationFee: 120.00,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableHours: "9:00 AM - 6:00 PM",
    bio: "Dedicated pediatrician with expertise in child development and pediatric care for all age groups.",
    status: "active"
  },
  {
    userId: 4,
    licenseNumber: "MD123459",
    specialization: "Dermatology",
    yearsOfExperience: 8,
    education: "MBBS, MD Dermatology",
    phoneNumber: "+1234567893",
    officeAddress: "321 Skin Care Center, Suite 300",
    consultationFee: 140.00,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    availableHours: "10:00 AM - 6:00 PM",
    bio: "Board-certified dermatologist specializing in skin conditions, cosmetic procedures, and skin cancer screening.",
    status: "active"
  }
];

async function createDoctorUsers() {
  console.log('Creating doctor users...');
  
  for (let i = 0; i < doctorUsers.length; i++) {
    try {
      const response = await axios.post(`${BASE_URL}/users`, doctorUsers[i]);
      console.log(`✅ Created doctor user: ${doctorUsers[i].firstName} ${doctorUsers[i].lastName}`);
    } catch (error) {
      console.error(`❌ Failed to create doctor user ${doctorUsers[i].firstName} ${doctorUsers[i].lastName}:`, error.response?.data || error.message);
    }
  }
}

async function createDoctorProfiles() {
  console.log('\nCreating doctor profiles...');
  
  for (let i = 0; i < doctorProfiles.length; i++) {
    try {
      const response = await axios.post(`${BASE_URL}/doctors`, doctorProfiles[i]);
      console.log(`✅ Created doctor profile for user ID ${doctorProfiles[i].userId}`);
    } catch (error) {
      console.error(`❌ Failed to create doctor profile for user ID ${doctorProfiles[i].userId}:`, error.response?.data || error.message);
    }
  }
}

async function testGetDoctors() {
  console.log('\nTesting GET /doctors endpoint...');
  
  try {
    const response = await axios.get(`${BASE_URL}/doctors`);
    console.log(`✅ Successfully retrieved ${response.data.data?.length || 0} doctors`);
    if (response.data.data) {
      response.data.data.forEach((doctor, index) => {
        console.log(`  ${index + 1}. Dr. ${doctor.user?.firstName} ${doctor.user?.lastName} - ${doctor.specialization}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to get doctors:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Setting up sample doctors data...\n');
  
  try {
    await createDoctorUsers();
    await createDoctorProfiles();
    await testGetDoctors();
    
    console.log('\n✅ Setup complete! You can now test the frontend.');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the script
main(); 