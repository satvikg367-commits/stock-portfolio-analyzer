package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.dto.ProfileUpdateRequest;
import com.stockportfolio.stockportfolioanalyzer.entity.User;
import com.stockportfolio.stockportfolioanalyzer.security.CurrentUserService;
import com.stockportfolio.stockportfolioanalyzer.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public List<User> getOnlyCurrentUser() {
        return List.of(currentUserService.getCurrentUser());
    }

    @GetMapping("/me")
    public User getCurrentUser() {
        return currentUserService.getCurrentUser();
    }

    @PutMapping("/me")
    public User updateCurrentUser(@RequestBody ProfileUpdateRequest request) {
        return userService.updateProfile(currentUserService.getCurrentUser(), request);
    }

    @PutMapping("/me/password")
    public User changePassword(@RequestBody com.stockportfolio.stockportfolioanalyzer.dto.PasswordChangeRequest request) {
        return userService.changePassword(currentUserService.getCurrentUser(), request);
    }
}
