package com.stockportfolio.stockportfolioanalyzer.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {

    private Integer stockId;

    private Integer quantity;

    private Double price;

    private String transactionType;
}