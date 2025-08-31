package com.cpn.app.AuthModule.dtos.responses;


import com.cpn.app.AuthModule.model.User;

import java.time.LocalDateTime;
import java.util.List;

public record UserResponse(
        Long userID,
        String userName,
        boolean isEnabled,
        List<SimpleRole> roles ,
        LocalDateTime lastLogin
) {
    public static UserResponse toDto(User user) {
        return new UserResponse(
                user.getUserID(),
                user.getUsername(),
                user.isEnabled(),
                user.getUserRoles() == null ? List.of() :
                        user.getUserRoles().stream()
                                .map(role -> new SimpleRole(role.getUserRoleID() ,role.getRoleName(), role.getDescription()))
                                .toList(),
                user.getLastLogin() == null ? LocalDateTime.now() : user.getLastLogin()
        );
    }

    public record SimpleRole(long roleID,String roleName, String description) {}
}
