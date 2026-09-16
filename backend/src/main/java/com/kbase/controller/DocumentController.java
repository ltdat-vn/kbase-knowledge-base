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
@Tag(name = "3. Quản lý Tài liệu & Tệp tin (Documents)", description = "Các endpoint tải lên, tìm kiếm, xem trước, tải về tài liệu và video dự án")
public class DocumentController {

    private final DocumentService documentService;
    private final AuthService authService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Tải lên tài liệu, video hoặc hình ảnh", description = "Tải lên tệp tin (PDF, Word, Excel, PPT, TXT, Ảnh, Video) gắn liền vào dự án")
    public ResponseEntity<DocumentDto> uploadDocument(
            @Parameter(description = "Mã ID của dự án mục tiêu", required = true) @RequestParam("projectId") Long projectId,
            @Parameter(description = "Dữ liệu tệp tin đính kèm", required = true) @RequestParam("file") MultipartFile file,
            @Parameter(description = "Tiêu đề tùy chỉnh cho tài liệu") @RequestParam(value = "title", required = false) String title,
            @Parameter(description = "Tóm tắt / ghi chú cho tài liệu") @RequestParam(value = "summary", required = false) String summary) {

        User currentUser = authService.getCurrentUser();
        DocumentDto uploaded = documentService.uploadDocument(projectId, file, title, summary, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
    }

    @GetMapping("/project/{projectId}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Danh sách tài liệu trong dự án", description = "Trả về tất cả tài liệu thuộc về dự án, có thể lọc theo danh mục")
    public ResponseEntity<List<DocumentDto>> getDocumentsByProject(
            @PathVariable Long projectId,
            @RequestParam(value = "category", required = false) FileCategory category) {

        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(documentService.getDocumentsByProject(projectId, category, currentUser));
    }

    @GetMapping("/search")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Tìm kiếm tài liệu trong dự án", description = "Tìm kiếm theo tiêu đề, tên file gốc, tóm tắt hoặc nội dung văn bản bên trong file")
    public ResponseEntity<List<DocumentDto>> searchDocuments(
            @RequestParam("projectId") Long projectId,
            @RequestParam(value = "query", required = false) String query) {

        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(documentService.searchDocuments(projectId, query, currentUser));
    }

    @GetMapping("/{id}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Lấy siêu dữ liệu tài liệu theo ID", description = "Truy xuất thông tin chi tiết của một tài liệu")
    public ResponseEntity<DocumentDto> getDocumentById(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(documentService.getDocumentById(id, currentUser));
    }

    @GetMapping("/download/{id}")
    @Operation(summary = "Tải về tệp tin", description = "Truyền luồng dữ liệu file dưới dạng tệp đính kèm để người dùng tải về")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        Document doc = documentService.getDocumentEntity(id, null);
        Resource resource = documentService.getFileResource(id, null);

        String contentType = (doc.getContentType() != null) ? doc.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getOriginalFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/preview/{id}")
    @Operation(summary = "Xem trước tệp tin trực tuyến", description = "Truyền luồng dữ liệu để hiển thị trực tiếp trên trình duyệt (ảnh, video, PDF, văn bản)")
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
    @Operation(summary = "Xóa tài liệu", description = "Xóa bản ghi siêu dữ liệu và tệp tin vật lý trong bộ lưu trữ")
    public ResponseEntity<Map<String, String>> deleteDocument(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        documentService.deleteDocument(id, currentUser);
        return ResponseEntity.ok(Map.of("message", "Đã xóa tài liệu thành công"));
    }
}
