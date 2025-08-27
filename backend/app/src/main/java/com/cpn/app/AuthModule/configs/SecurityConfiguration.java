package com.cpn.app.AuthModule.configs;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JitAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET,"/api/v1/users/**").hasAnyAuthority("ADMIN", "PORTAL_USER")
                        .requestMatchers(HttpMethod.PUT,"/api/v1/users/**").hasAnyAuthority("ADMIN", "PORTAL_USER")
                        .requestMatchers(HttpMethod.POST,"/api/v1/users/").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE,"/api/v1/users/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/v1/users/disable/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/v1/users/enable/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/v1/roles/**").hasAuthority("ADMIN")
                        .requestMatchers(
                                "/api/v1/auth/**").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return httpSecurity.build();
    }

}
