package com.kbase.controller;

import com.kbase.dto.ChatRequest;
import com.kbase.dto.ChatResponse;
import com.kbase.model.User;
import com.kbase.service.AiChatService;
import com.kbase.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "AI Chatbot", description = "Endpoints for conversational Q&A over project knowledge base with source document references")
public class ChatController {

    private final AiChatService aiChatService;
    private final AuthService authService;

    @PostMapping("/ask")
    @Operation(summary = "Ask a question about project documents",
               description = "Analyzes all uploaded documents in the project and synthesizes an intelligent answer with source citations")
    public ResponseEntity<ChatResponse> askQuestion(@Valid @RequestBody ChatRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(aiChatService.askQuestion(request, currentUser));
    }
}
