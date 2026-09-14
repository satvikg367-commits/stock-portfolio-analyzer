package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.dto.AuthResponse;
import com.stockportfolio.stockportfolioanalyzer.dto.LoginRequest;
import com.stockportfolio.stockportfolioanalyzer.dto.SignupRequest;
import com.stockportfolio.stockportfolioanalyzer.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
