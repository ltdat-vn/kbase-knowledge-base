# Hướng Dẫn Chụp Screenshots Nộp Bài Mentor (PDF Submission Guide)

Tài liệu này hướng dẫn chi tiết từng màn hình bạn cần chụp để đưa vào file **Báo Cáo PDF** nộp cho mentor theo đúng yêu cầu:
> *"Nộp file PDF bằng cách chụp screenshots các hình về API, database... liên quan project mô tả, kèm link github chứa code"*

---

## Danh Sách Các Màn Hình Cần Chụp

### 1. Database Screenshots (Cơ sở dữ liệu)
*Công cụ: H2 Console (`http://localhost:8080/h2-console`) hoặc pgAdmin / DBeaver / Datagrip khi kết nối PostgreSQL.*

1. **Hình 1.1 - Cấu trúc các bảng (Tables List)**:
   - Chụp danh sách các bảng được tạo tự động: `users`, `projects`, `project_members`, `documents`.
2. **Hình 1.2 - Dữ liệu bảng `users`**:
   - Chạy truy vấn: `SELECT * FROM users;`
   - Chụp kết quả hiển thị 3 tài khoản mẫu với 3 vai trò: `ROLE_ADMIN`, `ROLE_OWNER`, `ROLE_USER`.
3. **Hình 1.3 - Dữ liệu bảng `projects` & `project_members`**:
   - Chạy truy vấn: `SELECT * FROM projects;` và `SELECT * FROM project_members;`
4. **Hình 1.4 - Dữ liệu bảng `documents`**:
   - Chạy truy vấn: `SELECT id, title, original_filename, file_category, file_size FROM documents;`

---

### 2. Swagger UI / API Documentation Screenshots
*Địa chỉ: `http://localhost:8080/swagger-ui/index.html`*

1. **Hình 2.1 - Tổng quan giao diện Swagger UI**:
   - Chụp phần Header với tiêu đề `KBase - Knowledge Base REST API v1.0.0` và nút `Authorize` (JWT Bearer).
2. **Hình 2.2 - Nhóm API Authentication (`/api/auth`)**:
   - Chụp các endpoint: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`.
   - Mở rộng chi tiết request/response của `POST /api/auth/login`.
3. **Hình 2.3 - Test thực tế gọi API Login trong Swagger**:
   - Bấm "Try it out" tại `/api/auth/login`, nhập tài khoản `admin@kbase.com` / `Admin@123`.
   - Chụp Response Code 200 kèm chuỗi `Bearer token`.
4. **Hình 2.4 - Nhóm API Projects (`/api/projects`)**:
   - Chụp các endpoint CRUD dự án và mời thành viên (`POST /api/projects/{id}/members`).
5. **Hình 2.5 - Nhóm API Documents (`/api/documents`)**:
   - Chụp endpoint Upload Multipart, Tìm kiếm (`/search`), Tải xuống (`/download/{id}`), và Xem trước (`/preview/{id}`).
6. **Hình 2.6 - Nhóm API AI Chatbot (`/api/chat/ask`)**:
   - Chụp schema request hỏi đáp và response trả về trích dẫn tài liệu (`references`).
7. **Hình 2.7 - Nhóm API Admin & Thống kê (`/api/admin/stats`)**:
   - Chụp kết quả trả về số lượng users, projects, documents và dung lượng lưu trữ (Storage).

---

### 3. Frontend Web Screenshots (Giao diện KBase)
*Địa chỉ: `http://localhost:5173`*

1. **Hình 3.1 - Màn hình Trang chủ & Đăng nhập (Hero / Login Modal)**:
   - Giao diện hiện đại Dark Glassmorphism, các nút chọn nhanh tài khoản Demo (Admin, Owner, User).
2. **Hình 3.2 - Dashboard Quản lý Dự án (Project Workspaces)**:
   - Danh sách các dự án với thẻ số lượng tài liệu, số thành viên, và nhãn vai trò (`OWNER`, `MEMBER`).
3. **Hình 3.3 - Chi tiết Dự án & Trình duyệt Tài liệu (Documents Tab)**:
   - Bộ lọc phân loại file: All, Document, Spreadsheet, Presentation, Image, Video, Text.
   - Hộp tìm kiếm tức thời theo từ khóa.
4. **Hình 3.4 - Màn hình Tải lên tài liệu (File Upload Modal)**:
   - Vùng kéo thả file (Drag & Drop), thanh tiến trình (Upload Progress) và nhận diện định dạng.
5. **Hình 3.5 - Màn hình Quản lý Thành viên (Project Members Tab)**:
   - Danh sách cộng tác viên, vai trò (Owner, Member, Viewer) và form mời thành viên.
6. **Hình 3.6 - Màn hình Trợ lý AI Hỏi Đáp Tài liệu (AI Chatbot Tab)**:
   - Cuộc trò chuyện mẫu hỏi đáp về tài liệu kiến trúc, câu trả lời kèm thẻ **Trích dẫn nguồn gốc (Cited Source Documents)** có nút tải trực tiếp.
7. **Hình 3.7 - Màn hình Quản trị viên (Admin Oversight Panel)**:
   - 4 thẻ thống kê hệ thống (Total Users, Projects, Documents, Disk Storage) và bảng quản lý phân quyền người dùng.

---

### 4. Cách chuyển đổi thành file PDF nộp bài
1. Mở file [REPORT_TEMPLATE.md](file:///c:/Fsoft/BT1/docs/REPORT_TEMPLATE.md).
2. Dán các hình đã chụp vào các vị trí đánh dấu `[CHÈN HÌNH TẠI ĐÂY]`.
3. Điền link GitHub của bạn vào phần thông tin sinh viên.
4. Nhấn `Ctrl + Shift + P` trong VS Code/IDE -> chọn **Markdown: Open Preview to the Side** -> Chuột phải chọn **Print to PDF** hoặc lưu trực tiếp thành file PDF để nộp cho mentor!
