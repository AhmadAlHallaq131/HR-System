-- liquibase formatted sql

-- changeset hallaq:6
-- Hibernate Envers (Hibernate 6) expects revinfo_seq for revision ID generation.
-- V1 created revinfo with BIGSERIAL which auto-created revinfo_rev_seq (wrong name).
-- This sequence uses increment 50 to match Hibernate's default allocationSize.
CREATE SEQUENCE IF NOT EXISTS revinfo_seq START WITH 1 INCREMENT BY 50;
