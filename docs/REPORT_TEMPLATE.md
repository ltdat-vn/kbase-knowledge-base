# BÁO CÁO DỰ ÁN CÁ NHÂN: KBASE - KNOWLEDGE BASE SYSTEM

---

- **Họ và tên học viên**: [Họ và Tên Của Bạn]
- **Mã số học viên / Lớp**: [Lớp / Khóa học của bạn]
- **Tên Mentor**: [Tên Mentor]
- **Link GitHub Source Code**: [https://github.com/your-username/kbase-project](https://github.com/your-username/kbase-project)
- **Ngày hoàn thành**: 16/09/2026

---

## I. GIỚI THIỆU DỰ ÁN & MỤC TIÊU

**KBase (Knowledge Base Management System)** là hệ thống quản lý cơ sở tri thức dành cho các nhóm phát triển phần mềm và doanh nghiệp. Hệ thống cho phép:
1. **Quản lý tài khoản & phân quyền (RBAC)**: Phân cấp 3 vai trò rõ rệt:
   - **Admin**: Quản lý toàn bộ người dùng, dự án, theo dõi tổng quan dung lượng và thống kê hệ thống.
   - **Owner**: Tạo lập dự án, mời cộng tác viên tham gia, cấp quyền cho thành viên.
   - **User / Member**: Tham gia các dự án được chỉ định, tải lên tài liệu, tìm kiếm và hỏi đáp với AI Chatbot.
2. **Lưu trữ tài liệu đa định dạng**:
   - Tài liệu văn bản: PDF, Word (DOCX/DOC), Excel (XLSX/XLS), PowerPoint (PPTX/PPT), Markdown, TXT.
   - Hình ảnh: JPG, PNG, GIF, SVG, BMP.
   - Video / Bản ghi: MP4, MOV, AVI.
3. **Trợ lý AI Chatbot thông minh**:
   - Cho phép người dùng đặt câu hỏi tự nhiên về bất kỳ nội dung nào có trong các tài liệu đã tải lên.
   - Trả lời tổng hợp kèm liên kết trích dẫn chính xác tài liệu gốc (Source Citations).

---

## II. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ

- **Backend**: Java 21, Spring Boot 3.3, Spring Security 6 (Stateless JWT Authentication), Spring Data JPA, Hibernate, OpenAPI 3 / Swagger UI, Apache PDFBox.
- **Frontend**: React 18, TypeScript, Vite, Tailwind-compatible modern CSS Design System (Dark Glassmorphism), Lucide React Icons, Axios.
- **Database & Storage**: PostgreSQL / H2 in-memory compatibility profile, Local File Partitioning Storage Provider & MinIO S3 Object Storage Ready.
- **DevOps**: Docker, Docker Compose (`postgres`, `minio`, `backend`, `frontend`).

```
┌─────────────────────────────────────────────────────────┐
│              KBase Frontend (React + TS)                │
└───────────────────────────┬─────────────────────────────┘
                            │ REST API + JWT Bearer
┌───────────────────────────▼─────────────────────────────┐
│             KBase Backend (Spring Boot 3)               │
│  [Security / JWT]  [Project Service]  [Doc Storage]     │
│  [AI Semantic Engine / RAG]  [Swagger OpenAPI Docs]     │
└─────────────┬─────────────────────────────┬─────────────┘
              │                             │
┌─────────────▼─────────────┐ ┌─────────────▼─────────────┐
│    PostgreSQL Database    │ │   File Storage (MinIO)    │
│  (Users, Projects, Docs)  │ │   (PDF, Media, Videos)    │
└───────────────────────────┘ └───────────────────────────┘
```

---

## III. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE ERD & TABLES)

### 1. Sơ đồ thực thể liên kết (ERD)
*Hệ thống gồm 4 bảng cốt lõi: `users`, `projects`, `project_members`, `documents`.*

*(Chèn ảnh sơ đồ ERD từ file docs/DATABASE_ERD.md vào đây)*

---

### 2. Screenshots Dữ Liệu Thực Tế Trong Database

#### 2.1. Danh sách các bảng đã tạo (Database Tables)
*(Chèn hình chụp H2-Console hoặc pgAdmin hiển thị 4 bảng: users, projects, project_members, documents)*

#### 2.2. Dữ liệu bảng `users` với 3 vai trò
*(Chèn hình chụp câu truy vấn `SELECT * FROM users;` hiển thị admin@kbase.com, owner@kbase.com, user@kbase.com)*

#### 2.3. Dữ liệu bảng `projects` và `project_members`
*(Chèn hình chụp câu truy vấn `SELECT * FROM projects;`)*

#### 2.4. Dữ liệu bảng `documents`
*(Chèn hình chụp câu truy vấn `SELECT * FROM documents;` hiển thị các tài liệu đã upload)*

---

## IV. TÀI LIỆU VÀ THỬ NGHIỆM API (SWAGGER UI)

### 1. Tổng quan giao diện Swagger UI
*Toàn bộ API được tài liệu hóa chuẩn OpenAPI 3 tại `http://localhost:8080/swagger-ui/index.html`.*

*(Chèn hình chụp giao diện Swagger UI tổng quan có nút Authorize JWT)*

---

### 2. Thử nghiệm API Xác thực (Authentication)
- Endpoint: `POST /api/auth/login`
- Body: `{"email": "admin@kbase.com", "password": "Admin@123"}`
- Response: Trả về HTTP 200 kèm JWT Bearer Token.

*(Chèn hình chụp Swagger thực hiện Login thành công)*

---

### 3. Thử nghiệm API Quản lý Dự án (Projects)
- Endpoint: `GET /api/projects` và `POST /api/projects`
- Trả về danh sách dự án mà user có quyền truy cập kèm vai trò hiện tại (`OWNER`, `MEMBER`, `ADMIN`).

*(Chèn hình chụp Swagger gọi API /api/projects)*

---

### 4. Thử nghiệm API Tải lên & Tải về Tài liệu (Document Storage)
- Endpoint: `POST /api/documents/upload` (hỗ trợ multipart file)
- Endpoint: `GET /api/documents/download/{id}` (stream file tải về)

*(Chèn hình chụp Swagger gọi API upload hoặc danh sách file)*

---

### 5. Thử nghiệm API AI Chatbot Hỏi Đáp (AI Q&A with References)
- Endpoint: `POST /api/chat/ask`
- Body: `{"projectId": 1, "question": "What is the system architecture of KBase?"}`
- Response: Trả về câu trả lời tổng hợp kèm mảng `references` chứa ID tài liệu, tên file và trích dẫn.

*(Chèn hình chụp Swagger hoặc Postman kết quả câu trả lời AI)*

---

## V. GIAO DIỆN ỨNG DỤNG WEB (FRONTEND DEMO)

### 1. Màn hình Đăng nhập & Đăng ký (Auth Modal & Demo Preset)
*(Chèn ảnh chụp màn hình trang chủ với 3 nút demo Admin, Owner, User)*

### 2. Màn hình Dashboard Dự án (Project Workspaces)
*(Chèn ảnh chụp màn hình danh sách dự án với số lượng file và thành viên)*

### 3. Màn hình Chi tiết Dự án & Trình duyệt Tài liệu (Document Browser)
*(Chèn ảnh chụp màn hình tab Documents với các thẻ file và bộ lọc định dạng)*

### 4. Màn hình Tải lên Kéo thả (Drag & Drop File Upload)
*(Chèn ảnh chụp màn hình modal kéo thả file tải lên)*

### 5. Màn hình Quản lý Thành viên & Mời Teammate (Project Collaborators)
*(Chèn ảnh chụp màn hình danh sách thành viên và modal mời user)*

### 6. Màn hình Trợ lý AI Chatbot Thông Minh (AI Knowledge Chat)
*(Chèn ảnh chụp màn hình cuộc trò chuyện với AI, hiển thị câu trả lời và thẻ trích dẫn tài liệu)*

### 7. Màn hình Quản trị Hệ thống (Admin Oversight Panel)
*(Chèn ảnh chụp màn hình Admin Panel với 4 card thống kê dung lượng và bảng phân quyền)*

---

## VI. KẾT LUẬN & ĐÁNH GIÁ

- Dự án hoàn thành 100% các yêu cầu cốt lõi theo đề bài:
  - Hệ thống tài khoản 3 vai trò (Admin, Owner, User) với bảo mật JWT.
  - Quản lý dự án đa người dùng, hỗ trợ mời thành viên linh hoạt.
  - Quản lý và lưu trữ đa dạng tệp tin (tài liệu, bảng tính, hình ảnh, video).
  - Tích hợp thành công tính năng AI Chatbot giúp hỏi đáp và trích dẫn chính xác tài liệu nguồn.
  - Tích hợp tài liệu Swagger UI tự động và Docker Compose hỗ trợ triển khai đa nền tảng.
- Mã nguồn được cấu trúc rõ ràng, chuẩn Clean Architecture và sẵn sàng triển khai trên môi trường Production.
