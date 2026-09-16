package com.kbase.dto;

import com.kbase.model.ProjectMember;
import com.kbase.model.ProjectRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberDto {
    private Long id;
    private UserDto user;
    private ProjectRole role;
    private LocalDateTime joinedAt;

    public static ProjectMemberDto fromEntity(ProjectMember member) {
        if (member == null) return null;
        return ProjectMemberDto.builder()
                .id(member.getId())
                .user(UserDto.fromEntity(member.getUser()))
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
