package com.kbase.controller;

import com.kbase.dto.SystemStatsDto;
import com.kbase.dto.UserDto;
import com.kbase.model.Role;
import com.kbase.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "5. Quản trị Người dùng & Hệ thống (Admin)", description = "Các endpoint quản trị tài khoản, thay đổi quyền hạn và theo dõi số liệu thống kê")
public class UserController {

    private final UserService userService;

    @GetMapping("/api/users")
    @Operation(summary = "Danh sách tất cả người dùng", description = "Trả về toàn bộ người dùng đã đăng ký để mời vào dự án")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/api/users/{id}")
    @Operation(summary = "Lấy thông tin người dùng theo ID", description = "Truy xuất thông tin hồ sơ của người dùng")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/api/admin/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật vai trò người dùng (Admin)", description = "Thay đổi vai trò người dùng thành ADMIN, OWNER hoặc USER")
    public ResponseEntity<UserDto> updateUserRole(@PathVariable Long id, @RequestParam Role role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @PutMapping("/api/admin/users/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Bật/Tắt trạng thái tài khoản (Admin)", description = "Khóa hoặc kích hoạt lại tài khoản người dùng")
    public ResponseEntity<UserDto> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    @DeleteMapping("/api/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa tài khoản người dùng (Admin)", description = "Xóa vĩnh viễn tài khoản người dùng khỏi hệ thống")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa người dùng thành công"));
    }

    @GetMapping("/api/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Thống kê hệ thống (Admin)", description = "Lấy tổng số người dùng, dự án, tài liệu và dung lượng lưu trữ trên đĩa")
    public ResponseEntity<SystemStatsDto> getSystemStats() {
        return ResponseEntity.ok(userService.getSystemStats());
    }
}
