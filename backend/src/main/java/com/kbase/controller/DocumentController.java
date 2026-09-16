package com.kbase.controller;

import com.kbase.dto.DocumentDto;
import com.kbase.model.Document;
import com.kbase.model.FileCategory;
import com.kbase.model.User;
import com.kbase.service.AuthService;
import com.kbase.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Endpoints for uploading, searching, viewing, and downloading project documents and media")
public class DocumentController {

    private final DocumentService documentService;
    private final AuthService authService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Upload a document, video, or file", description = "Uploads files (PDF, Word, Excel, PPT, TXT, Images, Videos) and links them to a project")
    public ResponseEntity<DocumentDto> uploadDocument(
            @Parameter(description = "ID of the target project", required = true) @RequestParam("projectId") Long projectId,
            @Parameter(description = "The file payload", required = true) @RequestParam("file") MultipartFile file,
            @Parameter(description = "Optional custom document title") @RequestParam(value = "title", required = false) String title,
            @Parameter(description = "Optional document summary/notes") @RequestParam(value = "summary", required = false) String summary) {

        User currentUser = authService.getCurrentUser();
        DocumentDto uploaded = documentService.uploadDocument(projectId, file, title, summary, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
    }

    @GetMapping("/project/{projectId}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "List documents in a project", description = "Returns all documents belonging to a project, optionally filtered by category")
    public ResponseEntity<List<DocumentDto>> getDocumentsByProject(
            @PathVariable Long projectId,
            @RequestParam(value = "category", required = false) FileCategory category) {

        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(documentService.getDocumentsByProject(projectId, category, currentUser));
    }

    @GetMapping("/search")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Search documents in a project", description = "Searches documents by title, original filename, summary, or extracted text")
    public ResponseEntity<List<DocumentDto>> searchDocuments(
            @RequestParam("projectId") Long projectId,
            @RequestParam(value = "query", required = false) String query) {

        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(documentService.searchDocuments(projectId, query, currentUser));
    }

    @GetMapping("/{id}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get document metadata", description = "Retrieves metadata for a specific document")
    public ResponseEntity<DocumentDto> getDocumentById(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(documentService.getDocumentById(id, currentUser));
    }

    @GetMapping("/download/{id}")
    @Operation(summary = "Download a file", description = "Streams the raw file as an attachment download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        // Can be downloaded directly via link
        Document doc = documentService.getDocumentEntity(id, null);
        Resource resource = documentService.getFileResource(id, null);

        String contentType = (doc.getContentType() != null) ? doc.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getOriginalFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/preview/{id}")
    @Operation(summary = "Preview a file inline", description = "Streams the file inline for viewing (images, videos, PDFs, text)")
    public ResponseEntity<Resource> previewFile(@PathVariable Long id) {
        Document doc = documentService.getDocumentEntity(id, null);
        Resource resource = documentService.getFileResource(id, null);

        String contentType = (doc.getContentType() != null) ? doc.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getOriginalFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Delete a document", description = "Removes the document record and deletes the physical file from storage")
    public ResponseEntity<Map<String, String>> deleteDocument(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        documentService.deleteDocument(id, currentUser);
        return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
    }
}
