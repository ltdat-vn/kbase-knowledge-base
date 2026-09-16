package com.kbase.service;

import com.kbase.dto.DocumentDto;
import com.kbase.model.Document;
import com.kbase.model.FileCategory;
import com.kbase.model.User;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentService {
    DocumentDto uploadDocument(Long projectId, MultipartFile file, String title, String summary, User user);
    List<DocumentDto> getDocumentsByProject(Long projectId, FileCategory category, User user);
    List<DocumentDto> searchDocuments(Long projectId, String query, User user);
    DocumentDto getDocumentById(Long id, User user);
    void deleteDocument(Long id, User user);
    Resource getFileResource(Long documentId, User user);
    Document getDocumentEntity(Long id, User user);
}
