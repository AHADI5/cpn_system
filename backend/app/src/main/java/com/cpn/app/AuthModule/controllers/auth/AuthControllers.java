package com.cpn.app.AuthModule.controllers.auth;


import com.cpn.app.AuthModule.dtos.requests.AuthenticationRequest;
import com.cpn.app.AuthModule.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequestMapping("api/v1/auth")
public record AuthControllers(
        AuthService authService
) {

    @PostMapping("/")
    public ResponseEntity<String> login(@RequestBody AuthenticationRequest authenticationRequest) {
        return ResponseEntity.ok(authService.login(authenticationRequest));
    }
}
