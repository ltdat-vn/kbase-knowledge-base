package com.kbase.service.impl;

import com.kbase.dto.DocumentDto;
import com.kbase.dto.SystemStatsDto;
import com.kbase.dto.UserDto;
import com.kbase.model.Role;
import com.kbase.model.User;
import com.kbase.repository.DocumentRepository;
import com.kbase.repository.ProjectRepository;
import com.kbase.repository.UserRepository;
import com.kbase.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final DocumentRepository documentRepository;

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .toList();
    }

    @Override
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return UserDto.fromEntity(user);
    }

    @Override
    @Transactional
    public UserDto updateUserRole(Long id, Role newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        user.setRole(newRole);
        return UserDto.fromEntity(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserDto toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        user.setEnabled(!user.isEnabled());
        return UserDto.fromEntity(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public SystemStatsDto getSystemStats() {
        long totalUsers = userRepository.count();
        long totalProjects = projectRepository.count();
        long totalDocuments = documentRepository.count();
        Long storage = documentRepository.getTotalStorageUsed();
        long totalBytes = (storage != null) ? storage : 0L;

        return SystemStatsDto.builder()
                .totalUsers(totalUsers)
                .totalProjects(totalProjects)
                .totalDocuments(totalDocuments)
                .totalStorageBytes(totalBytes)
                .formattedStorage(DocumentDto.formatBytes(totalBytes))
                .build();
    }
}
