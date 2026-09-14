package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.dto.PortfolioResponse;
import com.stockportfolio.stockportfolioanalyzer.security.CurrentUserService;
import com.stockportfolio.stockportfolioanalyzer.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/portfolio")
@RequiredArgsConstructor
public class PortfolioController {
    private final PortfolioService portfolioService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public List<PortfolioResponse> getPortfolio() {
        return portfolioService.getPortfolio(currentUserService.getCurrentUser().getId());
    }

    @GetMapping("/performance")
    public List<Map<String, Object>> getPortfolioPerformance() {
        List<PortfolioResponse> portfolio = getPortfolio();
        double currentTotalValue = portfolio.stream().mapToDouble(PortfolioResponse::getCurrentValue).sum();
        List<Map<String, Object>> performance = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            Map<String, Object> point = new HashMap<>();
            point.put("date", today.minusMonths(i).toString());
            point.put("value", Math.round(currentTotalValue * (1.0 - (i * 0.05)) * 100.0) / 100.0);
            performance.add(point);
        }
        return performance;
    }
}
