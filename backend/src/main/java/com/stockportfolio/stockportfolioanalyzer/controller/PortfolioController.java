package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.dto.PortfolioResponse;
import com.stockportfolio.stockportfolioanalyzer.service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/portfolio")
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;

    @GetMapping("/user/{userId}")
    public List<PortfolioResponse> getPortfolio(
            @PathVariable Integer userId) {

        return portfolioService.getPortfolio(userId);
    }

    @GetMapping("/user/{userId}/performance")
    public List<java.util.Map<String, Object>> getPortfolioPerformance(@PathVariable Integer userId) {
        List<PortfolioResponse> portfolio = portfolioService.getPortfolio(userId);
        double currentTotalValue = portfolio.stream()
                .mapToDouble(PortfolioResponse::getCurrentValue)
                .sum();

        List<java.util.Map<String, Object>> performance = new java.util.ArrayList<>();
        java.time.LocalDate today = java.time.LocalDate.now();
        
        // Mock 6 months of data, let's say 1 point per month
        for (int i = 5; i >= 0; i--) {
            java.time.LocalDate date = today.minusMonths(i);
            // Just a basic random fluctuation around the current value based on i
            double mockedValue = currentTotalValue * (1.0 - (i * 0.05)); // drops by 5% each month back
            
            java.util.Map<String, Object> point = new java.util.HashMap<>();
            point.put("date", date.toString());
            point.put("value", Math.round(mockedValue * 100.0) / 100.0);
            performance.add(point);
        }
        
        return performance;
    }
}