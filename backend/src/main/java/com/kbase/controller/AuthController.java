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
@Tag(name = "1. Xác thực (Authentication)", description = "Các endpoint đăng nhập, đăng ký và lấy thông tin tài khoản người dùng")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập với email và mật khẩu", description = "Trả về mã JWT Access Token và thông tin định danh người dùng")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản người dùng mới", description = "Tạo tài khoản với vai trò (Admin, Owner, User) và trả về JWT token")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin tài khoản hiện tại", description = "Trả về thông tin hồ sơ của người dùng đang đăng nhập")
    public ResponseEntity<UserDto> getCurrentUser() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(UserDto.fromEntity(currentUser));
    }
}
