package com.kbase.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String title;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String originalFilename;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String storedFilename;

    @Column(length = 100)
    private String contentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FileCategory fileCategory;

    @Column(nullable = false)
    private Long fileSize;

    @Column(nullable = false, length = 500)
    private String filePath;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @JsonIgnore
    @Column(columnDefinition = "TEXT")
    private String textContent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
