package com.stockportfolio.stockportfolioanalyzer.repository;

import com.stockportfolio.stockportfolioanalyzer.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockRepository extends JpaRepository<Stock, Integer> {

    boolean existsBySymbol(String symbol);

}
