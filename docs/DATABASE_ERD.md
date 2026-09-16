# KBase - Database Architecture & Entity Relationship Diagram (ERD)

## 1. Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ PROJECT_MEMBERS : "joins"
    USERS ||--o{ PROJECTS : "owns"
    USERS ||--o{ DOCUMENTS : "uploads"
    PROJECTS ||--o{ PROJECT_MEMBERS : "has"
    PROJECTS ||--o{ DOCUMENTS : "contains"

    USERS {
        BIGINT id PK "Auto Increment"
        VARCHAR email UK "Unique email (100)"
        VARCHAR password "BCrypt Hash"
        VARCHAR full_name "Full Name"
        VARCHAR role "ADMIN | OWNER | USER"
        BOOLEAN enabled "Active account status"
        TIMESTAMP created_at "Registration date"
        TIMESTAMP updated_at "Last update"
    }

    PROJECTS {
        BIGINT id PK "Auto Increment"
        VARCHAR name "Project Name"
        TEXT description "Project Overview"
        BIGINT owner_id FK "References USERS(id)"
        TIMESTAMP created_at "Created timestamp"
        TIMESTAMP updated_at "Last modification"
    }

    PROJECT_MEMBERS {
        BIGINT id PK "Auto Increment"
        BIGINT project_id FK "References PROJECTS(id)"
        BIGINT user_id FK "References USERS(id)"
        VARCHAR role "OWNER | MEMBER | VIEWER"
        TIMESTAMP joined_at "Invitation date"
    }

    DOCUMENTS {
        BIGINT id PK "Auto Increment"
        VARCHAR title "Display Title"
        VARCHAR original_filename "Original filename"
        VARCHAR stored_filename "Storage key"
        VARCHAR content_type "MIME Type"
        VARCHAR file_category "DOCUMENT | SPREADSHEET | PRESENTATION | IMAGE | VIDEO | TEXT | OTHER"
        BIGINT file_size "Bytes"
        VARCHAR file_path "Relative storage path"
        TEXT summary "User notes or extracted summary"
        TEXT text_content "Extracted text for search & AI RAG"
        BIGINT project_id FK "References PROJECTS(id)"
        BIGINT uploaded_by FK "References USERS(id)"
        TIMESTAMP created_at "Uploaded timestamp"
        TIMESTAMP updated_at "Modified timestamp"
    }
```

## 2. Table Specifications & Constraints

### `users`
- Stores user accounts. Passwords hashed using **BCrypt** with salt rounds = 10.
- `role`: Supports 3 user types as defined by requirements:
  - `ROLE_ADMIN`: Global administrator with access to all projects, user accounts, and system stats.
  - `ROLE_OWNER`: Project creator who can create workspaces, invite teammates, and manage project documents.
  - `ROLE_USER`: Standard member who participates in assigned projects, uploads files, and queries the AI chatbot.

### `projects`
- Represents partitioned knowledge base workspaces.
- `owner_id`: Foreign key linked to `users(id)`. Cascades on deletion.

### `project_members`
- Facilitates many-to-many relationships between users and projects.
- Unique constraint on `(project_id, user_id)` ensures a user cannot be added twice to the same project.
- `role`: Project-scoped permission (`OWNER`, `MEMBER`, `VIEWER`).

### `documents`
- Stores document metadata, physical file path, and extracted textual content.
- `file_category`: Classified automatically from file extension upon upload:
  - `DOCUMENT`: `.pdf`, `.doc`, `.docx`, `.odt`
  - `SPREADSHEET`: `.xls`, `.xlsx`, `.csv`
  - `PRESENTATION`: `.ppt`, `.pptx`
  - `IMAGE`: `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.bmp`
  - `VIDEO`: `.mp4`, `.mov`, `.avi`
  - `TEXT`: `.txt`, `.md`, `.json`, `.yaml`, `.sql`
- `text_content`: Full text extracted via Apache PDFBox and UTF-8 stream readers, enabling instant substring search and AI context retrieval.
