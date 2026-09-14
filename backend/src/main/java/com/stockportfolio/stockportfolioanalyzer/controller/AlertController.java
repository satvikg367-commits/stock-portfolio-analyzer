package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.dto.AlertRequest;
import com.stockportfolio.stockportfolioanalyzer.entity.Alert;
import com.stockportfolio.stockportfolioanalyzer.entity.Stock;
import com.stockportfolio.stockportfolioanalyzer.entity.User;
import com.stockportfolio.stockportfolioanalyzer.repository.AlertRepository;
import com.stockportfolio.stockportfolioanalyzer.repository.StockRepository;
import com.stockportfolio.stockportfolioanalyzer.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/alerts")
@RequiredArgsConstructor
public class AlertController {
    private final AlertRepository alertRepository;
    private final StockRepository stockRepository;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<?> createAlert(@RequestBody AlertRequest request) {
        User user = currentUserService.getCurrentUser();
        Optional<Stock> stockOpt = stockRepository.findById(request.getStockId());
        if (stockOpt.isEmpty()) return ResponseEntity.badRequest().body("User or Stock not found");
        Alert alert = new Alert();
        alert.setUser(user);
        alert.setStock(stockOpt.get());
        alert.setTargetPrice(request.getTargetPrice());
        alert.setCondition(request.getCondition());
        alert.setActive(request.getActive() != null ? request.getActive() : true);
        return ResponseEntity.ok(alertRepository.save(alert));
    }

    @GetMapping
    public ResponseEntity<List<Alert>> getAlertsByUser() {
        return ResponseEntity.ok(alertRepository.findByUserId(currentUserService.getCurrentUser().getId()));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateAlert(@PathVariable Integer id) {
        Optional<Alert> alertOpt = alertRepository.findById(id);
        if (alertOpt.isEmpty()) return ResponseEntity.notFound().build();
        Alert alert = alertOpt.get();
        if (!alert.getUser().getId().equals(currentUserService.getCurrentUser().getId())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        alert.setActive(false);
        return ResponseEntity.ok(alertRepository.save(alert));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAlert(@PathVariable Integer id) {
        Optional<Alert> alertOpt = alertRepository.findById(id);
        if (alertOpt.isEmpty()) return ResponseEntity.notFound().build();
        if (!alertOpt.get().getUser().getId().equals(currentUserService.getCurrentUser().getId())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        alertRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
