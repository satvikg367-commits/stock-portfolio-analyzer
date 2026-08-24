package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.dto.WatchlistRequest;
import com.stockportfolio.stockportfolioanalyzer.entity.Stock;
import com.stockportfolio.stockportfolioanalyzer.entity.User;
import com.stockportfolio.stockportfolioanalyzer.entity.Watchlist;
import com.stockportfolio.stockportfolioanalyzer.repository.StockRepository;
import com.stockportfolio.stockportfolioanalyzer.repository.UserRepository;
import com.stockportfolio.stockportfolioanalyzer.repository.WatchlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/watchlist")
public class WatchlistController {

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StockRepository stockRepository;

    @PostMapping
    public ResponseEntity<?> addToWatchlist(@RequestBody WatchlistRequest request) {
        Optional<User> userOpt = userRepository.findById(request.getUserId());
        Optional<Stock> stockOpt = stockRepository.findById(request.getStockId());

        if (userOpt.isEmpty() || stockOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User or Stock not found");
        }

        Optional<Watchlist> existing = watchlistRepository.findByUserIdAndStockId(request.getUserId(), request.getStockId());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body("Stock is already in watchlist");
        }

        Watchlist watchlist = new Watchlist();
        watchlist.setUser(userOpt.get());
        watchlist.setStock(stockOpt.get());

        return ResponseEntity.ok(watchlistRepository.save(watchlist));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Watchlist>> getWatchlistByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(watchlistRepository.findByUserId(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeFromWatchlist(@PathVariable Integer id) {
        if (!watchlistRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        watchlistRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
