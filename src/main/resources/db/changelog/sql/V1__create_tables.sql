-- liquibase formatted sql

-- changeset hallaq:1

CREATE TABLE departments (
    id          BIGSERIAL PRIMARY KEY,
    tenant_id   VARCHAR(100) NOT NULL,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100)
);

CREATE TABLE employees (
    id            BIGSERIAL PRIMARY KEY,
    tenant_id     VARCHAR(100) NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    job_title     VARCHAR(200),
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    department_id BIGINT REFERENCES departments(id),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP,
    created_by    VARCHAR(100),
    updated_by    VARCHAR(100)
);

CREATE TABLE leave_requests (
    id           BIGSERIAL PRIMARY KEY,
    tenant_id    VARCHAR(100) NOT NULL,
    employee_id  BIGINT NOT NULL REFERENCES employees(id),
    start_date   DATE NOT NULL,
    end_date     DATE NOT NULL,
    reason       TEXT,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reviewed_by  VARCHAR(100),
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP,
    created_by   VARCHAR(100),
    updated_by   VARCHAR(100)
);

-- Hibernate Envers audit tables
CREATE TABLE revinfo (
    rev      BIGSERIAL PRIMARY KEY,
    revtstmp BIGINT
);

CREATE TABLE departments_aud (
    id          BIGINT,
    rev         BIGINT REFERENCES revinfo(rev),
    revtype     SMALLINT,
    tenant_id   VARCHAR(100),
    name        VARCHAR(200),
    description TEXT,
    PRIMARY KEY (id, rev)
);

CREATE TABLE employees_aud (
    id            BIGINT,
    rev           BIGINT REFERENCES revinfo(rev),
    revtype       SMALLINT,
    tenant_id     VARCHAR(100),
    first_name    VARCHAR(100),
    last_name     VARCHAR(100),
    email         VARCHAR(255),
    job_title     VARCHAR(200),
    status        VARCHAR(20),
    department_id BIGINT,
    PRIMARY KEY (id, rev)
);

CREATE TABLE leave_requests_aud (
    id          BIGINT,
    rev         BIGINT REFERENCES revinfo(rev),
    revtype     SMALLINT,
    tenant_id   VARCHAR(100),
    employee_id BIGINT,
    start_date  DATE,
    end_date    DATE,
    reason      TEXT,
    status      VARCHAR(20),
    reviewed_by VARCHAR(100),
    PRIMARY KEY (id, rev)
);

-- Performance indexes — tenant_id queries will be fast
CREATE INDEX idx_departments_tenant   ON departments(tenant_id);
CREATE INDEX idx_employees_tenant     ON employees(tenant_id);
CREATE INDEX idx_employees_email      ON employees(email);
CREATE INDEX idx_leave_tenant         ON leave_requests(tenant_id);
CREATE INDEX idx_leave_employee       ON leave_requests(employee_id);
