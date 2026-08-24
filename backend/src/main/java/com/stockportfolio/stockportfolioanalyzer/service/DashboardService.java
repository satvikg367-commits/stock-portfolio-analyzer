package com.stockportfolio.stockportfolioanalyzer.service;

import com.stockportfolio.stockportfolioanalyzer.dto.DashboardResponse;
import com.stockportfolio.stockportfolioanalyzer.dto.PortfolioResponse;
import com.stockportfolio.stockportfolioanalyzer.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private PortfolioService portfolioService;

    @Autowired
    private TransactionRepository transactionRepository;

    public DashboardResponse getDashboard(Integer userId) {

        List<PortfolioResponse> portfolio =
                portfolioService.getPortfolio(userId);

        double totalInvested = 0;
        double currentValue = 0;
        double profitLoss = 0;

        for (PortfolioResponse stock : portfolio) {

            totalInvested += stock.getInvestedValue();
            currentValue += stock.getCurrentValue();
            profitLoss += stock.getProfitLoss();
        }

        int totalStocks = portfolio.size();

        int totalTransactions =
                transactionRepository.findByUserId(userId).size();

        return new DashboardResponse(
                totalInvested,
                currentValue,
                profitLoss,
                totalStocks,
                totalTransactions
        );
    }
}