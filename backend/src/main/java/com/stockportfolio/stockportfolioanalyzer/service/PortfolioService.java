package com.stockportfolio.stockportfolioanalyzer.service;

import com.stockportfolio.stockportfolioanalyzer.dto.PortfolioResponse;
import com.stockportfolio.stockportfolioanalyzer.entity.Stock;
import com.stockportfolio.stockportfolioanalyzer.entity.Transaction;
import com.stockportfolio.stockportfolioanalyzer.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PortfolioService {

    @Autowired
    private TransactionRepository transactionRepository;

    public List<PortfolioResponse> getPortfolio(Integer userId) {

        List<Transaction> transactions =
                transactionRepository.findByUserId(userId);

        Map<Integer, List<Transaction>> stockTransactions = new HashMap<>();

        for (Transaction transaction : transactions) {

            Integer stockId = transaction.getStock().getId();

            stockTransactions
                    .computeIfAbsent(stockId, k -> new ArrayList<>())
                    .add(transaction);
        }

        List<PortfolioResponse> portfolio = new ArrayList<>();

        for (List<Transaction> stockTransactionList : stockTransactions.values()) {

            Stock stock = stockTransactionList.get(0).getStock();

            int quantity = 0;
            double totalCost = 0;

            for (Transaction transaction : stockTransactionList) {

                if (transaction.getTransactionType().equalsIgnoreCase("BUY")) {

                    quantity += transaction.getQuantity();
                    totalCost += transaction.getQuantity() * transaction.getPrice();

                } else if (transaction.getTransactionType().equalsIgnoreCase("SELL")) {
                    
                    double currentAveragePrice = (quantity > 0) ? (totalCost / quantity) : 0;
                    quantity -= transaction.getQuantity();
                    totalCost -= transaction.getQuantity() * currentAveragePrice;
                }
            }

            if (quantity <= 0) {
                continue;
            }

            double averageBuyPrice = totalCost / quantity;

            double currentPrice = stock.getCurrentprice();

            double investedValue = quantity * averageBuyPrice;

            double currentValue = quantity * currentPrice;

            double profitLoss = currentValue - investedValue;

            PortfolioResponse response = new PortfolioResponse(
                    stock.getId(),
                    stock.getSymbol(),
                    stock.getCompanyname(),
                    quantity,
                    averageBuyPrice,
                    currentPrice,
                    investedValue,
                    currentValue,
                    profitLoss
            );

            portfolio.add(response);
        }

        return portfolio;
    }
}