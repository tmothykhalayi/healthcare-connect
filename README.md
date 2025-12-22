# Healthcare Connect API

A comprehensive healthcare management system built with NestJS, providing secure and scalable solutions for healthcare providers, patients, doctors, and administrators.

## 🏥 Overview

Healthcare Connect is a full-featured healthcare API that facilitates seamless communication between patients, doctors, pharmacists, and administrators. The system includes appointment management, medical records, prescription handling, payment processing, and AI-powered chat assistance.

## 🌐 Live Deployment

**Production API**: https://healthcare-connect-dwg6.onrender.com
**API Documentation**: https://healthcare-connect-dwg6.onrender.com/api

The application is currently deployed and running on Render, providing a stable and scalable healthcare management platform.

## 🚀 Features

### Core Features
- **User Management** - Multi-role system (Patient, Doctor, Admin, Pharmacist)
- **Authentication & Authorization** - JWT-based with role-based access control
- **Appointment Management** - Scheduling, reminders, and availability tracking
- **Medical Records** - Secure patient health records management
- **Prescription Management** - Digital prescriptions and pharmacy integration
- **Payment Processing** - Integrated payment solutions with Paystack
- **Chat System** - AI-powered patient support
- **Email Notifications** - Automated email services for appointments and updates
- **Logging & Monitoring** - Comprehensive application logging

### Advanced Features
- **Video Consultations** - Zoom integration for virtual appointments
- **Reminder System** - Automated appointment and medication reminders
- **Medicine Inventory** - Pharmacy stock management
- **Order Management** - Medicine ordering and fulfillment
- **Admin Dashboard** - Administrative oversight and statistics
- **API Documentation** - Comprehensive Swagger documentation
- **Chronic Disease Management** - Monitor and track vitals, medication adherence, and lifestyle data for patients with chronic conditions

## 🛠️ Technology Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Authentication**: JWT (Access + Refresh Tokens)
- **Documentation**: Swagger/OpenAPI
- **Email**: Nodemailer with Handlebars templates
- **Payments**: Paystack integration
- **Video**: Zoom SDK
- **AI**: Azure AI Inference & OpenAI integration
- **Containerization**: Docker & Docker Compose
- **Validation**: Class Validator & Class Transformer

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15+)
- Redis (v8+)
- Docker & Docker Compose (optional)
- pnpm package manager

## 🔧 Installation

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/tmothykhalayi/healthcare-connect.git
   cd healthcare-connect
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Redis cache on port 6379
   - Healthcare Connect API on port 8000

### Manual Installation

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/tmothykhalayi/healthcare-connect.git
   cd healthcare-connect
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start PostgreSQL and Redis services**

4. **Run the application**
   ```bash
   # Development
   pnpm run start:dev
   
   # Production
   pnpm run build
   pnpm run start:prod
   ```

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=HealthSystem
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_SYNC=true
DB_LOGGING=false

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_ACCESS_TOKEN_SECRET=your_secure_access_token_secret
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_SECRET=your_secure_refresh_token_secret
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# Throttling
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Application
PORT=8000
NODE_ENV=development
```

## 📚 API Documentation

Once the application is running, access the Swagger documentation at:
- **Development**: http://localhost:8000/api
- **Production**: https://healthcare-connect-dwg6.onrender.com/api

The API follows RESTful conventions with the following base URL structure:
```
/api/{resource}
```

## 🔐 Authentication

The API uses JWT-based authentication with role-based access control:

### User Roles
- **PATIENT** - Can book appointments, view medical records, order medicines
- **DOCTOR** - Can manage appointments, create prescriptions, access patient records
- **PHARMACIST** - Can manage medicines, fulfill prescriptions, handle orders
- **ADMIN** - Full system access and user management

### Authentication Flow
1. **Register/Login** - Obtain access and refresh tokens
2. **API Requests** - Include `Authorization: Bearer <access_token>` header
3. **Token Refresh** - Use refresh token to obtain new access tokens

Example authentication:
```bash
# Register
curl -X POST https://healthcare-connect-dwg6.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","firstName":"John","lastName":"Doe","role":"patient"}'

# Login
curl -X POST https://healthcare-connect-dwg6.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## 🏗️ Architecture

### Module Structure
```
src/
├── auth/              # Authentication & authorization
├── users/             # User management
├── patients/          # Patient-specific functionality
├── doctors/           # Doctor-specific functionality
├── pharmacist/        # Pharmacist management
├── appointments/      # Appointment scheduling
├── prescriptions/     # Prescription management
├── medicines/         # Medicine catalog
├── orders/            # Order processing
├── payments/          # Payment handling
├── chat/              # AI chat system
├── mail/              # Email services
├── reminder/          # Notification system
├── logs/              # Application logging
├── database/          # Database configuration
└── chronic-management/# Chronic disease monitoring and management
```

### Database Schema
The application uses PostgreSQL with TypeORM for the following entities:
- Users, Patients, Doctors, Pharmacists, Admins
- Appointments, Availability, Slots
- Prescriptions, Medicines, Orders
- Payments, Medical Records
- Chat Messages, Logs
- Vitals, Medication Logs, Lifestyle Logs (for chronic disease management)

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 📝 Available Scripts

```bash
# Development
pnpm run start:dev      # Start with hot reload
pnpm run start:debug    # Start with debugging

# Production
pnpm run build          # Build the application
pnpm run start:prod     # Start production server

# Code Quality
pnpm run lint           # ESLint
pnpm run format         # Prettier formatting

# Testing
pnpm run test           # Unit tests
pnpm run test:watch     # Watch mode
pnpm run test:e2e       # End-to-end tests
```

## 🔍 Key API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/signout` - Sign out
- `POST /api/auth/forgot-password` - Password reset

### Users & Profiles
- `GET /api/users/profile` - Get current user profile
- `GET /api/users` - Get all users (Admin)
- `PATCH /api/users/:id` - Update user

### Appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - Get user appointments
- `PATCH /api/appointments/:id` - Update appointment

### Medical Records
- `GET /api/records/medical` - Get medical records
- `POST /api/records/medical` - Create medical record

### Prescriptions & Medicines
- `GET /api/prescriptions` - Get prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/medicines` - Get medicine catalog

### Chronic Disease Management
- `POST /api/chronic-management/vitals` - Record patient vitals
- `GET /api/chronic-management/vitals` - Get patient vitals history
- `POST /api/chronic-management/medication-logs` - Log medication adherence
- `GET /api/chronic-management/medication-logs` - Get medication adherence history
- `POST /api/chronic-management/lifestyle-logs` - Record lifestyle activities
- `GET /api/chronic-management/lifestyle-logs` - Get lifestyle activity history

## 🔧 Development

### Adding New Features
1. Create feature module: `nest g module feature-name`
2. Generate service: `nest g service feature-name`
3. Generate controller: `nest g controller feature-name`
4. Add DTOs, entities, and tests
5. Update module imports in `app.module.ts`

### Database Migrations
```bash
# Generate migration
npm run typeorm migration:generate -- -n MigrationName

# Run migrations
npm run typeorm migration:run

# Revert migration
npm run typeorm migration:revert
```

## 🚀 Deployment

### Docker Production
```bash
# Build production image
docker build -f Dockerfile.prod -t healthcare-connect:prod .

# Run with production compose
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
1. Set `NODE_ENV=production` in environment
2. Configure production database and Redis
3. Set secure JWT secrets
4. Configure email service
5. Set up reverse proxy (nginx)
6. Enable SSL/TLS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email timothy.khalayi@example.com or create an issue in the GitHub repository.

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- TypeORM for excellent database integration
- All contributors and healthcare professionals who provided insights

---

**Healthcare Connect** - Bridging the gap between technology and healthcare 🏥💻
