package com.cpn.app.AuthModule;



import com.cpn.app.AuthModule.model.User;
import com.cpn.app.AuthModule.model.UserRole;
import com.cpn.app.AuthModule.repository.UserRepository;
import com.cpn.app.AuthModule.repository.UserRoleRepository;
import com.cpn.app.DemoDataLoaderInterface;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.management.relation.Role;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
public record UserDemoDataLoader(
        UserRepository userRepository,
        UserRoleRepository roleRepository,
        ObjectMapper objectMapper ,
        PasswordEncoder passwordEncoder
) implements DemoDataLoaderInterface {

    @Override
    public void loadDemoData() {
        try (InputStream stream = getClass().getClassLoader().getResourceAsStream("static/user-demo-data.json")) {
            if (stream == null) {
                throw new FileNotFoundException("demo/user-demo-data.json not found");
            }

            List<User> rawUsers = Arrays.asList(objectMapper.readValue(stream, User[].class));
            for (User user : rawUsers) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            log.info("Loaded {} users", rawUsers);

            // Resolve roles before saving users
            List<User> managedUsers = rawUsers.stream()
                    .peek(user -> {
                        List<UserRole> resolvedRoles = Optional.ofNullable(user.getUserRoles())
                                .orElse(List.of()) // prevent NPE
                                .stream()
                                .map(role -> roleRepository.findByRoleName(role.getRoleName())
                                        .orElseGet(() -> roleRepository.save(
                                                UserRole.builder()
                                                        .roleName(role.getRoleName())
                                                        .description(role.getDescription())
                                                        .build()
                                        )))
                                .toList();

                        user.setUserRoles(resolvedRoles); // attach only managed roles
                    })
                    .toList();

            userRepository.saveAll(managedUsers); // now persist all safely

        } catch (IOException e) {
            throw new RuntimeException("Failed to load demo for users", e);
        }
    }
}
