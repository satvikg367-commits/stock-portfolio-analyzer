package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.dto.DashboardResponse;
import com.stockportfolio.stockportfolioanalyzer.security.CurrentUserService;
import com.stockportfolio.stockportfolioanalyzer.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public DashboardResponse getDashboard() {
        return dashboardService.getDashboard(currentUserService.getCurrentUser().getId());
    }
}
