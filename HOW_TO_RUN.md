# HR SaaS Platform - How to Run

Quick start guide for running the Multi-Tenant HR Management System locally.

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Software | Version | Download |
|----------|---------|----------|
| **Docker Desktop** | Latest | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **Java JDK** | 17+ | [adoptium.net](https://adoptium.net/) |
| **Maven** | 3.8+ | [maven.apache.org](https://maven.apache.org/download.cgi) |
| **Git** (optional) | Latest | [git-scm.com](https://git-scm.com/) |

### Verify Installation

```bash
# Check Docker
docker --version

# Check Java
java -version

# Check Maven
mvn --version
```

---

## Quick Start (5 Minutes)

### Step 1: Clone or Download the Project

```bash
git clone <repository-url>
cd HR-System
```

### Step 2: Start Docker Containers

```bash
# Start PostgreSQL and Keycloak
docker compose up -d db keycloak

# Wait 30 seconds for Keycloak to initialize
```

### Step 3: Run the Application

**Option A: Using Maven Wrapper (Recommended)**
```bash
# Windows
mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

**Option B: Using Installed Maven**
```bash
mvn spring-boot:run
```

### Step 4: Verify Everything is Running

| Service | URL | Status |
|---------|-----|--------|
| **Spring Boot API** | http://localhost:8080 | ✅ |
| **Keycloak** | http://localhost:8180 | ✅ |
| **PostgreSQL** | localhost:5432 | ✅ |

**Test the API:**
```bash
curl http://localhost:8080/actuator/health
```

---

## Authentication Setup

### Keycloak Realm

The project includes a pre-configured Keycloak realm (`keycloak-realm.json`) that is automatically imported when you start the containers.

### Test Users

| Username | Password | Role | Tenant |
|----------|----------|------|--------|
| `hallaq.techcorp` | `password123` | HR_MANAGER | TechCorp |
| `emp.techcorp` | `password123` | EMPLOYEE | TechCorp |
| `sara.healthplus` | `password123` | HR_MANAGER | HealthPlus |
| `super.admin` | `password123` | ADMIN | All Tenants |

### Get a JWT Token

```bash
curl -X POST "http://localhost:8180/realms/hr-saas/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=hr-saas-app" \
  -d "client_secret=DrVjHvKjCDMwSKCVFjZsN16wLLmDpd8D" \
  -d "username=hallaq.techcorp" \
  -d "password=password123"
```

Copy the `access_token` from the response.

---

## Testing the API

### Using cURL

**Get All Departments (HR_MANAGER or ADMIN only):**
```bash
curl http://localhost:8080/api/departments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get All Employees:**
```bash
curl http://localhost:8080/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create an Employee:**
```bash
curl -X POST "http://localhost:8080/api/employees" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@techcorp.com",
    "jobTitle": "Developer"
  }'
```

### Using Postman

1. **Import the collection** (optional): Create a new collection with your endpoints
2. **Set up environment variables:**
   - `base_url`: `http://localhost:8080`
   - `kc_url`: `http://localhost:8180`
   - `client_secret`: `DrVjHvKjCDMwSKCVFjZsN16wLLmDpd8D`
   - `token`: (paste your access token)

3. **Add Authorization header** to requests:
   ```
   Authorization: Bearer {{token}}
   ```

---

## API Endpoints

### Departments

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/departments` | EMPLOYEE, HR_MANAGER, ADMIN | Get all departments (tenant-scoped) |
| GET | `/api/departments/{id}` | EMPLOYEE, HR_MANAGER, ADMIN | Get department by ID |
| POST | `/api/departments` | HR_MANAGER | Create department |
| PUT | `/api/departments/{id}` | HR_MANAGER | Update department |
| DELETE | `/api/departments/{id}` | ADMIN | Delete department |

### Employees

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/employees` | HR_MANAGER, ADMIN | Get all employees (tenant-scoped) |
| GET | `/api/employees/{id}` | EMPLOYEE, HR_MANAGER, ADMIN | Get employee by ID |
| GET | `/api/employees/search?q=name` | HR_MANAGER, ADMIN | Search employees by name |
| POST | `/api/employees` | HR_MANAGER | Create employee |
| PUT | `/api/employees/{id}` | HR_MANAGER | Update employee |
| DELETE | `/api/employees/{id}` | ADMIN | Delete employee |

### Leave Requests

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/leaves` | HR_MANAGER, ADMIN | Get all leaves (tenant-scoped) |
| GET | `/api/leaves/my` | ALL | Get my leave requests |
| POST | `/api/leaves/employee/{id}` | EMPLOYEE, HR_MANAGER | Submit leave request |
| PUT | `/api/leaves/{id}/approve` | HR_MANAGER | Approve leave |
| PUT | `/api/leaves/{id}/reject` | HR_MANAGER | Reject leave |

---

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access across all tenants. Can delete departments and employees. |
| **HR_MANAGER** | Manage employees and departments within own tenant. Can approve/reject leaves. |
| **EMPLOYEE** | View own profile and departments. Can submit leave requests. |

---

## Troubleshooting

### Application Won't Start

**Check Docker containers:**
```bash
docker ps
```

**View application logs:**
```bash
docker logs hr-system-server-1
```

### Connection Errors

**PostgreSQL not accessible:**
```bash
# Restart database container
docker compose restart db

# Check database is running
docker exec hr_postgres psql -U postgres -c "SELECT 1"
```

**Keycloak not accessible:**
```bash
# Wait for Keycloak to fully start (takes ~30 seconds)
docker logs hr_keycloak --tail 20
```

### Authentication Errors (401/403)

1. **Token expired** - Tokens expire after 5 minutes. Get a new token.
2. **Wrong role** - Ensure your user has the required role for the endpoint.
3. **Cross-tenant access** - You can only access data within your tenant.

### Reset Everything

```bash
# Stop and remove all containers
docker compose down

# Remove database volume (WARNING: deletes all data)
docker volume rm hr-system_postgres_data

# Start fresh
docker compose up -d
```

---

## Building for Production

### Create JAR File

```bash
mvn clean package -DskipTests
```

### Run JAR

```bash
java -jar target/HR-System-0.0.1-SNAPSHOT.jar
```

### Docker Build

```bash
docker build -t hr-system:latest .
docker run -p 8080:8080 hr-system:latest
```

---

## Project Structure

```
HR-System/
├── compose.yaml              # Docker Compose configuration
├── pom.xml                   # Maven dependencies
├── src/main/java/.../
│   ├── config/               # Security & tenant configuration
│   ├── controller/           # REST API endpoints
│   ├── service/              # Business logic
│   ├── repository/           # Data access layer
│   ├── entity/               # JPA entities
│   ├── dto/                  # Request/Response objects
│   └── exception/            # Error handling
└── src/main/resources/
    ├── application.properties # Application configuration
    └── db/changelog/         # Database migrations
```

---

## Need Help?

- Check the main [README.md](README.md) for project overview
- Open an issue on GitHub for bugs or questions

---

#### Happy Coding! 
