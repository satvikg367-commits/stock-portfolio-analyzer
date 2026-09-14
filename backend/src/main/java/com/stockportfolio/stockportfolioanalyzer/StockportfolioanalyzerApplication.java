package com.stockportfolio.stockportfolioanalyzer;

import com.stockportfolio.stockportfolioanalyzer.entity.MarketIndex;
import com.stockportfolio.stockportfolioanalyzer.repository.MarketIndexRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableScheduling
public class StockportfolioanalyzerApplication {

	public static void main(String[] args) {
		SpringApplication.run(StockportfolioanalyzerApplication.class, args);
	}

	@Bean
	public CommandLineRunner dataLoader(MarketIndexRepository indexRepo) {
		return args -> {
			if (indexRepo.count() == 0) {
				indexRepo.save(new MarketIndex("NIFTY 50", 24252.00, 24231.85));
				indexRepo.save(new MarketIndex("SENSEX", 77540.83, 77537.72));
				indexRepo.save(new MarketIndex("BANKNIFTY", 50400.10, 50520.50));
				indexRepo.save(new MarketIndex("FINNIFTY", 23150.25, 23105.15));
				indexRepo.save(new MarketIndex("MIDCPNIFTY", 12450.80, 12370.55));
			}
		};
	}
}
