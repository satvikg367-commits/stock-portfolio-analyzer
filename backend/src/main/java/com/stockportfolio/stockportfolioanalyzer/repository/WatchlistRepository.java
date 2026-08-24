package com.stockportfolio.stockportfolioanalyzer.repository;

import com.stockportfolio.stockportfolioanalyzer.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Integer> {
    List<Watchlist> findByUserId(Integer userId);
    Optional<Watchlist> findByUserIdAndStockId(Integer userId, Integer stockId);
}
