package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.entity.MarketIndex;
import com.stockportfolio.stockportfolioanalyzer.repository.MarketIndexRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/indices")
public class MarketIndexController {

    @Autowired
    private MarketIndexRepository marketIndexRepository;

    private final HttpClient httpClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_2).build();
    private long lastFetch = 0;

    @GetMapping
    public List<MarketIndex> getAllIndices() {
        List<MarketIndex> indices = marketIndexRepository.findAll();
        
        if (System.currentTimeMillis() - lastFetch < 60000) {
            return indices;
        }

        try {
            CompletableFuture<?>[] futures = indices.stream().map(index -> {
                String symbol = getYahooSymbol(index.getName());
                if (symbol == null) return CompletableFuture.completedFuture(null);
                
                return fetchLivePrice(symbol).thenAccept(priceData -> {
                    if (priceData != null && priceData[0] > 0) {
                        index.setCurrentPrice(priceData[0]);
                        index.setPreviousClosePrice(priceData[1] > 0 ? priceData[1] : priceData[0]);
                        marketIndexRepository.save(index);
                    }
                });
            }).toArray(CompletableFuture[]::new);
            
            CompletableFuture.allOf(futures).join();
            lastFetch = System.currentTimeMillis();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return marketIndexRepository.findAll();
    }

    private String getYahooSymbol(String name) {
        if (name == null) return null;
        String upper = name.toUpperCase();
        if (upper.contains("NIFTY 50")) return "^NSEI";
        if (upper.contains("SENSEX")) return "^BSESN";
        if (upper.contains("BANKNIFTY")) return "^NSEBANK";
        if (upper.contains("FINNIFTY")) return "^CNXFIN";
        if (upper.contains("MIDCPNIFTY")) return "^CRSMID";
        return null;
    }

    private CompletableFuture<double[]> fetchLivePrice(String symbol) {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://query2.finance.yahoo.com/v8/finance/chart/" + symbol + "?interval=1d&range=1d"))
                .header("User-Agent", "Mozilla/5.0")
                .GET()
                .build();
                
        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> {
                    try {
                        String body = response.body();
                        double price = extractDouble(body, "\"regularMarketPrice\":");
                        double prevClose = extractDouble(body, "\"chartPreviousClose\":");
                        return new double[]{price, prevClose};
                    } catch (Exception e) {
                        return null;
                    }
                });
    }

    private double extractDouble(String json, String key) {
        int idx = json.indexOf(key);
        if (idx == -1) return 0.0;
        int start = idx + key.length();
        int end = json.indexOf(",", start);
        int end2 = json.indexOf("}", start);
        if (end == -1 || (end2 != -1 && end2 < end)) end = end2;
        if (end == -1) return 0.0;
        try {
            return Double.parseDouble(json.substring(start, end).trim());
        } catch (Exception e) {
            return 0.0;
        }
    }
}
