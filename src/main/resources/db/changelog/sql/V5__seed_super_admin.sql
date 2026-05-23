-- liquibase formatted sql

-- changeset hallaq:5
-- Super admin seed — BCrypt hash of "admin123"
INSERT INTO users (username, password, email, full_name, role, tenant_id, is_active)
VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'admin@hrsystem.com',
    'System Admin',
    'SUPER_ADMIN',
    '',
    true
);
