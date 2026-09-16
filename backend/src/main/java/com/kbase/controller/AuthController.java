package com.kbase.controller;

import com.kbase.dto.AuthRequest;
import com.kbase.dto.AuthResponse;
import com.kbase.dto.RegisterRequest;
import com.kbase.dto.UserDto;
import com.kbase.model.User;
import com.kbase.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration, login, and profile retrieval")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Log in with email and password", description = "Returns JWT access token and user credentials")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account", description = "Creates a user (Admin, Owner, or User) and returns JWT access token")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile", description = "Returns the profile of the currently logged-in user")
    public ResponseEntity<UserDto> getCurrentUser() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(UserDto.fromEntity(currentUser));
    }
}
