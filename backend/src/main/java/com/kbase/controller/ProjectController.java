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
@Tag(name = "Projects", description = "Endpoints for managing workspace projects and member collaborations")
public class ProjectController {

    private final ProjectService projectService;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "List accessible projects", description = "Returns all projects the user owns, is a member of, or all projects if Admin")
    public ResponseEntity<List<ProjectDto>> getProjects() {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(projectService.getProjectsForUser(currentUser));
    }

    @PostMapping
    @Operation(summary = "Create a new project", description = "Allows project owners or admins to create a new project workspace")
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody CreateProjectRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request, currentUser));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project details by ID", description = "Retrieves details of a specific project")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(projectService.getProjectById(id, currentUser));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update project information", description = "Allows project owner or admin to update name and description")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @Valid @RequestBody CreateProjectRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(projectService.updateProject(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a project", description = "Removes a project and all associated files and memberships")
    public ResponseEntity<Map<String, String>> deleteProject(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        projectService.deleteProject(id, currentUser);
        return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "List project members", description = "Retrieves the list of members assigned to the project")
    public ResponseEntity<List<ProjectMemberDto>> getProjectMembers(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(projectService.getProjectMembers(id, currentUser));
    }

    @PostMapping("/{id}/members")
    @Operation(summary = "Invite a member to the project", description = "Adds a registered user to the project with an assigned role")
    public ResponseEntity<ProjectMemberDto> inviteMember(@PathVariable Long id, @Valid @RequestBody InviteMemberRequest request) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.inviteMember(id, request, currentUser));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @Operation(summary = "Remove a member from the project", description = "Removes a user's access from the project")
    public ResponseEntity<Map<String, String>> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        User currentUser = authService.getCurrentUser();
        projectService.removeMember(id, userId, currentUser);
        return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
    }
}
