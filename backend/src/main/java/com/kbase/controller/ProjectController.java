package com.kbase.controller;

import com.kbase.dto.CreateProjectRequest;
import com.kbase.dto.InviteMemberRequest;
import com.kbase.dto.ProjectDto;
import com.kbase.dto.ProjectMemberDto;
import com.kbase.model.User;
import com.kbase.service.AuthService;
import com.kbase.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "2. Quản lý Dự án (Projects)", description = "Các endpoint tạo dự án, quản lý không gian làm việc và mời thành viên")
public class ProjectController {

    private final ProjectService projectService;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Lấy danh sách dự án có quyền truy cập", description = "Trả về tất cả dự án người dùng sở hữu, tham gia, hoặc toàn bộ nếu là Admin")
    public ResponseEntity<List<ProjectDto>> getProjects() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(projectService.getProjectsForUser(currentUser));
    }

    @PostMapping
    @Operation(summary = "Tạo dự án mới", description = "Cho phép chủ dự án (Owner) hoặc Admin tạo không gian làm việc dự án mới")
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody CreateProjectRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request, currentUser));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết dự án theo ID", description = "Truy xuất thông tin chi tiết của dự án")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(projectService.getProjectById(id, currentUser));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin dự án", description = "Cho phép chủ dự án hoặc Admin đổi tên và mô tả dự án")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @Valid @RequestBody CreateProjectRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(projectService.updateProject(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa dự án", description = "Xóa dự án cùng toàn bộ tệp tin và thành viên liên kết")
    public ResponseEntity<Map<String, String>> deleteProject(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        projectService.deleteProject(id, currentUser);
        return ResponseEntity.ok(Map.of("message", "Đã xóa dự án thành công"));
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "Danh sách thành viên trong dự án", description = "Lấy danh sách các cộng tác viên tham gia vào dự án")
    public ResponseEntity<List<ProjectMemberDto>> getProjectMembers(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(projectService.getProjectMembers(id, currentUser));
    }

    @PostMapping("/{id}/members")
    @Operation(summary = "Mời thành viên vào dự án", description = "Thêm một người dùng đã đăng ký vào dự án với vai trò được chỉ định")
    public ResponseEntity<ProjectMemberDto> inviteMember(@PathVariable Long id, @Valid @RequestBody InviteMemberRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.inviteMember(id, request, currentUser));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @Operation(summary = "Xóa thành viên khỏi dự án", description = "Gỡ quyền truy cập của người dùng khỏi dự án")
    public ResponseEntity<Map<String, String>> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        User currentUser = authService.getCurrentUser();
        projectService.removeMember(id, userId, currentUser);
        return ResponseEntity.ok(Map.of("message", "Đã xóa thành viên khỏi dự án thành công"));
    }
}
