package com.kbase.service.impl;

import com.kbase.dto.DocumentDto;
import com.kbase.model.*;
import com.kbase.repository.DocumentRepository;
import com.kbase.repository.ProjectMemberRepository;
import com.kbase.repository.ProjectRepository;
import com.kbase.service.DocumentService;
import com.kbase.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final StorageService storageService;

    @Override
    @Transactional
    public DocumentDto uploadDocument(Long projectId, MultipartFile file, String title, String summary, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

        checkProjectAccess(project, user);

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        FileCategory category = FileCategory.fromFilename(originalFilename);
        String relativePath = storageService.storeFile(file, projectId);
        String extractedText = storageService.extractText(file);

        String docTitle = (title != null && !title.isBlank()) ? title : originalFilename;

        Document document = Document.builder()
                .title(docTitle)
                .originalFilename(originalFilename)
                .storedFilename(relativePath.substring(relativePath.lastIndexOf("/") + 1))
                .contentType(file.getContentType())
                .fileCategory(category)
                .fileSize(file.getSize())
                .filePath(relativePath)
                .summary(summary)
                .textContent(extractedText)
                .project(project)
                .uploadedBy(user)
                .build();

        Document saved = documentRepository.save(document);
        return DocumentDto.fromEntity(saved);
    }

    @Override
    public List<DocumentDto> getDocumentsByProject(Long projectId, FileCategory category, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

        checkProjectAccess(project, user);

        List<Document> docs;
        if (category != null) {
            docs = documentRepository.findByProjectIdAndFileCategoryOrderByCreatedAtDesc(projectId, category);
        } else {
            docs = documentRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        }

        return docs.stream().map(DocumentDto::fromEntity).toList();
    }

    @Override
    public List<DocumentDto> searchDocuments(Long projectId, String query, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

        checkProjectAccess(project, user);

        if (query == null || query.trim().isEmpty()) {
            return getDocumentsByProject(projectId, null, user);
        }

        return documentRepository.searchByProjectAndQuery(projectId, query.trim()).stream()
                .map(DocumentDto::fromEntity)
                .toList();
    }

    @Override
    public DocumentDto getDocumentById(Long id, User user) {
        Document doc = getDocumentEntity(id, user);
        return DocumentDto.fromEntity(doc);
    }

    @Override
    public Document getDocumentEntity(Long id, User user) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with id: " + id));

        if (user != null) {
            checkProjectAccess(doc.getProject(), user);
        }
        return doc;
    }

    @Override
    @Transactional
    public void deleteDocument(Long id, User user) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with id: " + id));

        checkProjectAdminOrOwnerOrUploader(doc, user);

        storageService.deleteFile(doc.getFilePath());
        documentRepository.delete(doc);
    }

    @Override
    public Resource getFileResource(Long documentId, User user) {
        Document doc = getDocumentEntity(documentId, user);
        return storageService.loadFileAsResource(doc.getFilePath());
    }

    private void checkProjectAccess(Project project, User user) {
        if (user.getRole() == Role.ROLE_ADMIN) return;
        if (project.getOwner().getId().equals(user.getId())) return;
        if (projectMemberRepository.existsByProjectIdAndUserId(project.getId(), user.getId())) return;

        throw new AccessDeniedException("You do not have access to this project");
    }

    private void checkProjectAdminOrOwnerOrUploader(Document doc, User user) {
        if (user.getRole() == Role.ROLE_ADMIN) return;
        if (doc.getProject().getOwner().getId().equals(user.getId())) return;
        if (doc.getUploadedBy().getId().equals(user.getId())) return;

        throw new AccessDeniedException("You are not authorized to delete this document");
    }
}
