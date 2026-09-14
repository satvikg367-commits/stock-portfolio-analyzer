package com.stockportfolio.stockportfolioanalyzer.dto;

import com.stockportfolio.stockportfolioanalyzer.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private User user;
}
