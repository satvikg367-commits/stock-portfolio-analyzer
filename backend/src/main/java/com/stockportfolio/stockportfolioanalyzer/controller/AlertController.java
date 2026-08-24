package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.dto.AlertRequest;
import com.stockportfolio.stockportfolioanalyzer.entity.Alert;
import com.stockportfolio.stockportfolioanalyzer.entity.Stock;
import com.stockportfolio.stockportfolioanalyzer.entity.User;
import com.stockportfolio.stockportfolioanalyzer.repository.AlertRepository;
import com.stockportfolio.stockportfolioanalyzer.repository.StockRepository;
import com.stockportfolio.stockportfolioanalyzer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/alerts")
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StockRepository stockRepository;

    @PostMapping
    public ResponseEntity<?> createAlert(@RequestBody AlertRequest request) {
        Optional<User> userOpt = userRepository.findById(request.getUserId());
        Optional<Stock> stockOpt = stockRepository.findById(request.getStockId());

        if (userOpt.isEmpty() || stockOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User or Stock not found");
        }

        Alert alert = new Alert();
        alert.setUser(userOpt.get());
        alert.setStock(stockOpt.get());
        alert.setTargetPrice(request.getTargetPrice());
        alert.setCondition(request.getCondition());
        alert.setActive(request.getActive() != null ? request.getActive() : true);

        return ResponseEntity.ok(alertRepository.save(alert));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Alert>> getAlertsByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(alertRepository.findByUserId(userId));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateAlert(@PathVariable Integer id) {
        Optional<Alert> alertOpt = alertRepository.findById(id);
        if (alertOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Alert alert = alertOpt.get();
        alert.setActive(false);
        return ResponseEntity.ok(alertRepository.save(alert));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAlert(@PathVariable Integer id) {
        if (!alertRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        alertRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
