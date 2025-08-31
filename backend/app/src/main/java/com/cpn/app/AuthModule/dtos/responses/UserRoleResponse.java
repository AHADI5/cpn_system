package com.cpn.app.AuthModule.dtos.responses;


import com.cpn.app.AuthModule.model.UserRole;

import java.util.List;

public record UserRoleResponse(
        long roleId ,
        String roleName,
        String description,
        List<SimpleUser> users
) {
    public static UserRoleResponse toDto(UserRole role) {
        return new UserRoleResponse(
                role.getUserRoleID(),
                role.getRoleName(),
                role.getDescription(),
                role.getUsers() == null ? List.of() : role.getUsers().stream()
                        .map(user -> new SimpleUser(user.getUserID(), user.getUsername()))
                        .toList()
        );
    }

    public record SimpleUser(Long userId, String username) {}
}
