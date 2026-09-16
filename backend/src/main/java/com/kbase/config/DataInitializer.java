package com.kbase.config;

import com.kbase.model.*;
import com.kbase.repository.DocumentRepository;
import com.kbase.repository.ProjectMemberRepository;
import com.kbase.repository.ProjectRepository;
import com.kbase.repository.UserRepository;
import com.kbase.service.StorageService;
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
    private final StorageService storageService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already initialized, skipping seeding.");
            return;
        }

        log.info("Seeding initial users, projects, and documents...");

        // 1. Seed Users
        User admin = User.builder()
                .email("admin@kbase.com")
                .password(passwordEncoder.encode("Admin@123"))
                .fullName("Alexander Admin")
                .role(Role.ROLE_ADMIN)
                .enabled(true)
                .build();
        userRepository.save(admin);

        User owner = User.builder()
                .email("owner@kbase.com")
                .password(passwordEncoder.encode("Owner@123"))
                .fullName("Olivia Owner")
                .role(Role.ROLE_OWNER)
                .enabled(true)
                .build();
        userRepository.save(owner);

        User user = User.builder()
                .email("user@kbase.com")
                .password(passwordEncoder.encode("User@123"))
                .fullName("Uri User")
                .role(Role.ROLE_USER)
                .enabled(true)
                .build();
        userRepository.save(user);

        // 2. Seed Initial Project
        Project project = Project.builder()
                .name("KBase Platform Architecture")
                .description("Central knowledge base and design documentation for modern microservices, Spring Boot backend, and React frontend.")
                .owner(owner)
                .build();
        Project savedProject = projectRepository.save(project);

        // Add owner and user as members
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

        // 3. Seed Sample Knowledge Document
        String sampleContent = """
                # KBase Architecture & System Specifications

                ## 1. Overview
                KBase is a high-performance knowledge base application for engineering teams.
                It provides reliable file storage, project-based document partitioning, and AI-assisted search.

                ## 2. Technology Stack
                - Backend: Java 21 with Spring Boot 3, Spring Security (JWT authentication), and Spring Data JPA.
                - Database: PostgreSQL (or H2 for local zero-dependency testing).
                - Storage: Object storage via MinIO (S3-compatible) or Local File Storage.
                - Frontend: React 18 with TypeScript, Tailwind CSS, and Vite.
                - AI Microservice: Python FastAPI with LangChain RAG pipeline and document embeddings.

                ## 3. Security & Access Control
                The platform implements Role-Based Access Control (RBAC):
                - ADMIN: Complete system oversight, user management, and global resource audits.
                - OWNER: Full ownership of designated projects, can invite/remove members, and manage files.
                - USER: Can participate in invited projects, upload documents, and interact with the AI assistant.

                ## 4. Supported Formats
                - Documents: PDF, DOCX, XLSX, PPTX, Markdown (.md), TXT.
                - Media: PNG, JPG, GIF, SVG, MP4, MOV.
                """;

        try {
            java.nio.file.Path uploadsDir = java.nio.file.Paths.get("./uploads/project_" + savedProject.getId()).toAbsolutePath().normalize();
            java.nio.file.Files.createDirectories(uploadsDir);
            String storedFileName = "seed_Architecture_Specifications.md";
            java.nio.file.Path targetFile = uploadsDir.resolve(storedFileName);
            java.nio.file.Files.writeString(targetFile, sampleContent, java.nio.charset.StandardCharsets.UTF_8);

            String relativePath = "project_" + savedProject.getId() + "/" + storedFileName;

            Document doc = Document.builder()
                    .title("Architecture Specifications Guide")
                    .originalFilename("Architecture_Specifications.md")
                    .storedFilename(storedFileName)
                    .contentType("text/markdown")
                    .fileCategory(FileCategory.DOCUMENT)
                    .fileSize((long) sampleContent.getBytes(StandardCharsets.UTF_8).length)
                    .filePath(relativePath)
                    .summary("Core system architecture, technology stack, and security specifications for KBase.")
                    .textContent(sampleContent)
                    .project(savedProject)
                    .uploadedBy(owner)
                    .build();

            documentRepository.save(doc);
            log.info("Default seed data initialized successfully!");
        } catch (Exception e) {
            log.error("Failed to seed sample document", e);
        }
    }
}
