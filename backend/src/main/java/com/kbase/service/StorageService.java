package com.kbase.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String storeFile(MultipartFile file, Long projectId);
    Resource loadFileAsResource(String filePath);
    void deleteFile(String filePath);
    String extractText(MultipartFile file);
}
