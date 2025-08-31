package com.cpn.app.AuthModule.service;



import com.cpn.app.AuthModule.dtos.requests.RoleRequest;
import com.cpn.app.AuthModule.model.UserRole;
import com.cpn.app.AuthModule.repository.UserRoleRepository;
import com.cpn.app.base.BaseCrudServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;


@Service
public class UserRoleService  extends BaseCrudServiceImpl<UserRole, Long> {

    private final UserRoleRepository userRoleRepository;

    public UserRoleService(UserRoleRepository userRoleRepository) {
        this.userRoleRepository = userRoleRepository;
    }

    public UserRole createRole(RoleRequest roleRequest) {
        UserRole userRole = UserRole.builder()
                .roleName(roleRequest.roleName())
                .description(roleRequest.description())
                .build();
        return   userRoleRepository.save(userRole);
    }


    public UserRole updateUserRole(Long id, RoleRequest request) {
        UserRole role = userRoleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("UserRole not found"));

        role.setRoleName(request.roleName());
        role.setDescription(request.description());
        return userRoleRepository.save(role);
    }


    @Override
    protected JpaRepository<UserRole, Long> getRepository() {
        return userRoleRepository;
    }
}
