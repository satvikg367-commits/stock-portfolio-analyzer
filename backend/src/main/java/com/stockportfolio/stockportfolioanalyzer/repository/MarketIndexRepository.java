package com.stockportfolio.stockportfolioanalyzer.repository;

import com.stockportfolio.stockportfolioanalyzer.entity.MarketIndex;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketIndexRepository extends JpaRepository<MarketIndex, Long> {
}
