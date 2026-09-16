package com.kbase.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Question is required")
    private String question;
}
