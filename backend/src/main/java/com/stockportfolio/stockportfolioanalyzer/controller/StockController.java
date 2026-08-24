package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.entity.Stock;
import com.stockportfolio.stockportfolioanalyzer.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/stocks")
public class StockController {

    @Autowired
    private StockService stockService;

    // CREATE STOCK
    @PostMapping
    public Stock saveStock(@RequestBody Stock stock) {
        return stockService.saveStock(stock);
    }

    // GET ALL STOCKS
    @GetMapping
    public List<Stock> getAllStocks() {
        return stockService.getAllStocks();
    }

    // GET STOCK BY ID
    @GetMapping("/{id}")
    public Stock getStockById(@PathVariable Integer id) {
        return stockService.getStockById(id);
    }

    // UPDATE STOCK
    @PutMapping("/{id}")
    public Stock updateStock(
            @PathVariable Integer id,
            @RequestBody Stock stock) {

        return stockService.updateStock(id, stock);
    }

    // DELETE STOCK
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable Integer id) {
        stockService.deleteStock(id);
        return ResponseEntity.noContent().build();
    }
}