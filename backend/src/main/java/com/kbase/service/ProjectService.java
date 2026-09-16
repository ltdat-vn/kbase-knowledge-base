package com.kbase.service;

import com.kbase.dto.CreateProjectRequest;
import com.kbase.dto.InviteMemberRequest;
import com.kbase.dto.ProjectDto;
import com.kbase.dto.ProjectMemberDto;
import com.kbase.model.User;

import java.util.List;

public interface ProjectService {
    ProjectDto createProject(CreateProjectRequest request, User currentUser);
    List<ProjectDto> getProjectsForUser(User currentUser);
    ProjectDto getProjectById(Long id, User currentUser);
    ProjectDto updateProject(Long id, CreateProjectRequest request, User currentUser);
    void deleteProject(Long id, User currentUser);
    ProjectMemberDto inviteMember(Long projectId, InviteMemberRequest request, User currentUser);
    void removeMember(Long projectId, Long userId, User currentUser);
    List<ProjectMemberDto> getProjectMembers(Long projectId, User currentUser);
}
