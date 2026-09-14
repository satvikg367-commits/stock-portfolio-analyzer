package com.stockportfolio.stockportfolioanalyzer.service;

import com.stockportfolio.stockportfolioanalyzer.entity.Stock;
import com.stockportfolio.stockportfolioanalyzer.repository.StockRepository;
import com.stockportfolio.stockportfolioanalyzer.dto.StockPriceResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StockPriceUpdater {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private IndianMarketDataService indianMarketDataService;

    // Run after initial delay of 5 seconds, then every 2 minutes (120,000 ms)
    @Scheduled(initialDelay = 5000, fixedDelay = 300000)
    public void updateStockPrices() {
        List<Stock> stocks = stockRepository.findAll();
        
        for (Stock stock : stocks) {
            try {
                StockPriceResponse response = indianMarketDataService.getCurrentPrice(stock.getSymbol());
                if (response != null && response.getPrice() > 0) {
                    stock.setCurrentprice(response.getPrice());
                    stockRepository.save(stock);
                }
                // Small delay to be polite to the API
                Thread.sleep(200);
            } catch (Exception e) {
                // Ignore failures (e.g. missing stocks like ZOMATO)
            }
        }
    }
}
