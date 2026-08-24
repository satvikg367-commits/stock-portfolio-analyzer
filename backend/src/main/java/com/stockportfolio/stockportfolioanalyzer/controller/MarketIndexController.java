package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.entity.MarketIndex;
import com.stockportfolio.stockportfolioanalyzer.repository.MarketIndexRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/indices")
public class MarketIndexController {

    @Autowired
    private MarketIndexRepository marketIndexRepository;

    @GetMapping
    public List<MarketIndex> getAllIndices() {
        return marketIndexRepository.findAll();
    }
}
