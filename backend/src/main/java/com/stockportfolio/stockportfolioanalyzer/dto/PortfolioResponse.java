package com.stockportfolio.stockportfolioanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PortfolioResponse {

    private Integer stockId;
    private String symbol;
    private String companyName;

    private Integer quantity;

    private Double averageBuyPrice;
    private Double currentPrice;

    private Double investedValue;
    private Double currentValue;

    private Double profitLoss;
}