package com.cpn.app.AuthModule.service;



import com.cpn.app.AuthModule.dtos.requests.UserRequest;
import com.cpn.app.AuthModule.model.User;
import com.cpn.app.AuthModule.model.UserRole;
import com.cpn.app.AuthModule.repository.UserRepository;
import com.cpn.app.AuthModule.repository.UserRoleRepository;
import com.cpn.app.base.BaseCrudServiceImpl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService extends BaseCrudServiceImpl<User, Long> {

    private final UserRepository userRepository ;
    private final UserRoleRepository userRoleRepository ;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, UserRoleRepository userRoleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(UserRequest userRequest) {
        List<UserRole> userRoles = new ArrayList<>();
        for (int userRoleId : userRequest.userRoleIds()) {
            Optional<UserRole> userRole = userRoleRepository.findById((long) userRoleId);
            UserRole userRoleEntity = userRole.orElseThrow(() -> new UsernameNotFoundException("User not found"));
            userRoles.add(userRoleEntity);
        }


        User user = User.builder()
                .userName(userRequest.userName())
                .password(passwordEncoder.encode(userRequest.passWord()))
                .isEnabled(true)
                .userRoles(userRoles)
                .build() ;

        return userRepository.save(user);
    }

    public void updateUser(UserRequest userRequest, long userID) {
        User user = findById(userID);
        user.setUserName(userRequest.userName());
        user.setPassword(userRequest.passWord());
        userRepository.save(user);
    }

    public void enableUser(long userID) {
        User user = findById(userID);
        user.setEnabled(true);
        userRepository.save(user);
    }

    public void disableUser(long userID) {
        User user = findById(userID);
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    protected JpaRepository<User, Long> getRepository() {
        return userRepository;
    }
}
