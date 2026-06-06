package com.rentnest.service;

import com.rentnest.dto.request.LoginRequest;
import com.rentnest.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    // In AuthService.java
    AuthResponse register(com.rentnest.dto.request.RegisterRequest request);
}