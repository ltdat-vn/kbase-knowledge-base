-- =========================================================
-- KBase - Knowledge Base System Database Schema (PostgreSQL)
-- =========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ROLE_ADMIN', 'ROLE_OWNER', 'ROLE_USER')),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Project Members (Many-to-Many with Roles)
CREATE TABLE IF NOT EXISTS project_members (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'MEMBER', 'VIEWER')),
    joined_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_project_user UNIQUE (project_id, user_id)
);

-- 4. Documents & Knowledge Files
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_category VARCHAR(30) NOT NULL CHECK (file_category IN ('DOCUMENT', 'SPREADSHEET', 'PRESENTATION', 'IMAGE', 'VIDEO', 'TEXT', 'OTHER')),
    file_size BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    summary TEXT,
    text_content TEXT,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Fast Search
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(file_category);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

-- =========================================================
-- Initial Seed Data (Passwords: 'Admin@123', 'Owner@123', 'User@123')
-- =========================================================
INSERT INTO users (id, email, password, full_name, role, enabled)
VALUES 
(1, 'admin@kbase.com', '$2a$10$m7Ht/sueZbkzPKZuWtSOuu.SVJl/9zWnAIZf7CILvYdnNMrAjiIkm', 'Alexander Admin', 'ROLE_ADMIN', true),
(2, 'owner@kbase.com', '$2a$10$rMMNXyyXu9KBAetguOIhk.BjNEoayXujw6FARIr6vZiehRBEbHsWu', 'Olivia Owner', 'ROLE_OWNER', true),
(3, 'user@kbase.com', '$2a$10$4yscyUXD3hMjnP1SgmStwug1SzauWV4dOUJ.JyDSywUIcE1K4eoZG', 'Uri User', 'ROLE_USER', true)
ON CONFLICT (email) DO NOTHING;
