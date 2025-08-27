package com.cpn.app.AuthModule.service;



import com.cpn.app.AuthModule.configs.JwtService;
import com.cpn.app.AuthModule.dtos.requests.AuthenticationRequest;
import com.cpn.app.AuthModule.model.User;
import com.cpn.app.AuthModule.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
public record AuthService(
        AuthenticationManager authenticationManager ,
        UserRepository userRepository,
        JwtService jwtService
) {
    @PostConstruct
    public void testInjection() {
        log.info("userRepository is: {}", userRepository);
    }

    public String login(AuthenticationRequest authenticationRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authenticationRequest.userName(),
                            authenticationRequest.passWord()
                    )
            );
        } catch (Exception e) {
            log.warn("Authentication failed for username {}: {}", authenticationRequest.userName(), e.getMessage());
            throw e;
        }

        Optional<User> user = userRepository.findByUserName(authenticationRequest.userName());
        User userEntity = user.orElseThrow(() -> new UsernameNotFoundException("User not found"));

        log.info("User {} logged in", userEntity.getUsername());
        return jwtService.generateToken(userEntity);
    }

}
