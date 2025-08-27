package com.cpn.app.AuthModule.controllers.userManagement;



import com.cpn.app.AuthModule.dtos.requests.RoleRequest;
import com.cpn.app.AuthModule.dtos.responses.UserRoleResponse;
import com.cpn.app.AuthModule.model.UserRole;
import com.cpn.app.AuthModule.service.UserRoleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
public record RoleManagementControllers(
        UserRoleService userRoleService
) {
    @PostMapping("/")
    public ResponseEntity<String> createUserRole(@RequestBody RoleRequest roleRequest) {
        UserRole userRole =  userRoleService.createRole(roleRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body("User role created: " + userRole.getRoleName()) ;
    }

    @GetMapping("/")
    public ResponseEntity<List<UserRoleResponse>> getUserRoles() {
        return ResponseEntity.ok(
                userRoleService.findAll()
                        .stream()
                        .map(UserRoleResponse::toDto)
                        .toList()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserRoleResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody RoleRequest request
    ) {
        UserRole updated = userRoleService.updateUserRole(id, request);
        return ResponseEntity.ok(UserRoleResponse.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserRole(@PathVariable Long id) {
        userRoleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
