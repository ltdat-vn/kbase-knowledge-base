package com.kbase.service.impl;

import com.kbase.service.StorageService;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    private final Path rootLocation;

    public LocalStorageService(@Value("${kbase.storage.local-dir:./uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file, Long projectId) {
        String cleanFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (cleanFileName.contains("..")) {
            throw new IllegalArgumentException("Filename contains invalid path sequence: " + cleanFileName);
        }

        try {
            Path projectDir = this.rootLocation.resolve("project_" + projectId);
            Files.createDirectories(projectDir);

            String storedFileName = UUID.randomUUID().toString().substring(0, 8) + "_" + cleanFileName;
            Path targetLocation = projectDir.resolve(storedFileName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            return "project_" + projectId + "/" + storedFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + cleanFileName, ex);
        }
    }

    @Override
    public Resource loadFileAsResource(String filePath) {
        try {
            Path file = this.rootLocation.resolve(filePath).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or unreadable: " + filePath);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + filePath, ex);
        }
    }

    @Override
    public void deleteFile(String filePath) {
        try {
            Path file = this.rootLocation.resolve(filePath).normalize();
            Files.deleteIfExists(file);
        } catch (IOException ignored) {
        }
    }

    @Override
    public String extractText(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null) return "";

        String ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();

        try {
            if ("pdf".equals(ext)) {
                try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    String text = stripper.getText(doc);
                    return text.length() > 50000 ? text.substring(0, 50000) : text;
                }
            } else if (isTextFile(ext)) {
                byte[] bytes = file.getBytes();
                String text = new String(bytes, StandardCharsets.UTF_8);
                return text.length() > 50000 ? text.substring(0, 50000) : text;
            }
        } catch (Exception e) {
            // If text extraction fails, fallback gracefully to empty
            return "";
        }
        return "";
    }

    private boolean isTextFile(String ext) {
        return switch (ext) {
            case "txt", "md", "csv", "json", "xml", "yaml", "yml", "log", "html", "htm", "sql" -> true;
            default -> false;
        };
    }
}
