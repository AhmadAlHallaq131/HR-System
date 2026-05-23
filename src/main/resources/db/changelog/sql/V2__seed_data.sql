-- liquibase formatted sql

-- changeset hallaq:2

-- TechCorp departments
INSERT INTO departments (tenant_id, name, description, created_at, created_by)
VALUES
  ('TechCorp', 'Engineering', 'Software development team', NOW(), 'system'),
  ('TechCorp', 'Design',      'UI/UX design team',          NOW(), 'system');

-- HealthPlus departments
INSERT INTO departments (tenant_id, name, description, created_at, created_by)
VALUES
  ('HealthPlus', 'Medical',   'Doctor and nurse team', NOW(), 'system'),
  ('HealthPlus', 'Admin',     'Administrative staff',  NOW(), 'system');
