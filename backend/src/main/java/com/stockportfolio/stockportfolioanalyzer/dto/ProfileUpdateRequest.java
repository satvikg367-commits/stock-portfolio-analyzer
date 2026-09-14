package com.stockportfolio.stockportfolioanalyzer.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileUpdateRequest {
    private String name;
    private String email;
    private String currentPassword;
    private String newPassword;
}
