package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.dto.WatchlistRequest;
import com.stockportfolio.stockportfolioanalyzer.entity.Stock;
import com.stockportfolio.stockportfolioanalyzer.entity.User;
import com.stockportfolio.stockportfolioanalyzer.entity.Watchlist;
import com.stockportfolio.stockportfolioanalyzer.repository.StockRepository;
import com.stockportfolio.stockportfolioanalyzer.repository.WatchlistRepository;
import com.stockportfolio.stockportfolioanalyzer.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/watchlist")
@RequiredArgsConstructor
public class WatchlistController {
    private final WatchlistRepository watchlistRepository;
    private final StockRepository stockRepository;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<?> addToWatchlist(@RequestBody WatchlistRequest request) {
        User user = currentUserService.getCurrentUser();
        Optional<Stock> stockOpt = stockRepository.findById(request.getStockId());
        if (stockOpt.isEmpty()) return ResponseEntity.badRequest().body("User or Stock not found");
        Optional<Watchlist> existing = watchlistRepository.findByUserIdAndStockId(user.getId(), request.getStockId());
        if (existing.isPresent()) return ResponseEntity.badRequest().body("Stock is already in watchlist");
        Watchlist watchlist = new Watchlist();
        watchlist.setUser(user);
        watchlist.setStock(stockOpt.get());
        return ResponseEntity.ok(watchlistRepository.save(watchlist));
    }

    @GetMapping
    public ResponseEntity<List<Watchlist>> getWatchlistByUser() {
        return ResponseEntity.ok(watchlistRepository.findByUserId(currentUserService.getCurrentUser().getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeFromWatchlist(@PathVariable Integer id) {
        Optional<Watchlist> watchlist = watchlistRepository.findById(id);
        if (watchlist.isEmpty()) return ResponseEntity.notFound().build();
        if (!watchlist.get().getUser().getId().equals(currentUserService.getCurrentUser().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        watchlistRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
