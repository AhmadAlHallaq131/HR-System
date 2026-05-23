-- liquibase formatted sql

-- changeset hallaq:7
-- Hibernate Envers mirrors ALL entity fields into _aud tables.
-- V1 created the audit tables without BaseEntity fields (created_at, updated_at, created_by, updated_by).
-- V4 added user_id and phone to employees but not to employees_aud.
-- This migration adds all missing columns so Envers insert succeeds.

ALTER TABLE departments_aud ADD COLUMN IF NOT EXISTS created_at  TIMESTAMP;
ALTER TABLE departments_aud ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMP;
ALTER TABLE departments_aud ADD COLUMN IF NOT EXISTS created_by  VARCHAR(100);
ALTER TABLE departments_aud ADD COLUMN IF NOT EXISTS updated_by  VARCHAR(100);

ALTER TABLE employees_aud ADD COLUMN IF NOT EXISTS created_at  TIMESTAMP;
ALTER TABLE employees_aud ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMP;
ALTER TABLE employees_aud ADD COLUMN IF NOT EXISTS created_by  VARCHAR(100);
ALTER TABLE employees_aud ADD COLUMN IF NOT EXISTS updated_by  VARCHAR(100);
ALTER TABLE employees_aud ADD COLUMN IF NOT EXISTS user_id     BIGINT;
ALTER TABLE employees_aud ADD COLUMN IF NOT EXISTS phone       VARCHAR(50);

ALTER TABLE leave_requests_aud ADD COLUMN IF NOT EXISTS created_at  TIMESTAMP;
ALTER TABLE leave_requests_aud ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMP;
ALTER TABLE leave_requests_aud ADD COLUMN IF NOT EXISTS created_by  VARCHAR(100);
ALTER TABLE leave_requests_aud ADD COLUMN IF NOT EXISTS updated_by  VARCHAR(100);
