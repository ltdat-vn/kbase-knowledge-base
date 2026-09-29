package com.kbase.service.impl;

import com.kbase.service.StorageService;
import io.minio.*;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import java.util.UUID;

@Service
@Slf4j
@ConditionalOnProperty(name = "kbase.storage.type", havingValue = "minio")
public class MinioStorageService implements StorageService {

    private final MinioClient minioClient;
    private final String bucketName;

    public MinioStorageService(
            @Value("${kbase.minio.endpoint:http://localhost:9000}") String endpoint,
            @Value("${kbase.minio.access-key:minioadmin}") String accessKey,
            @Value("${kbase.minio.secret-key:minioadminpassword}") String secretKey,
            @Value("${kbase.minio.bucket-name:kbase-files}") String bucketName) {
        this.bucketName = bucketName;
        this.minioClient = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }

    @PostConstruct
    public void initBucket() {
        try {
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("MinIO bucket '{}' created successfully.", bucketName);
            } else {
                log.info("MinIO bucket '{}' already exists.", bucketName);
            }
        } catch (Exception e) {
            log.warn("Could not auto-initialize MinIO bucket '{}': {}", bucketName, e.getMessage());
        }
    }

    @Override
    public String storeFile(MultipartFile file, Long projectId) {
        String cleanFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String objectName = "project_" + projectId + "/" + UUID.randomUUID().toString().substring(0, 8) + "_" + cleanFileName;

        try (InputStream is = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(is, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            return objectName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload object to MinIO: " + cleanFileName, e);
        }
    }

    @Override
    public Resource loadFileAsResource(String filePath) {
        try {
            InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(filePath)
                            .build()
            );
            return new InputStreamResource(stream);
        } catch (Exception e) {
            throw new RuntimeException("Failed to download object from MinIO: " + filePath, e);
        }
    }

    @Override
    public void deleteFile(String filePath) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(filePath)
                            .build()
            );
        } catch (Exception e) {
            log.warn("Failed to delete object from MinIO: {}", filePath);
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
                    return text.length() > 500000 ? text.substring(0, 500000) : text;
                }
            } else if (isTextFile(ext)) {
                byte[] bytes = file.getBytes();
                String text = new String(bytes, StandardCharsets.UTF_8);
                return text.length() > 500000 ? text.substring(0, 500000) : text;
            }
        } catch (Exception e) {
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
