package com.cpn.app.AuthModule.configs;

import io.micrometer.common.lang.NonNull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
@Slf4j
@Component
@RequiredArgsConstructor
public class JitAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        //the header containing the JWTOKEN
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userName;
        log.info("The request URI : {}" , request.getRequestURI());
        log.info("Authorization header : {} " , authHeader);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.info("Request is not authorized  {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        //Extracting the token form the Authentication header
        jwt = authHeader.substring(7);
        try {
            userName = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            log.warn("Failed to extract user from JWT : {}" ,e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        //check authentication context
        if (userName != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userName);
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.info("Authenticated user : {}", userName);
                log.info("Authorities : {}", userDetails.getAuthorities());
            }
        } else {
            log.warn("Invalid JWT token for user : {}" , userName);
        }
        //Continue the filter chain
        filterChain.doFilter(request, response);


    }
}
