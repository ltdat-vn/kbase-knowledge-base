# KBase - Enterprise Knowledge Base System 🚀

> **Hệ thống quản lý cơ sở tri thức dự án & Trợ lý AI Chatbot thông minh**

KBase là nền tảng quản lý tri thức và tài liệu dự án dành cho các nhóm kỹ sư và doanh nghiệp. Hệ thống cho phép phân quyền người dùng (Admin, Owner, User), tổ chức tài liệu đa định dạng theo từng dự án (PDF, Office, hình ảnh, video), tìm kiếm tức thời và tích hợp trợ lý AI trả lời câu hỏi kèm trích dẫn tài liệu nguồn gốc.

---

## 📑 Bảng Mục Lục
1. [Tính Năng Chính](#tính-năng-chính)
2. [Kiến Trúc & Công Nghệ](#kiến-trúc--công-nghệ)
3. [Tài Khoản Mẫu (Demo Credentials)](#tài-khoản-mẫu-demo-credentials)
4. [Hướng Dẫn Khởi Chạy Nhanh (Quick Start)](#hướng-dẫn-khởi-chạy-nhanh-quick-start)
5. [Tài Liệu API & Swagger UI](#tài-liệu-api--swagger-ui)
6. [Hướng Dẫn Nộp Bài Cho Mentor (Báo Cáo PDF)](#hướng-dẫn-nộp-bài-cho-mentor-báo-cáo-pdf)
7. [Triển Khai Bằng Docker Compose](#triển-khai-bằng-docker-compose)

---

## 🎯 Tính Năng Chính

### 1. Quản lý Tài khoản & Phân quyền (RBAC)
- Xác thực bảo mật chuẩn **JWT (JSON Web Token)**.
- **3 vai trò người dùng**:
  - **Admin**: Quản lý tất cả người dùng, đổi quyền, kích hoạt/vô hiệu hóa tài khoản, xem thống kê dung lượng hệ thống.
  - **Owner**: Tạo dự án mới, quản lý thành viên, mời cộng tác viên bằng email, xóa/sửa dự án.
  - **User**: Tham gia các dự án được mời, tải tài liệu/video lên dự án, đặt câu hỏi cho AI Chatbot.

### 2. Quản lý Dự án (Project Workspaces)
- Không gian làm việc riêng biệt cho từng dự án.
- Mời thành viên với vai trò cụ thể (`OWNER`, `MEMBER`, `VIEWER`).
- Một người dùng có thể tham gia nhiều dự án khác nhau.

### 3. Lưu trữ & Trình duyệt Tài liệu Đa định dạng
- Hỗ trợ tải lên đa dạng tệp tin:
  - **Documents**: PDF, Word (DOCX/DOC), Excel (XLSX/XLS), PowerPoint (PPTX/PPT), Markdown, TXT.
  - **Images**: JPG, PNG, GIF, SVG, BMP.
  - **Videos**: MP4, MOV, AVI.
- Giao diện kéo thả file hiện đại (Drag & Drop) kèm thanh tiến trình.
- Tìm kiếm tức thời theo tên file, tiêu đề, tóm tắt và nội dung văn bản bên trong file.
- Hỗ trợ **Xem trước trực tuyến (Inline Preview)** và **Tải xuống an toàn (Direct Download)**.

### 4. Trợ lý AI Chatbot (Document Q&A with Citations)
- Hỏi đáp thông minh về bất kỳ tài liệu nào có trong dự án.
- Phân tích và trích xuất ngữ cảnh liên quan (Semantic Context Extraction).
- Trả về câu trả lời tổng hợp kèm **Thẻ trích dẫn tài liệu nguồn (Cited Source Documents)** hiển thị chính xác tên file và đoạn văn bản đối chiếu.

---

## ⚙️ Kiến Trúc & Công Nghệ

- **Backend**:
  - Java 21 LTS
  - Spring Boot 3.3.4
  - Spring Security 6 (Stateless JWT Filter)
  - Spring Data JPA & Hibernate
  - Apache PDFBox (Trích xuất văn bản từ PDF phục vụ AI indexing)
  - Springdoc OpenAPI 2.6 (Swagger UI tự động)
- **Frontend**:
  - React 18 & TypeScript
  - Vite
  - Modern Glassmorphism & Dark Aesthetic CSS
  - Lucide React Icons & Axios
- **Database & Storage**:
  - PostgreSQL (Hỗ trợ H2 profile tương thích PostgreSQL cho chế độ dev 0-setup)
  - Local Partitioned Storage Provider & MinIO S3-compatible Object Storage
- **AI Part**:
  - Semantic Search Engine & RAG Pipeline tích hợp sẵn trong Spring Boot
  - Microservice Python FastAPI (`ai-service/`) dự phòng mở rộng
- **DevOps**:
  - Multi-stage Dockerfiles cho Backend & Frontend
  - `docker-compose.yml` (Postgres, MinIO, Backend, Frontend)

---

## 🔑 Tài Khoản Mẫu (Demo Credentials)

Hệ thống tự động khởi tạo sẵn các tài khoản demo khi ứng dụng chạy lần đầu:

| Vai trò | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@kbase.com` | `Admin@123` | Toàn quyền quản trị hệ thống, quản lý users & stats |
| **Owner** | `owner@kbase.com` | `Owner@123` | Tạo dự án, mời thành viên, quản lý tài liệu |
| **User** | `user@kbase.com` | `User@123` | Tham gia dự án, tải tài liệu, hỏi đáp AI |

> 💡 *Trên giao diện Frontend, bạn có thể click nhanh vào các nút **Admin / Owner / User** để đăng nhập ngay trong 1 giây mà không cần gõ bàn phím!*

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

### 1. Chạy Backend (Spring Boot 3)
Yêu cầu: Đã cài JDK 21 và Maven.

```bash
cd backend
mvn spring-boot:run
```
- Server Backend sẽ chạy tại: `http://localhost:8080`
- Swagger API Docs: `http://localhost:8080/swagger-ui/index.html`
- H2 Database Console (nếu cần xem DB): `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:kbasedb`, User: `sa`, Password để trống)

### 2. Chạy Frontend (React + Vite)
Yêu cầu: Đã cài Node.js (v18+).

```bash
cd frontend
npm run dev
```
- Truy cập giao diện ứng dụng tại: `http://localhost:5173`

---

## 📖 Tài Liệu API & Swagger UI

Truy cập trực tiếp trình khám phá API tương tác tại:
👉 `http://localhost:8080/swagger-ui/index.html`

- Nhóm `/api/auth/**`: Đăng nhập, Đăng ký, Lấy thông tin user hiện tại.
- Nhóm `/api/projects/**`: CRUD dự án, mời và gỡ thành viên.
- Nhóm `/api/documents/**`: Upload multipart, tìm kiếm, xem trước, tải về.
- Nhóm `/api/chat/**`: Hỏi đáp AI chatbot trích dẫn tài liệu.
- Nhóm `/api/admin/**`: Quản lý người dùng và thống kê hệ thống.

Ngoài ra, file Postman Collection hoàn chỉnh có sẵn tại:
📁 `docs/postman_collection.json`

---

## 📄 Hướng Dẫn Nộp Bài Cho Mentor (Báo Cáo PDF)

Mentor yêu cầu:
> *"Nộp file PDF bằng cách chụp screenshots các hình về API, database... liên quan project mô tả, kèm link github chứa code"*

Để hoàn thành file PDF một cách chuyên nghiệp nhất:
1. Mở file [docs/screenshots_guide.md](file:///c:/Fsoft/BT1/docs/screenshots_guide.md) để xem danh sách chi tiết các màn hình cần chụp.
2. Mở file [docs/REPORT_TEMPLATE.md](file:///c:/Fsoft/BT1/docs/REPORT_TEMPLATE.md), điền thông tin của bạn và dán các ảnh đã chụp vào.
3. Xuất file báo cáo ra định dạng **PDF** (thông qua lệnh Print to PDF trong VS Code hoặc chuyển đổi từ Markdown/Word) và nộp kèm link GitHub của repo này!

---

## 🐳 Triển Khai Bằng Docker Compose

Nếu máy đã cài Docker Desktop:
```bash
cd docker
docker-compose up --build -d
```
Hệ thống sẽ tự động khởi tạo toàn bộ 4 dịch vụ:
- PostgreSQL (Port 5432)
- MinIO Object Storage (Port 9000 & Web Console 9001)
- Spring Boot Backend (Port 8080)
- React Frontend (Port 3000)
