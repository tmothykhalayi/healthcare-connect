# 🏥 HealthCore Connect – Backend (NestJS)

This is the **backend API** for the HealthCore Connect Hospital Management System — a role-based healthcare platform for managing appointments, medical records, prescriptions, pharmacy orders, and user access.

Built using **NestJS**, this backend supports secure, modular services for doctors, patients, pharmacists, and administrators.

---

## 🚀 Tech Stack

- **NestJS** (Node.js framework)
- **TypeORM** or **Prisma**
- **PostgreSQL** (or your DB of choice)
- **JWT Authentication** with role-based access
- **Class-validator** and DTO-based request validation
- **Swagger** (optional for API docs)

---

## 📁 Entities / Modules

| Module          | Description |
|------------------|-------------|
| `users`          | Core user entity shared across all roles |
| `admin`          | Admin-specific operations |
| `patient`        | Patient registration, profiles, and activities |
| `doctor`         | Doctor scheduling, profile, and access |
| `pharmacist`     | Pharmacy operations and inventory |
| `appointments`   | Slot-based appointment system |
| `slot`           | Doctor availability and time slots |
| `prescriptions`  | Digital prescriptions issued by doctors |
| `records`        | Patient health records and doctor notes |
| `medicines`      | Medicine stock and expiry management |
| `orders`         | Medicine orders placed by patients |
| `payments`       | Payment tracking and invoice generation |

---

## 🛠️ Setup Instructions

### 📦 Prerequisites

- Node.js 18+
- PostgreSQL or compatible database
- pnpm or npm

### ⚙️ Installation

```bash
git clone https://github.com/your-username/healthcore-backend.git
cd healthcore-backend
pnpm install
