package com.kbase.service;

import com.kbase.dto.ChatRequest;
import com.kbase.dto.ChatResponse;
import com.kbase.model.User;

public interface AiChatService {
    ChatResponse askQuestion(ChatRequest request, User currentUser);
}
