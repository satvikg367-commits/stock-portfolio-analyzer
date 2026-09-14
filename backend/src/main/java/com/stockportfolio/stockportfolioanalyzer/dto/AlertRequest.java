package com.stockportfolio.stockportfolioanalyzer.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AlertRequest {
    private Integer stockId;
    private Double targetPrice;
    private String condition;
    private Boolean active;
}
