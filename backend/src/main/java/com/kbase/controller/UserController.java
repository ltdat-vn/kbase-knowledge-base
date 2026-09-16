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
@Tag(name = "Users & Administration", description = "Endpoints for managing user accounts, roles, and administrative statistics")
public class UserController {

    private final UserService userService;

    @GetMapping("/api/users")
    @Operation(summary = "List all registered users", description = "Returns all users for team invitations and collaboration")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/api/users/{id}")
    @Operation(summary = "Get user details by ID", description = "Retrieves user profile details")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/api/admin/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user role (Admin)", description = "Changes user role to ADMIN, OWNER, or USER")
    public ResponseEntity<UserDto> updateUserRole(@PathVariable Long id, @RequestParam Role role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @PutMapping("/api/admin/users/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle user enabled/disabled status (Admin)", description = "Enables or disables a user account")
    public ResponseEntity<UserDto> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    @DeleteMapping("/api/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user account (Admin)", description = "Permanently deletes a user account")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/api/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "System statistics (Admin)", description = "Retrieves total users, projects, documents, and disk storage usage")
    public ResponseEntity<SystemStatsDto> getSystemStats() {
        return ResponseEntity.ok(userService.getSystemStats());
    }
}
