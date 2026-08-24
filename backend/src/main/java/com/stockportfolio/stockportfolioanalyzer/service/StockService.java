package com.stockportfolio.stockportfolioanalyzer.service;

import com.stockportfolio.stockportfolioanalyzer.entity.Stock;
import com.stockportfolio.stockportfolioanalyzer.repository.StockRepository;
import com.stockportfolio.stockportfolioanalyzer.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class StockService {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // CREATE STOCK
    public Stock saveStock(Stock stock) {

        if (stockRepository.existsBySymbol(stock.getSymbol())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stock symbol already exists"
            );
        }

        return stockRepository.save(stock);
    }

    // GET ALL STOCKS
    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    // GET STOCK BY ID
    public Stock getStockById(Integer id) {

        return stockRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Stock not found"
                ));
    }

    // UPDATE STOCK
    public Stock updateStock(Integer id, Stock updatedStock) {

        Stock stock = getStockById(id);

        stock.setSymbol(updatedStock.getSymbol());
        stock.setCompanyname(updatedStock.getCompanyname());
        stock.setSector(updatedStock.getSector());
        stock.setCurrentprice(updatedStock.getCurrentprice());

        return stockRepository.save(stock);
    }

    // DELETE STOCK
    public void deleteStock(Integer id) {

        Stock stock = getStockById(id);
        
        if (transactionRepository.existsByStockId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete " + stock.getSymbol() + " because existing transactions reference this stock."
            );
        }

        stockRepository.delete(stock);
    }
}