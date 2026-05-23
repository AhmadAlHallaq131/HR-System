# HR SaaS Platform

![Language](https://img.shields.io/badge/Language-Java-orange) 
![Framework](https://img.shields.io/badge/Framework-Spring%20Boot-brightgreen) 
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue) 
![Build](https://img.shields.io/badge/Build-Maven-red) 
![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1)



A full-stack, multi-tenant HR management system built with **Spring Boot** and **React**. Three completely separate portals — Super Admin, HR Manager, and Employee — each with its own dedicated UI and feature set.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17 · Spring Boot 3.4 · Spring Security 6 · JWT |
| ORM | Spring Data JPA · Hibernate 6 · Hibernate Envers (audit) |
| Database | PostgreSQL 15 · Liquibase (migrations) |
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS |
| Infrastructure | Docker · Docker Compose |

---

## Architecture

The system is built around **three isolated roles**, each with its own portal and data scope:

```
SUPER_ADMIN  (platform level — no tenant)
  └── Manages companies and HR Manager accounts

HR_MANAGER   (tenant scoped)
  └── Manages departments, employees, attendance, leave requests

EMPLOYEE     (tenant scoped)
  └── Views own profile, checks in/out, submits leave requests
```

### Multi-tenancy
Every request is scoped to a tenant via a `TenantFilter` that reads the `tenantId` from the JWT and stores it in a `ThreadLocal`. All repository queries include a `tenant_id` condition automatically. `SUPER_ADMIN` bypasses this filter.

---

## Features

### Super Admin
- View all companies on the platform with employee counts
- Create new company accounts (generates an HR Manager login)
- Toggle company active/inactive status
- Platform-level stats dashboard

### HR Manager
- **Employees** — Create employee accounts (User + Employee linked atomically), activate/deactivate accounts, search and filter
- **Departments** — Full CRUD for departments
- **Attendance** — View daily attendance by date, today's summary (present / checked-in / checked-out / absent)
- **Leave Requests** — Approve or reject pending requests, filter by status
- **Dashboard** — Today's attendance summary + pending leave requests at a glance

### Employee
- **Home** — Personal profile card + check-in / check-out widget + team grid with colleague status
- **My Attendance** — Monthly history with duration tracking
- **My Leaves** — Submit leave requests, view history and status

### Security
- JWT authentication (24-hour expiration)
- BCrypt password hashing
- Role-based endpoint protection via `@PreAuthorize`
- JSON error responses for 401 and 403
- Admin password rotated on **every server restart** — UUID password written to a local credentials file (never stored in code or DB permanently)

---

## Project Structure

```
HR-System/
├── src/main/java/               # Spring Boot backend
│   └── com/mainprofile/hr_system/
│       ├── config/              # Security, JWT, Tenant, Audit filters
│       ├── controller/          # REST controllers
│       ├── dto/                 # Request / Response DTOs
│       ├── entity/              # JPA entities
│       ├── enums/               # AttendanceStatus, LeaveStatus
│       ├── exception/           # Global exception handler
│       ├── repository/          # Spring Data repositories
│       ├── service/             # Business logic
│       └── tenant/              # TenantContext (ThreadLocal)
├── src/main/resources/
│   ├── application.properties   # Config (uses env vars with defaults)
│   └── db/changelog/sql/        # Liquibase migrations V1–V7
├── frontend/                    # React + TypeScript frontend
│   └── src/
│       ├── api/                 # Axios API clients per domain
│       ├── components/          # Shared UI components
│       ├── contexts/            # AuthContext
│       ├── layouts/             # AdminLayout, HrLayout, EmployeeLayout
│       ├── pages/               # Role-specific pages
│       │   ├── admin/
│       │   ├── hr/
│       │   └── employee/
│       └── types/               # TypeScript interfaces
├── compose.yaml                 # Docker Compose (DB only for dev)
├── Dockerfile                   # Backend Docker image
├── .env.example                 # Environment variable template
└── pom.xml
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Docker Desktop | Latest |
| Java JDK | 17+ |
| Node.js | 18+ |
| IntelliJ IDEA | Any |

### 1 — Clone and configure

```bash
git clone https://github.com/your-username/HR-System.git
cd HR-System
cp .env.example .env
```

Edit `.env` with your values (the defaults work for local development out of the box).

### 2 — Start the database

```bash
docker compose up -d
```

Starts a PostgreSQL 15 container on port **5555**.

> **Clean reset** (drop all data and remigrate):
> ```bash
> docker compose down -v && docker compose up -d
> ```

### 3 — Start the backend

Open the project in **IntelliJ IDEA** and run `HrSystemApplication`.

On first startup Liquibase runs all migrations (V1–V7) and creates the schema. The `DataInitializer` then generates a UUID admin password and writes it to the credentials file.

Backend runs at `http://localhost:8080`.

### 4 — Get the admin password

Open `admin_credentials.txt` (created next to the project root). It contains:

```
================================================
  HR System - Admin Credentials
================================================
  Generated : 2025-05-23 14:03:17
  Username  : admin
  Password  : f3a9c2d1-7b8e-4f2a-9c1d-0e5f6a7b8c9d
================================================
  This file is overwritten on every server restart.
  Keep it secure. Do not commit it to version control.
================================================
```

> The password changes on **every restart**. Old sessions stop working immediately.

### 5 — Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Usage Flow

```
1. Login as admin → Create a company (generates HR Manager credentials)
2. Share HR Manager credentials with the company
3. HR Manager logs in → Creates departments and employee accounts
4. Share employee credentials with employees
5. Employees log in → Check in/out, view team, submit leave requests
6. HR Manager reviews leave requests, monitors attendance
```

---

## API Reference

All endpoints require `Authorization: Bearer <token>` except `/api/auth/login`.

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/companies` | SUPER_ADMIN |
| POST | `/api/admin/companies` | SUPER_ADMIN |
| GET | `/api/admin/companies/{id}` | SUPER_ADMIN |
| PUT | `/api/admin/companies/{id}` | SUPER_ADMIN |
| GET | `/api/admin/stats` | SUPER_ADMIN |

### Employees
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/employees` | HR_MANAGER |
| GET | `/api/employees/{id}` | HR_MANAGER, EMPLOYEE |
| GET | `/api/employees/search?q=` | HR_MANAGER |
| POST | `/api/employees` | HR_MANAGER |
| PUT | `/api/employees/{id}` | HR_MANAGER |
| DELETE | `/api/employees/{id}` | HR_MANAGER |

### Users (Account management)
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/users` | HR_MANAGER |
| PUT | `/api/users/{id}/activate` | HR_MANAGER |
| PUT | `/api/users/{id}/deactivate` | HR_MANAGER |
| PUT | `/api/users/{id}/reset-password` | HR_MANAGER |

### Departments
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/departments` | HR_MANAGER |
| GET | `/api/departments/{id}` | HR_MANAGER, EMPLOYEE |
| POST | `/api/departments` | HR_MANAGER |
| PUT | `/api/departments/{id}` | HR_MANAGER |
| DELETE | `/api/departments/{id}` | HR_MANAGER |

### Attendance
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/attendance/check-in` | EMPLOYEE |
| POST | `/api/attendance/check-out` | EMPLOYEE |
| GET | `/api/attendance/today` | EMPLOYEE |
| GET | `/api/attendance/my?year=&month=` | EMPLOYEE |
| GET | `/api/attendance?date=&employeeId=` | HR_MANAGER |
| GET | `/api/attendance/today/summary` | HR_MANAGER |

### Leave Requests
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/leaves` | HR_MANAGER |
| GET | `/api/leaves/my` | EMPLOYEE |
| POST | `/api/leaves/employee/{id}` | EMPLOYEE |
| PUT | `/api/leaves/{id}/approve` | HR_MANAGER |
| PUT | `/api/leaves/{id}/reject` | HR_MANAGER |

### Me (Employee self-service)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/me/profile` | EMPLOYEE |
| GET | `/api/me/team` | EMPLOYEE |

---

## Database Migrations

| Version | Description |
|---------|-------------|
| V1 | Create core tables: departments, employees, leave_requests, Envers audit tables |
| V2 | Seed initial data |
| V3 | Add users table |
| V4 | Add companies, attendance_records; extend users and employees tables |
| V5 | Seed super admin user |
| V6 | Add `revinfo_seq` sequence for Hibernate Envers |
| V7 | Add missing audit columns to `_aud` tables |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5555` | PostgreSQL port |
| `DB_NAME` | `hr_saas_db` | Database name |
| `DB_USERNAME` | `postgres` | DB username |
| `DB_PASSWORD` | `postgres123` | DB password |
| `JWT_SECRET` | *(built-in)* | Base64-encoded JWT signing key |
| `JWT_EXPIRATION` | `86400000` | Token lifetime in ms (24 hours) |
| `ADMIN_CREDENTIALS_FILE` | `./admin_credentials.txt` | Path where admin password is written |
| `SERVER_PORT` | `8080` | Backend port |

---

## Troubleshooting

**401 — Authentication required**
Token expired (24h). Log out and log back in.

**403 — Access denied**
Your role doesn't have permission. Make sure you're logged in with the right account.

**500 on first start after DB wipe**
The backend must be restarted after `docker compose down -v`. Liquibase only runs at Spring Boot startup.

**Database connection errors**
```bash
docker ps                          # check container is running
docker compose restart db          # restart the container
docker compose down -v && docker compose up -d   # full reset
```

---
