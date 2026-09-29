package com.kbase.config;

import com.kbase.model.Document;
import com.kbase.model.FileCategory;
import com.kbase.model.Project;
import com.kbase.model.ProjectMember;
import com.kbase.model.ProjectRole;
import com.kbase.model.Role;
import com.kbase.model.User;
import com.kbase.repository.DocumentRepository;
import com.kbase.repository.ProjectMemberRepository;
import com.kbase.repository.ProjectRepository;
import com.kbase.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final DocumentRepository documentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Cơ sở dữ liệu đã có dữ liệu, bỏ qua bước khởi tạo mẫu.");
            return;
        }

        log.info("Đang khởi tạo dữ liệu người dùng, dự án và tài liệu mẫu bằng Tiếng Việt...");

        // 1. Tạo tài khoản người dùng mẫu
        User admin = User.builder()
                .email("admin@kbase.com")
                .password(passwordEncoder.encode("Admin@123"))
                .fullName("Nguyễn Văn Quản Trị (Admin)")
                .role(Role.ROLE_ADMIN)
                .enabled(true)
                .build();
        userRepository.save(admin);

        User owner = User.builder()
                .email("owner@kbase.com")
                .password(passwordEncoder.encode("Owner@123"))
                .fullName("Trần Thị Chủ Dự Án (Owner)")
                .role(Role.ROLE_OWNER)
                .enabled(true)
                .build();
        userRepository.save(owner);

        User user = User.builder()
                .email("user@kbase.com")
                .password(passwordEncoder.encode("User@123"))
                .fullName("Lê Hoàng Kỹ Sư (User)")
                .role(Role.ROLE_USER)
                .enabled(true)
                .build();
        userRepository.save(user);

        // 2. Tạo dự án mẫu
        Project project = Project.builder()
                .name("Kiến Trúc Nền Tảng KBase")
                .description("Cơ sở tri thức trung tâm lưu trữ tài liệu đặc tả kiến trúc, hướng dẫn triển khai Spring Boot, PostgreSQL, MinIO và React TypeScript.")
                .owner(owner)
                .build();
        Project savedProject = projectRepository.save(project);

        // Thêm thành viên vào dự án
        projectMemberRepository.save(ProjectMember.builder()
                .project(savedProject)
                .user(owner)
                .role(ProjectRole.OWNER)
                .build());

        projectMemberRepository.save(ProjectMember.builder()
                .project(savedProject)
                .user(user)
                .role(ProjectRole.MEMBER)
                .build());

        // 3. Tạo tài liệu tri thức mẫu hoàn toàn bằng Tiếng Việt
        String sampleContent = """
                # Hướng Dẫn Kiến Trúc & Đặc Tả Hệ Thống KBase

                ## 1. Tổng Quan Hệ Thống
                KBase là nền tảng quản lý cơ sở tri thức (Knowledge Base) hiện đại dành cho các nhóm phát triển phần mềm và doanh nghiệp.
                Hệ thống cung cấp khả năng phân quyền đa cấp độ, lưu trữ tài liệu theo dự án và hỗ trợ AI hỏi đáp trích dẫn tài liệu nguồn.

                ## 2. Ngăn Xếp Công Nghệ (Technology Stack)
                - Backend: Java 21 với Spring Boot 3.3, bảo mật Spring Security xác thực JWT không trạng thái (Stateless), Spring Data JPA.
                - Cơ sở dữ liệu (Database): PostgreSQL 16 lưu trữ tài khoản, dự án, phân quyền và siêu dữ liệu file.
                - Lưu trữ tệp tin (Storage): Tích hợp MinIO (S3 Object Storage) và lưu trữ phân vùng thư mục cục bộ.
                - Giao diện người dùng (Frontend): React 18 kết hợp TypeScript, Vite và phong cách thiết kế Dark Glassmorphism hiện đại.
                - Trí tuệ nhân tạo (AI Engine): Trợ lý hỏi đáp RAG (Retrieval-Augmented Generation) phân tích văn bản và trích dẫn chính xác tài liệu nguồn.

                ## 3. Phân Quyền Người Dùng (Role-Based Access Control)
                Hệ thống hỗ trợ 3 vai trò chính:
                - Quản trị viên (ADMIN): Toàn quyền giám sát hệ thống, quản lý tài khoản người dùng và xem thống kê dung lượng lưu trữ.
                - Chủ sở hữu dự án (OWNER): Tạo không gian làm việc dự án, mời các thành viên tham gia và phân chia quyền hạn.
                - Người dùng (USER): Tham gia các dự án được mời, tải lên tài liệu/video và hỏi đáp trực tiếp với trợ lý AI.

                ## 4. Các Định Dạng Tài Liệu Được Hỗ Trợ
                - Văn bản & Báo cáo: PDF, Word (DOCX, DOC), Excel (XLSX, XLS), PowerPoint (PPTX, PPT), Markdown (.md), TXT.
                - Hình ảnh: PNG, JPG, JPEG, GIF, SVG, BMP.
                - Video & Bản ghi: MP4, MOV, AVI.
                """;

        try {
            java.nio.file.Path uploadsDir = java.nio.file.Paths.get("./uploads/project_" + savedProject.getId()).toAbsolutePath().normalize();
            java.nio.file.Files.createDirectories(uploadsDir);
            String storedFileName = "seed_Huong_Dan_Kien_Truc_He_Thong.md";
            java.nio.file.Path targetFile = uploadsDir.resolve(storedFileName);
            java.nio.file.Files.writeString(targetFile, sampleContent, java.nio.charset.StandardCharsets.UTF_8);

            String relativePath = "project_" + savedProject.getId() + "/" + storedFileName;

            Document doc = Document.builder()
                    .title("Hướng Dẫn Kiến Trúc & Đặc Tả Hệ Thống")
                    .originalFilename("Huong_Dan_Kien_Truc_He_Thong.md")
                    .storedFilename(storedFileName)
                    .contentType("text/markdown; charset=UTF-8")
                    .fileCategory(FileCategory.DOCUMENT)
                    .fileSize((long) sampleContent.getBytes(StandardCharsets.UTF_8).length)
                    .filePath(relativePath)
                    .summary("Tài liệu đặc tả toàn diện về kiến trúc Spring Boot, PostgreSQL, MinIO, bảo mật JWT và trợ lý AI của KBase.")
                    .textContent(sampleContent)
                    .project(savedProject)
                    .uploadedBy(owner)
                    .build();

            documentRepository.save(doc);
            log.info("Khởi tạo dữ liệu mẫu Tiếng Việt thành công!");
        } catch (Exception e) {
            log.error("Lỗi khi tạo tài liệu mẫu", e);
        }
    }
}
