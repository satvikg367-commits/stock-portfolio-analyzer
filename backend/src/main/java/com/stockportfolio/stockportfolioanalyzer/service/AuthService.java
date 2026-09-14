package com.stockportfolio.stockportfolioanalyzer.service;

import com.stockportfolio.stockportfolioanalyzer.dto.AuthResponse;
import com.stockportfolio.stockportfolioanalyzer.dto.LoginRequest;
import com.stockportfolio.stockportfolioanalyzer.dto.SignupRequest;
import com.stockportfolio.stockportfolioanalyzer.entity.User;
import com.stockportfolio.stockportfolioanalyzer.repository.UserRepository;
import com.stockportfolio.stockportfolioanalyzer.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse signup(SignupRequest request) {
        String name = required(request.getName(), "Name is required");
        String email = required(request.getEmail(), "Email is required").toLowerCase();
        String password = required(request.getPassword(), "Password is required");
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        return responseFor(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest request) {
        String email = required(request.getEmail(), "Email is required").toLowerCase();
        String password = required(request.getPassword(), "Password is required");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwordMatches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        if (!isBcryptHash(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(password));
            user = userRepository.save(user);
        }
        return responseFor(user);
    }

    private AuthResponse responseFor(User user) {
        return new AuthResponse(jwtService.generateToken(user.getEmail()), user);
    }

    private boolean passwordMatches(String submittedPassword, String storedPassword) {
        if (storedPassword == null || storedPassword.isBlank()) return false;
        return isBcryptHash(storedPassword)
                ? passwordEncoder.matches(submittedPassword, storedPassword)
                : storedPassword.equals(submittedPassword);
    }

    private boolean isBcryptHash(String value) {
        return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
    }

    private String required(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }
}
