package com.kbase.dto;

import com.kbase.model.Document;
import com.kbase.model.FileCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {
    private Long id;
    private String title;
    private String originalFilename;
    private String contentType;
    private FileCategory fileCategory;
    private Long fileSize;
    private String formattedSize;
    private String summary;
    private Long projectId;
    private String projectName;
    private UserDto uploadedBy;
    private LocalDateTime createdAt;

    public static String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int z = (63 - Long.numberOfLeadingZeros(bytes)) / 10;
        return String.format("%.1f %sB", (double) bytes / (1L << (z * 10)), " KMGTPE".charAt(z));
    }

    public static DocumentDto fromEntity(Document doc) {
        if (doc == null) return null;
        return DocumentDto.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .originalFilename(doc.getOriginalFilename())
                .contentType(doc.getContentType())
                .fileCategory(doc.getFileCategory())
                .fileSize(doc.getFileSize())
                .formattedSize(formatBytes(doc.getFileSize()))
                .summary(doc.getSummary())
                .projectId(doc.getProject() != null ? doc.getProject().getId() : null)
                .projectName(doc.getProject() != null ? doc.getProject().getName() : null)
                .uploadedBy(UserDto.fromEntity(doc.getUploadedBy()))
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
