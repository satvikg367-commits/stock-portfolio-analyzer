package com.stockportfolio.stockportfolioanalyzer.service;

import com.stockportfolio.stockportfolioanalyzer.dto.ProfileUpdateRequest;
import com.stockportfolio.stockportfolioanalyzer.entity.User;
import com.stockportfolio.stockportfolioanalyzer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User updateProfile(User user, ProfileUpdateRequest request) {
        String name = required(request.getName(), "Name is required");
        String email = required(request.getEmail(), "Email is required").toLowerCase();
        userRepository.findByEmail(email)
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
                });
        user.setName(name);
        user.setEmail(email);

        return userRepository.save(user);
    }

    public User changePassword(User user, com.stockportfolio.stockportfolioanalyzer.dto.PasswordChangeRequest request) {
        String currentPassword = required(request.getCurrentPassword(), "Current password is required to change password");
        String newPassword = required(request.getNewPassword(), "New password is required to change password");
        
        if (!passwordMatches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        return userRepository.save(user);
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
