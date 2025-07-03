# Telemedicine Module Documentation

## Overview

The Telemedicine Module provides comprehensive functionality for managing virtual healthcare appointments. It allows patients to schedule video consultations with doctors, enables doctors to manage their telemedicine schedules, and provides administrators with oversight and analytics.

## Features

### 🔐 **Authentication & Authorization**
- JWT-based authentication required for all endpoints
- Role-based access control:
  - **Patients**: Can create appointments and view their own appointments
  - **Doctors**: Can view all appointments, manage their schedule, and update appointment status
  - **Admins**: Full access to all telemedicine functionality and statistics

### 📅 **Appointment Management**
- Create telemedicine appointments with flexible scheduling
- Real-time doctor availability checking
- Appointment status tracking (scheduled, confirmed, in-progress, completed, cancelled, no-show)
- Reschedule and cancel appointments
- Duration management (15-120 minutes)

### 👥 **User-Specific Views**
- Patients can view their own appointments
- Doctors can view their scheduled appointments
- Admins can view all appointments across the system

### 📊 **Analytics & Statistics**
- Comprehensive telemedicine statistics
- Appointment completion rates
- Patient and doctor engagement metrics
- Recent activity tracking

## API Endpoints

### Base URL
```
http://localhost:8000/telemedicine
```

### Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Endpoint Reference

### 1. Create Telemedicine Appointment
```http
POST /telemedicine
```

**Roles**: PATIENT, DOCTOR, ADMIN

**Request Body**:
```json
{
  "patientId": 1,
  "doctorId": 5,
  "appointmentDate": "2025-07-06",
  "appointmentTime": "10:00",
  "duration": 30,
  "status": "scheduled",
  "notes": "Telemedicine video call for routine consultation"
}
```

**Response**:
```json
{
  "statusCode": 201,
  "message": "Telemedicine appointment created successfully",
  "data": {
    "id": 1,
    "patientId": 1,
    "doctorId": 5,
    "appointmentDate": "2025-07-06T00:00:00.000Z",
    "appointmentTime": "10:00",
    "duration": 30,
    "status": "scheduled",
    "notes": "Telemedicine video call for routine consultation",
    "createdAt": "2025-07-03T17:30:00.000Z",
    "updatedAt": "2025-07-03T17:30:00.000Z"
  }
}
```

### 2. Get All Telemedicine Appointments
```http
GET /telemedicine
```

**Roles**: DOCTOR, ADMIN

**Response**:
```json
{
  "statusCode": 200,
  "message": "Telemedicine appointments retrieved successfully",
  "data": [
    {
      "id": 1,
      "patient": { "id": 1, "firstName": "John", "lastName": "Doe" },
      "doctor": { "id": 5, "firstName": "Dr. Smith", "lastName": "Johnson" },
      "appointmentDate": "2025-07-06T00:00:00.000Z",
      "appointmentTime": "10:00",
      "duration": 30,
      "status": "scheduled",
      "notes": "Telemedicine video call"
    }
  ]
}
```

### 3. Get Appointment by ID
```http
GET /telemedicine/{id}
```

**Roles**: PATIENT, DOCTOR, ADMIN

**Response**:
```json
{
  "statusCode": 200,
  "message": "Telemedicine appointment found",
  "data": {
    "id": 1,
    "patient": { "id": 1, "firstName": "John", "lastName": "Doe" },
    "doctor": { "id": 5, "firstName": "Dr. Smith", "lastName": "Johnson" },
    "appointmentDate": "2025-07-06T00:00:00.000Z",
    "appointmentTime": "10:00",
    "duration": 30,
    "status": "scheduled",
    "notes": "Telemedicine video call"
  }
}
```

### 4. Get Patient Appointments
```http
GET /telemedicine/patient/{patientId}
```

**Roles**: PATIENT, DOCTOR, ADMIN

**Response**:
```json
{
  "statusCode": 200,
  "message": "Patient telemedicine appointments retrieved successfully",
  "data": [
    {
      "id": 1,
      "patient": { "id": 1, "firstName": "John", "lastName": "Doe" },
      "doctor": { "id": 5, "firstName": "Dr. Smith", "lastName": "Johnson" },
      "appointmentDate": "2025-07-06T00:00:00.000Z",
      "appointmentTime": "10:00",
      "duration": 30,
      "status": "scheduled"
    }
  ]
}
```

### 5. Get Doctor Appointments
```http
GET /telemedicine/doctor/{doctorId}
```

**Roles**: DOCTOR, ADMIN

**Response**:
```json
{
  "statusCode": 200,
  "message": "Doctor telemedicine appointments retrieved successfully",
  "data": [
    {
      "id": 1,
      "patient": { "id": 1, "firstName": "John", "lastName": "Doe" },
      "doctor": { "id": 5, "firstName": "Dr. Smith", "lastName": "Johnson" },
      "appointmentDate": "2025-07-06T00:00:00.000Z",
      "appointmentTime": "10:00",
      "duration": 30,
      "status": "scheduled"
    }
  ]
}
```

### 6. Update Appointment
```http
PATCH /telemedicine/{id}
```

**Roles**: DOCTOR, ADMIN

**Request Body**:
```json
{
  "appointmentDate": "2025-07-08",
  "appointmentTime": "14:30",
  "status": "confirmed",
  "notes": "Rescheduled due to doctor availability"
}
```

**Response**:
```json
{
  "statusCode": 200,
  "message": "Telemedicine appointment updated successfully",
  "data": {
    "id": 1,
    "appointmentDate": "2025-07-08T00:00:00.000Z",
    "appointmentTime": "14:30",
    "status": "confirmed",
    "notes": "Rescheduled due to doctor availability"
  }
}
```

### 7. Delete Appointment
```http
DELETE /telemedicine/{id}
```

**Roles**: DOCTOR, ADMIN

**Response**:
```json
{
  "statusCode": 200,
  "message": "Telemedicine appointment with ID 1 deleted successfully"
}
```

### 8. Get Telemedicine Statistics
```http
GET /telemedicine/stats/overview
```

**Roles**: ADMIN

**Response**:
```json
{
  "statusCode": 200,
  "message": "Telemedicine statistics retrieved successfully",
  "data": {
    "total": 150,
    "scheduled": 45,
    "completed": 95,
    "cancelled": 10,
    "recent": 25,
    "uniquePatients": 120,
    "uniqueDoctors": 15,
    "completionRate": "63.33"
  }
}
```

---

## 🔧 Data Models

### CreateTelemedicineDto
```typescript
{
  patientId: number;           // Required: Patient ID
  doctorId: number;            // Required: Doctor ID
  appointmentDate: string;     // Required: Date in YYYY-MM-DD format
  appointmentTime: string;     // Required: Time in HH:MM format
  duration?: number;           // Optional: Duration in minutes (15-120)
  status?: string;             // Optional: Appointment status
  notes?: string;              // Optional: Additional notes
}
```

### UpdateTelemedicineDto
```typescript
{
  patientId?: number;          // Optional: Patient ID
  doctorId?: number;           // Optional: Doctor ID
  appointmentDate?: string;    // Optional: Date in YYYY-MM-DD format
  appointmentTime?: string;    // Optional: Time in HH:MM format
  duration?: number;           // Optional: Duration in minutes (15-120)
  status?: string;             // Optional: Appointment status
  notes?: string;              // Optional: Additional notes
}
```

---

## 🚨 Error Handling

### Common Error Responses

**400 Bad Request** - Validation errors:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

**404 Not Found** - Resource not found:
```json
{
  "statusCode": 404,
  "message": "Appointment not found",
  "error": "Not Found"
}
```

**409 Conflict** - Doctor not available:
```json
{
  "statusCode": 409,
  "message": "Doctor is not available at 2025-07-06 10:00",
  "error": "Conflict"
}
```

**401 Unauthorized** - Missing or invalid token:
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**403 Forbidden** - Insufficient permissions:
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

---

## 🧪 Testing

Use the provided `tele.http` file for comprehensive testing:

1. **Setup**: Replace `@authToken` with a valid JWT token
2. **Test Scenarios**: The file includes:
   - Basic CRUD operations
   - Error handling scenarios
   - Complete workflow testing
   - Validation testing

### Quick Test Commands
```bash
# Start the server
npm run start:dev

# Test with curl (replace TOKEN with actual JWT)
curl -X POST http://localhost:8000/telemedicine \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "doctorId": 5,
    "appointmentDate": "2025-07-06",
    "appointmentTime": "10:00"
  }'
```

---

## 🔒 Security Features

1. **JWT Authentication**: All endpoints require valid JWT tokens
2. **Role-Based Access**: Different permissions for different user roles
3. **Input Validation**: Comprehensive validation using class-validator
4. **SQL Injection Protection**: TypeORM provides parameterized queries
5. **Rate Limiting**: Global rate limiting applied to all endpoints

---

## 📈 Performance Considerations

1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Pagination**: Consider adding pagination for large datasets
3. **Caching**: Implement Redis caching for frequently accessed data
4. **Connection Pooling**: TypeORM handles database connection pooling

---

## 🚀 Future Enhancements

1. **Real-time Notifications**: WebSocket integration for live updates
2. **Video Integration**: Third-party video call API integration
3. **Calendar Integration**: Sync with external calendar systems
4. **Payment Processing**: Integrated payment for telemedicine sessions
5. **File Upload**: Support for medical documents and images
6. **AI Integration**: Automated appointment scheduling and reminders

---

## 📞 Support

For issues or questions regarding the Telemedicine Module:

1. Check the server logs for detailed error information
2. Verify JWT token validity and user permissions
3. Ensure all required fields are provided in requests
4. Test with the provided `tele.http` file

---

*Last Updated: July 2025* 