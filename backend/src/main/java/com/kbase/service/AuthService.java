package com.kbase.service;

import com.kbase.dto.AuthRequest;
import com.kbase.dto.AuthResponse;
import com.kbase.dto.RegisterRequest;
import com.kbase.model.User;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    AuthResponse register(RegisterRequest request);
    User getCurrentUser();
}
