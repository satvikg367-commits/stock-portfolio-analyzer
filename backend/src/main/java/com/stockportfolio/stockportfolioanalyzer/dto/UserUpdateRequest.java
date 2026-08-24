package com.stockportfolio.stockportfolioanalyzer.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {

    private String name;
    private String email;
    private String password;
}