# HR SaaS Platform

A **multi-tenant HR Management System** built with Spring Boot 3, featuring role-based access control,
tenant data isolation, and audit logging.

![Java](https://img.shields.io/badge/Java-17-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.5-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Keycloak](https://img.shields.io/badge/Keycloak-23.0-red)
![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)

---

## 🚀 Features

### Core Functionality
- ✅ **Employee Management** - Create, update, delete employees
- ✅ **Department Management** - Organize employees by departments
- ✅ **Leave Request System** - Submit, approve, reject leave requests
- ✅ **Search Functionality** - Find employees by name

### Security & Multi-Tenancy
- 🔐 **OAuth2 / OIDC Authentication** via Keycloak
- 🔐 **JWT Token-Based Authorization**
- 🔐 **Role-Based Access Control (RBAC)**
  - `ADMIN` - Full system access across all tenants
  - `HR_MANAGER` - Manage employees within own tenant
  - `EMPLOYEE` - View profile and submit leaves
- 🏢 **Multi-Tenant Data Isolation** - Each tenant's data is completely isolated

### Enterprise Features
- 📊 **Audit Trail** - Full history of changes using Hibernate Envers
- 📝 **Automatic Audit Fields** - created_at, updated_at, created_by, updated_by
- 🗄️ **Database Migrations** - Liquibase for version-controlled schema changes

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Spring Boot 3.4.5, Java 17 |
| **Security** | Spring Security 6, OAuth2 Resource Server, Keycloak |
| **Database** | PostgreSQL 15 |
| **ORM** | Spring Data JPA, Hibernate 6 |
| **Audit** | Hibernate Envers, Spring Data Envers |
| **Migrations** | Liquibase |
| **Containerization** | Docker, Docker Compose |

---

## 📦 Quick Start

### Prerequisites

- Docker Desktop (running)
- Java 17+
- Maven 3.8+

### Run in 3 Steps

```bash
# 1. Start infrastructure (PostgreSQL + Keycloak)
docker compose up -d db keycloak

# 2. Run the application
mvnw.cmd spring-boot:run  # Windows
./mvnw spring-boot:run   # Linux/Mac

# 3. Test the API
curl http://localhost:8080/actuator/health
```

📖 **Detailed setup instructions:** See [HOW_TO_RUN.md](HOW_TO_RUN.md)

---

## 🔑 Authentication

### Get Access Token

```bash
curl -X POST "http://localhost:8180/realms/hr-saas/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=hr-saas-app&client_secret=DrVjHvKjCDMwSKCVFjZsN16wLLmDpd8D&username=hallaq.techcorp&password=password123"
```

### Test Users

| Username | Password | Role | Tenant |
|----------|----------|------|--------|
| `hallaq.techcorp` | `password123` | HR_MANAGER | TechCorp |
| `emp.techcorp` | `password123` | EMPLOYEE | TechCorp |
| `sara.healthplus` | `password123` | HR_MANAGER | HealthPlus |
| `super.admin` | `password123` | ADMIN | All Tenants |

---

## 📡 API Endpoints

### Departments

```http
GET    /api/departments          # List all departments (tenant-scoped)
GET    /api/departments/{id}     # Get department by ID
POST   /api/departments          # Create department (HR_MANAGER)
PUT    /api/departments/{id}     # Update department (HR_MANAGER)
DELETE /api/departments/{id}     # Delete department (ADMIN)
```

### Employees

```http
GET    /api/employees            # List all employees (tenant-scoped)
GET    /api/employees/{id}       # Get employee by ID
GET    /api/employees/search?q=name  # Search by name
POST   /api/employees            # Create employee (HR_MANAGER)
PUT    /api/employees/{id}       # Update employee (HR_MANAGER)
DELETE /api/employees/{id}       # Delete employee (ADMIN)
```

### Leave Requests

```http
GET    /api/leaves               # List all leaves (tenant-scoped)
GET    /api/leaves/my            # Get my leaves
POST   /api/leaves/employee/{id} # Submit leave request
PUT    /api/leaves/{id}/approve  # Approve leave (HR_MANAGER)
PUT    /api/leaves/{id}/reject   # Reject leave (HR_MANAGER)
```

---

## 🏗️ Architecture

### Multi-Tenant Design

```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway / Load Balancer          │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Spring Boot Application                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │  TenantFilter (extracts tenant_id from JWT)     │    │
│  └─────────────────────────────────────────────────┘    │
│                            │                             │
│  ┌─────────────────────────▼─────────────────────────┐  │
│  │  Service Layer (business logic per tenant)        │  │
│  └─────────────────────────┬─────────────────────────┘  │
└────────────────────────────┼─────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  TechCorp    │  │ HealthPlus   │  │   Other      │  │
│  │  Data        │  │ Data         │  │   Tenants    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Tenant Isolation

Every database query automatically filters by `tenant_id`:

```java
// Repository method - tenant filtering is automatic
List<Employee> findAllByTenantId(String tenantId);

// Service layer - gets tenant from ThreadLocal
String tenantId = TenantContext.getTenantId();
```

---

## 📁 Project Structure

```
HR-System/
├── compose.yaml                 # Docker Compose config
├── Dockerfile                   # Docker build config
├── keycloak-realm.json         # Pre-configured Keycloak realm
├── pom.xml                     # Maven dependencies
│
├── src/main/java/.../hr_system/
│   ├── HrSystemApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java      # OAuth2 & JWT config
│   │   ├── TenantFilter.java        # Tenant isolation filter
│   │   └── AuditConfig.java         # Audit configuration
│   ├── controller/                  # REST API endpoints
│   ├── service/                     # Business logic
│   ├── repository/                  # Data access (JPA)
│   ├── entity/                      # JPA entities
│   ├── dto/                         # Request/Response DTOs
│   ├── enums/                       # Enumerations
│   ├── exception/                   # Global error handling
│   └── tenant/                      # Tenant context management
│
└── src/main/resources/
    ├── application.properties       # App configuration
    └── db/changelog/               # Liquibase migrations
        ├── V1__create_tables.sql
        └── V2__seed_data.sql
```

---

## 🧪 Testing

### Test Tenant Isolation

```bash
# 1. Create employee as TechCorp user
curl -X POST "http://localhost:8080/api/employees" \
  -H "Authorization: Bearer $TECHCORP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Ahmad","lastName":"Ali","email":"ahmad@techcorp.com"}'

# 2. Try to access with HealthPlus token - should return 404
curl "http://localhost:8080/api/employees/1" \
  -H "Authorization: Bearer $HEALTHPLUS_TOKEN"
```

### Test Role-Based Access

```bash
# EMPLOYEE trying to create employee - should return 403
curl -X POST "http://localhost:8080/api/employees" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User"}'
```

---

## 📊 Database Schema

### Core Tables

- `departments` - Department information
- `employees` - Employee records
- `leave_requests` - Leave request tracking

### Audit Tables (Auto-generated)

- `departments_aud` - Department change history
- `employees_aud` - Employee change history
- `leave_requests_aud` - Leave request change history
- `revinfo` - Revision information for auditing

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | Database connection URL | `jdbc:postgresql://localhost:5432/hr_saas_db` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `postgres123` |
| `SERVER_PORT` | HTTP server port | `8080` |

### Keycloak Configuration

- **Realm:** `hr-saas`
- **Client ID:** `hr-saas-app`
- **Client Secret:** `DrVjHvKjCDMwSKCVFjZsN16wLLmDpd8D`
- **Issuer URI:** `http://localhost:8180/realms/hr-saas`

---

## 🚢 Deployment

### Docker Build

```bash
docker build -t hr-system:latest .
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/hr_saas_db \
  hr-system:latest
```

### Production Considerations

- ✅ Enable HTTPS for Keycloak and API
- ✅ Use environment-specific configuration
- ✅ Set strong database passwords
- ✅ Configure proper logging and monitoring
- ✅ Enable connection pooling tuning
- ✅ Set up backup and recovery procedures

---

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

⭐ **Star this repo if you find it useful!**
