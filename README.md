# Healthcare System Data Model

## Overview

This document describes the key entities and relationships within the healthcare system data model. The system supports managing users of various roles (patients, doctors, admins, pharmacies), appointments, medical records, payments, medicines, and orders.

---

### 1. User
- `id: string`  
- `email: string`  
- `password: string` (hashed)  
- `firstName: string`  
- `lastName: string`  
- `role: enum` ('admin', 'doctor', 'patient', 'pharmacy', etc.)  
- `isEmailVerified: boolean`  
- `createdAt: Date`  
- `updatedAt: Date`  

---

### 2. Patient
- `id: string` (foreign key to User)  
- `userId: string` (reference to User)  
- `dateOfBirth: Date`  
- `gender: string`  
- `address: string`  
- `phoneNumber: string`  
- `assignedDoctorId: string` (reference to Doctor)  
- `medicalHistory: string`  
- `createdAt: Date`  
- `updatedAt: Date`  

---

### 3. Doctor
- `id: string` (foreign key to User)  
- `userId: string` (reference to User)  
- `specializations: string[]` (array of specialties)  
- `licenseNumber: string`  
- `experienceYears: number`  
- `bio: string`  
- `createdAt: Date`  
- `updatedAt: Date`  
- Inherits `isEmailVerified` from User  

---

### 4. Appointment
- `id: string`  
- `patientId: string` (reference to Patient)  
- `doctorId: string` (reference to Doctor)  
- `appointmentDateTime: Date`  
- `status: enum` ('pending', 'confirmed', 'cancelled', 'completed')  
- `reason: string`  
- `createdAt: Date`  
- `updatedAt: Date`  

---

### 5. Records
- `id: string` (foreign key to User)  
- `patientId: string` (reference to Patient)  
- `doctorId: string` (reference to Doctor who created/updated)  
- `recordDate: Date`  
- `description: string`  
- `attachments: string[]` (URLs or file references)  
- `createdAt: Date`  
- `updatedAt: Date`  

---

### 6. Admin
- `id: string` (foreign key to User)  
- `userId: string` (reference to User)  
- `permissions: string[]` (array of permission identifiers or roles, e.g., ['manage-users', 'manage-settings'])  
- `createdAt: Date`  
- `updatedAt: Date`  
- Inherits `isEmailVerified` from User  

---

### 7. Medicine
- `id: string` (foreign key to User)  
- `name: string`  
- `description: string`  
- `manufacturer: string`  
- `price: number`  
- `expiryDate: Date`  
- `createdAt: Date`  
- `updatedAt: Date`  

---

### 8. Payment
- `id: string` (foreign key to User)  
- `userId: string` (reference to User)  
- `amount: number`  
- `paymentMethod: string`  
- `status: enum` ('pending', 'completed', 'failed', 'refunded')  
- `relatedEntityType: string` (e.g., 'Appointment', 'Order')  
- `relatedEntityId: string`  
- `transactionId: string`  
- `createdAt: Date`  
- `updatedAt: Date`  

---

### 9. Pharmacy
- `id: string` (foreign key to User)  
- `name: string` (name of the hospital pharmacy unit)  
- `location: string` (physical location in the hospital, e.g., "Ground Floor, Building A")  
- `description: string` (optional, summary of services or specialties)  
- `managedBy: string` (optional, reference to a User — Admin or Doctor)  
- `isActive: boolean` (whether this pharmacy is currently operational)  
- `createdAt: Date`  
- `updatedAt: Date`  

---

### 10. Orders
- `id: string` (foreign key to User)  
- `patientId: string` (reference to Patient)  
- `orderDate: Date`  
- `status: enum` ('pending', 'processed', 'shipped', 'delivered', 'cancelled')  
- `totalAmount: number`  
- `createdAt: Date`  
- `updatedAt: Date`  

---

## Relationships Summary

- **User** is the base entity for Patient, Doctor, Admin, Pharmacy, and Medicine.  
- **Patient** links to one assigned **Doctor**; has many **Appointments**, **Records**, and **Orders**.  
- **Doctor** has many assigned **Patients**, **Appointments**, and **Records**.  
- **Appointment** links one **Patient** and one **Doctor**, and may have one **Payment**.  
- **Records** are created by **Doctor** for a **Patient**.  
- **Admin** manages system permissions.  
- **Pharmacy** may be managed by a **User** (Admin or Doctor), manages **Medicines** and fulfills **Orders**.  
- **Payment** references the paying **User** and a related entity (Appointment, Order, etc.).
