-- liquibase formatted sql

-- changeset hallaq:3

CREATE TABLE users (
    id        BIGSERIAL    PRIMARY KEY,
    username  VARCHAR(100) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    email     VARCHAR(255) NOT NULL UNIQUE,
    role      VARCHAR(50)  NOT NULL,
    tenant_id VARCHAR(100) NOT NULL
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
