package com.kbase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemStatsDto {
    private long totalUsers;
    private long totalProjects;
    private long totalDocuments;
    private long totalStorageBytes;
    private String formattedStorage;
}
