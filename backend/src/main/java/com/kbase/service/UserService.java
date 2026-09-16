package com.kbase.service;

import com.kbase.dto.SystemStatsDto;
import com.kbase.dto.UserDto;
import com.kbase.model.Role;

import java.util.List;

public interface UserService {
    List<UserDto> getAllUsers();
    UserDto getUserById(Long id);
    UserDto updateUserRole(Long id, Role newRole);
    UserDto toggleUserStatus(Long id);
    void deleteUser(Long id);
    SystemStatsDto getSystemStats();
}
