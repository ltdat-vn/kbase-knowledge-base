package com.kbase.service.impl;

import com.kbase.dto.CreateProjectRequest;
import com.kbase.dto.InviteMemberRequest;
import com.kbase.dto.ProjectDto;
import com.kbase.dto.ProjectMemberDto;
import com.kbase.model.*;
import com.kbase.repository.ProjectMemberRepository;
import com.kbase.repository.ProjectRepository;
import com.kbase.repository.UserRepository;
import com.kbase.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ProjectDto createProject(CreateProjectRequest request, User currentUser) {
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(currentUser)
                .build();

        Project savedProject = projectRepository.save(project);

        // Add owner as a member with OWNER role
        ProjectMember ownerMember = ProjectMember.builder()
                .project(savedProject)
                .user(currentUser)
                .role(ProjectRole.OWNER)
                .build();
        projectMemberRepository.save(ownerMember);

        ProjectDto dto = ProjectDto.fromEntity(savedProject);
        dto.setCurrentUserRole("OWNER");
        return dto;
    }

    @Override
    public List<ProjectDto> getProjectsForUser(User currentUser) {
        List<Project> projects;
        if (currentUser.getRole() == Role.ROLE_ADMIN) {
            projects = projectRepository.findAllOrderByUpdatedAtDesc();
        } else {
            projects = projectRepository.findAccessibleProjects(currentUser.getId());
        }

        return projects.stream().map(p -> {
            ProjectDto dto = ProjectDto.fromEntity(p);
            dto.setCurrentUserRole(resolveUserRoleInProject(p, currentUser));
            return dto;
        }).toList();
    }

    @Override
    public ProjectDto getProjectById(Long id, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));

        checkProjectAccess(project, currentUser);

        ProjectDto dto = ProjectDto.fromEntity(project);
        dto.setCurrentUserRole(resolveUserRoleInProject(project, currentUser));
        return dto;
    }

    @Override
    @Transactional
    public ProjectDto updateProject(Long id, CreateProjectRequest request, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));

        checkProjectAdminOrOwner(project, currentUser);

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        Project saved = projectRepository.save(project);

        ProjectDto dto = ProjectDto.fromEntity(saved);
        dto.setCurrentUserRole(resolveUserRoleInProject(saved, currentUser));
        return dto;
    }

    @Override
    @Transactional
    public void deleteProject(Long id, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));

        checkProjectAdminOrOwner(project, currentUser);

        projectRepository.delete(project);
    }

    @Override
    @Transactional
    public ProjectMemberDto inviteMember(Long projectId, InviteMemberRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

        checkProjectAdminOrOwner(project, currentUser);

        User invitee = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + request.getEmail()));

        Optional<ProjectMember> existing = projectMemberRepository.findByProjectIdAndUserId(projectId, invitee.getId());
        ProjectMember member;
        if (existing.isPresent()) {
            member = existing.get();
            member.setRole(request.getRole() != null ? request.getRole() : ProjectRole.MEMBER);
        } else {
            member = ProjectMember.builder()
                    .project(project)
                    .user(invitee)
                    .role(request.getRole() != null ? request.getRole() : ProjectRole.MEMBER)
                    .build();
        }

        ProjectMember saved = projectMemberRepository.save(member);
        return ProjectMemberDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public void removeMember(Long projectId, Long userId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

        checkProjectAdminOrOwner(project, currentUser);

        if (project.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot remove the project owner");
        }

        projectMemberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    @Override
    public List<ProjectMemberDto> getProjectMembers(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId));

        checkProjectAccess(project, currentUser);

        return projectMemberRepository.findByProjectId(projectId).stream()
                .map(ProjectMemberDto::fromEntity)
                .toList();
    }

    private void checkProjectAccess(Project project, User user) {
        if (user.getRole() == Role.ROLE_ADMIN) return;
        if (project.getOwner().getId().equals(user.getId())) return;
        if (projectMemberRepository.existsByProjectIdAndUserId(project.getId(), user.getId())) return;

        throw new AccessDeniedException("You do not have access to this project");
    }

    private void checkProjectAdminOrOwner(Project project, User user) {
        if (user.getRole() == Role.ROLE_ADMIN) return;
        if (project.getOwner().getId().equals(user.getId())) return;

        Optional<ProjectMember> member = projectMemberRepository.findByProjectIdAndUserId(project.getId(), user.getId());
        if (member.isPresent() && member.get().getRole() == ProjectRole.OWNER) return;

        throw new AccessDeniedException("Only project owners or administrators can perform this action");
    }

    private String resolveUserRoleInProject(Project project, User user) {
        if (user.getRole() == Role.ROLE_ADMIN) return "ADMIN";
        if (project.getOwner().getId().equals(user.getId())) return "OWNER";
        return projectMemberRepository.findByProjectIdAndUserId(project.getId(), user.getId())
                .map(m -> m.getRole().name())
                .orElse("VIEWER");
    }
}
