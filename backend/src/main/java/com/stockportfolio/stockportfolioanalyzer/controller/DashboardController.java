package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.dto.DashboardResponse;
import com.stockportfolio.stockportfolioanalyzer.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/user/{userId}")
    public DashboardResponse getDashboard(
            @PathVariable Integer userId) {

        return dashboardService.getDashboard(userId);
    }
}