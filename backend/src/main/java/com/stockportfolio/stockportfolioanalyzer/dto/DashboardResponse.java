package com.stockportfolio.stockportfolioanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DashboardResponse {

    private Double totalInvested;
    private Double currentValue;
    private Double profitLoss;
    private Integer totalStocks;
    private Integer totalTransactions;
}