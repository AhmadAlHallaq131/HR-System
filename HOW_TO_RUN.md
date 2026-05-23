# HR SaaS Platform — How to Run

Multi-Tenant HR Management System with React frontend and JWT authentication.

---

## Prerequisites

| Software | Version |
|----------|---------|
| **Docker Desktop** | Latest |
| **Java JDK** | 17+ |
| **Node.js** | 18+ |

---

## Running the Project (Dev Mode)

The backend runs from IntelliJ, the frontend runs via `npm run dev`, and only the database runs in Docker.

### Step 1 — Start the Database

```bash
docker compose up -d
```

This starts a PostgreSQL container on port **5555**.

> If you've run the project before and need a clean start (e.g., after a migration change):
> ```bash
> docker compose down -v
> docker compose up -d
> ```

### Step 2 — Start the Backend

Open the project in **IntelliJ IDEA** and run `HrSystemApplication`. The backend starts on `http://localhost:8080`.

On first startup, the app will:
1. Run Liquibase migrations (creates tables)
2. Seed 3 default users via `DataInitializer`

### Step 3 — Start the Frontend

```bash
cd frontend
npm install        # first time only
npm run dev
```

Opens at **http://localhost:5173**

---

## Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `hr_manager` | `hr123` | HR Manager |
| `employee` | `emp123` | Employee |

All demo users belong to the **TechCorp** tenant.

---

## API Endpoints

All endpoints require `Authorization: Bearer <token>` header (except `/api/auth/login`).

### Auth

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |

### Departments

| Method | Endpoint | Roles |
|--------|----------|-------|
| GET | `/api/departments` | HR_MANAGER, ADMIN |
| GET | `/api/departments/{id}` | EMPLOYEE, HR_MANAGER, ADMIN |
| POST | `/api/departments` | HR_MANAGER |
| PUT | `/api/departments/{id}` | HR_MANAGER |
| DELETE | `/api/departments/{id}` | ADMIN |

### Employees

| Method | Endpoint | Roles |
|--------|----------|-------|
| GET | `/api/employees` | HR_MANAGER, ADMIN |
| GET | `/api/employees/{id}` | EMPLOYEE, HR_MANAGER, ADMIN |
| GET | `/api/employees/search?q=name` | HR_MANAGER, ADMIN |
| POST | `/api/employees` | HR_MANAGER |
| PUT | `/api/employees/{id}` | HR_MANAGER |
| DELETE | `/api/employees/{id}` | ADMIN |

### Leave Requests

| Method | Endpoint | Roles |
|--------|----------|-------|
| GET | `/api/leaves` | HR_MANAGER, ADMIN |
| GET | `/api/leaves/my` | EMPLOYEE, HR_MANAGER, ADMIN |
| POST | `/api/leaves/employee/{id}` | EMPLOYEE, HR_MANAGER |
| PUT | `/api/leaves/{id}/approve` | HR_MANAGER |
| PUT | `/api/leaves/{id}/reject` | HR_MANAGER |

---

## Troubleshooting

### "Access denied" / 403 errors
- Ensure you are logged in and the token is stored in localStorage.
- Log out and log back in to get a fresh token.

### "Authentication required" / 401 errors
- Your token expired (default: 24 hours). Log out and log back in.

### Database connection errors
```bash
# Check the container is running
docker ps

# Verify DB is accepting connections
docker exec hr_postgres psql -U postgres -d hr_saas_db -c "SELECT 1"

# Restart the container
docker compose restart db
```

### Clean reset
```bash
docker compose down -v    # removes all data
docker compose up -d
# then restart the backend from IntelliJ
```
