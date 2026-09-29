-- ====================================================================
-- KBASE KNOWLEDGE BASE & AI COPILOT PLATFORM
-- DATABASE SCHEMA SCRIPT (PostgreSQL 16)
-- Tương thích: DBeaver, pgAdmin 4, VS Code Database Client
-- ====================================================================

-- 1. BẢNG NGƯỜI DÙNG HỆ THỐNG (users)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG DỰ ÁN TRI THỨC (projects)
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id BIGINT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_projects_owner FOREIGN KEY (owner_id) 
        REFERENCES users (id) ON DELETE CASCADE
);

-- 3. BẢNG THÀNH VIÊN THAM GIA DỰ ÁN (project_members)
-- Quan hệ Nhiều - Nhiều (N - N) giữa User và Project
CREATE TABLE IF NOT EXISTS project_members (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pm_project FOREIGN KEY (project_id) 
        REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_user FOREIGN KEY (user_id) 
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_project_user UNIQUE (project_id, user_id)
);

-- 4. BẢNG TÀI LIỆU DỰ ÁN (documents)
-- Lưu thông tin file tải lên và nội dung text bóc tách cho AI RAG
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_category VARCHAR(50),
    file_size BIGINT,
    file_path VARCHAR(500),
    summary TEXT,
    text_content TEXT,
    project_id BIGINT NOT NULL,
    uploaded_by BIGINT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documents_project FOREIGN KEY (project_id) 
        REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_documents_uploader FOREIGN KEY (uploaded_by) 
        REFERENCES users (id) ON DELETE SET NULL
);

-- TẠO CHỈ MỤC (INDEX) TỐI ƯU HÓA TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_pm_project_user ON project_members(project_id, user_id);

-- ====================================================================
-- CÁC CÂU LỆNH TRUY VẤN THƯỜNG DÙNG (DÙNG ĐỂ DEMO VỚI THẦY)
-- ====================================================================

-- 1. Xem danh sách tất cả tài khoản và vai trò trong hệ thống:
-- SELECT id, email, full_name, role, created_at FROM users ORDER BY id;

-- 2. Xem các dự án kèm thông tin người chủ sở hữu (Owner):
-- SELECT p.id, p.name, p.description, u.full_name AS owner_name, u.email AS owner_email
-- FROM projects p
-- JOIN users u ON p.owner_id = u.id;

-- 3. Xem danh sách tài liệu được tải lên trong từng dự án:
-- SELECT d.id, d.title, d.original_filename, d.file_category, d.file_size, p.name AS project_name
-- FROM documents d
-- JOIN projects p ON d.project_id = p.id;
