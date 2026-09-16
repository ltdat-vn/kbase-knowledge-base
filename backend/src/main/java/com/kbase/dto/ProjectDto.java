package com.kbase.dto;

import com.kbase.model.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    private Long id;
    private String name;
    private String description;
    private UserDto owner;
    private int memberCount;
    private int documentCount;
    private String currentUserRole; // "OWNER", "MEMBER", "VIEWER", "ADMIN"
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProjectDto fromEntity(Project project) {
        if (project == null) return null;
        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .owner(UserDto.fromEntity(project.getOwner()))
                .memberCount(project.getMembers() != null ? project.getMembers().size() : 0)
                .documentCount(project.getDocuments() != null ? project.getDocuments().size() : 0)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
