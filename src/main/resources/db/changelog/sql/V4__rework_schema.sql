-- liquibase formatted sql

-- changeset hallaq:4

-- Companies table (one per tenant / HR customer)
CREATE TABLE companies (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    tenant_id  VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    is_active  BOOLEAN      NOT NULL DEFAULT true
);

-- Attendance records (one per employee per day)
CREATE TABLE attendance_records (
    id              BIGSERIAL   PRIMARY KEY,
    tenant_id       VARCHAR(100) NOT NULL,
    employee_id     BIGINT      NOT NULL REFERENCES employees(id),
    date            DATE        NOT NULL,
    check_in_time   TIMESTAMP,
    check_out_time  TIMESTAMP,
    status          VARCHAR(20) NOT NULL DEFAULT 'CHECKED_IN',
    work_minutes    INTEGER,
    UNIQUE(employee_id, date)
);

CREATE INDEX idx_attendance_tenant_date ON attendance_records(tenant_id, date);
CREATE INDEX idx_attendance_employee    ON attendance_records(employee_id);

-- Extend users table
ALTER TABLE users ADD COLUMN full_name   VARCHAR(200);
ALTER TABLE users ADD COLUMN is_active   BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN employee_id BIGINT  REFERENCES employees(id);

-- Extend employees table
ALTER TABLE employees ADD COLUMN user_id BIGINT REFERENCES users(id);
ALTER TABLE employees ADD COLUMN phone   VARCHAR(50);
