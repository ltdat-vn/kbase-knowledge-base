package com.kbase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String question;
    private String answer;
    private Long projectId;
    @Builder.Default
    private List<SourceReference> references = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SourceReference {
        private Long documentId;
        private String documentTitle;
        private String originalFilename;
        private String snippet;
        private double score;
    }
}
