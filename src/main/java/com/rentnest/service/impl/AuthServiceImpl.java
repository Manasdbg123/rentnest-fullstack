package com.rentnest.service.impl;

import com.rentnest.dto.request.LoginRequest;
import com.rentnest.dto.request.RegisterRequest;
import com.rentnest.dto.response.AuthResponse;
import com.rentnest.entity.User;
import com.rentnest.repository.UserRepository;
import com.rentnest.security.JwtTokenProvider;
import com.rentnest.security.UserPrincipal;
import com.rentnest.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userPrincipal.getId())
                .name(userPrincipal.getUser().getName())
                .email(userPrincipal.getUsername())
                .role(userPrincipal.getUser().getRole().name())
                .build();
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        try {
            // 1. Cleanly reject duplicate emails
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered!");
            }

            // 2. Save new user
            User user = User.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(request.getRole())
                    .build();

            userRepository.save(user);

            // 3. Attempt Auto-Login
            LoginRequest loginReq = new LoginRequest();
            loginReq.setEmail(request.getEmail());
            loginReq.setPassword(request.getPassword());
            return login(loginReq);

        } catch (Exception e) {
            // Force the exact reason for the crash into your IntelliJ console
            e.printStackTrace();
            throw e;
        }
    }
}