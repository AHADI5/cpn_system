package com.cpn.app.AuthModule.dtos.requests;

import java.util.List;

public record UserRequest(
        String userName,
        String passWord,
        List<Integer> userRoleIds
) {
}
