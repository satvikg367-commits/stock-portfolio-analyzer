package com.stockportfolio.stockportfolioanalyzer.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.stockportfolio.stockportfolioanalyzer.dto.StockPriceResponse;
import com.stockportfolio.stockportfolioanalyzer.exception.IndianApiException;
import com.stockportfolio.stockportfolioanalyzer.service.IndianMarketDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@RestController
@RequestMapping("/market")
@CrossOrigin(origins = "*")
public class MarketController {

    private final IndianMarketDataService marketDataService;
    private final Map<String, StockPriceResponse> priceCache = new ConcurrentHashMap<>();
    private final Map<String, Long> cacheTime = new ConcurrentHashMap<>();

    public MarketController(IndianMarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    private String normalizeSymbol(String symbol) {
        if ("TATAMOTORS".equalsIgnoreCase(symbol)) return "TATA MOTORS";
        if ("BAJAJ-AUTO".equalsIgnoreCase(symbol)) return "BAJAJ AUTO";
        if ("M&M".equalsIgnoreCase(symbol)) return "MAHINDRA & MAHINDRA";
        return symbol;
    }

    @GetMapping("/price/{stockName}")
    public ResponseEntity<StockPriceResponse> getPricePath(@PathVariable String stockName) {
        stockName = normalizeSymbol(stockName);
        String key = stockName.toLowerCase();
        if (priceCache.containsKey(key) && (System.currentTimeMillis() - cacheTime.get(key) < 60000)) {
            return ResponseEntity.ok(priceCache.get(key));
        }
        StockPriceResponse response = marketDataService.getCurrentPrice(stockName);
        priceCache.put(key, response);
        cacheTime.put(key, System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/price")
    public ResponseEntity<StockPriceResponse> getPriceQuery(
            @RequestParam(required = false) String stockName,
            @RequestParam(required = false) String name
    ) {
        String query = stockName != null ? stockName : name;
        if (query == null || query.isBlank()) {
            throw new IndianApiException(400, "Unable to fetch market data.", false);
        }
        String key = query.toLowerCase();
        if (priceCache.containsKey(key) && (System.currentTimeMillis() - cacheTime.get(key) < 60000)) {
            return ResponseEntity.ok(priceCache.get(key));
        }
        StockPriceResponse response = marketDataService.getCurrentPrice(query);
        priceCache.put(key, response);
        cacheTime.put(key, System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stock")
    public ResponseEntity<JsonNode> getStockDetails(@RequestParam String name) {
        return ResponseEntity.ok(marketDataService.getStockDetails(name));
    }

    @GetMapping("/historical")
    public ResponseEntity<JsonNode> getHistoricalData(
            @RequestParam String stockName,
            @RequestParam(defaultValue = "1yr") String period,
            @RequestParam(defaultValue = "price") String filter
    ) {
        return ResponseEntity.ok(marketDataService.getHistoricalData(stockName, period, filter));
    }

    @GetMapping("/trending")
    public ResponseEntity<JsonNode> getTrending() {
        return ResponseEntity.ok(marketDataService.getTrendingStocks());
    }

    @GetMapping("/news")
    public ResponseEntity<JsonNode> getNews() {
        return ResponseEntity.ok(marketDataService.getNews());
    }

    @GetMapping("/ipo")
    public ResponseEntity<JsonNode> getIpo() {
        return ResponseEntity.ok(marketDataService.getIpoData());
    }

    @GetMapping("/price-shockers")
    public ResponseEntity<JsonNode> getPriceShockers() {
        return ResponseEntity.ok(marketDataService.getPriceShockers());
    }

    @GetMapping("/bse-most-active")
    public ResponseEntity<JsonNode> getBseMostActive() {
        return ResponseEntity.ok(marketDataService.getBseMostActiveStocks());
    }

    @GetMapping("/nse-most-active")
    public ResponseEntity<JsonNode> getNseMostActive() {
        return ResponseEntity.ok(marketDataService.getNseMostActiveStocks());
    }

    @GetMapping("/52-week")
    public ResponseEntity<JsonNode> get52Week() {
        return ResponseEntity.ok(marketDataService.get52WeekHighLow());
    }

    @GetMapping("/industry")
    public ResponseEntity<JsonNode> getIndustry(@RequestParam String query) {
        return ResponseEntity.ok(marketDataService.getIndustryStocks(query));
    }

    @GetMapping("/corporate-actions")
    public ResponseEntity<JsonNode> getCorporateActions(@RequestParam String stockName) {
        return ResponseEntity.ok(marketDataService.getCorporateActions(stockName));
    }

    @GetMapping("/mutual-funds")
    public ResponseEntity<JsonNode> getMutualFunds() {
        return ResponseEntity.ok(marketDataService.getMutualFunds());
    }

    @GetMapping("/mutual-funds/search")
    public ResponseEntity<JsonNode> searchMutualFunds(@RequestParam String query) {
        return ResponseEntity.ok(marketDataService.getMutualFundSearch(query));
    }

    @GetMapping("/mutual-funds/details")
    public ResponseEntity<JsonNode> getMutualFundDetails(@RequestParam String name) {
        return ResponseEntity.ok(marketDataService.getMutualFundDetails(name));
    }

    @GetMapping("/target-price")
    public ResponseEntity<JsonNode> getTargetPrice(@RequestParam String stockName) {
        return ResponseEntity.ok(marketDataService.getTargetPrice(stockName));
    }

    @GetMapping("/announcements")
    public ResponseEntity<JsonNode> getAnnouncements(@RequestParam String stockName) {
        return ResponseEntity.ok(marketDataService.getRecentAnnouncements(stockName));
    }

    @GetMapping("/statement")
    public ResponseEntity<JsonNode> getStatement(
            @RequestParam String stockName,
            @RequestParam String stats
    ) {
        return ResponseEntity.ok(marketDataService.getStatement(stockName, stats));
    }

    @GetMapping("/historical-stats")
    public ResponseEntity<JsonNode> getHistoricalStats(
            @RequestParam String stockName,
            @RequestParam String stats
    ) {
        return ResponseEntity.ok(marketDataService.getHistoricalStats(stockName, stats));
    }

    @GetMapping("/forecasts")
    public ResponseEntity<JsonNode> getForecasts(
            @RequestParam String stockName,
            @RequestParam(defaultValue = "EPS") String measureCode,
            @RequestParam(defaultValue = "Annual") String periodType,
            @RequestParam(defaultValue = "Estimates") String dataType,
            @RequestParam(defaultValue = "Current") String age
    ) {
        return ResponseEntity.ok(marketDataService.getStockForecasts(
                stockName,
                measureCode,
                periodType,
                dataType,
                age
        ));
    }

    @GetMapping("/commodities")
    public ResponseEntity<JsonNode> getCommodities() {
        return ResponseEntity.ok(marketDataService.getCommodities());
    }

    @GetMapping("/chart")
    public ResponseEntity<java.util.List<Map<String, Object>>> getChart(
            @RequestParam String symbol,
            @RequestParam(defaultValue = "1mo") String range
    ) {
        String yahooSymbol = normalizeSymbol(symbol).toUpperCase();
        if (!yahooSymbol.contains(".")) {
             if (yahooSymbol.contains("NIFTY") || yahooSymbol.contains("SENSEX")) {
                 if (yahooSymbol.contains("NIFTY 50")) yahooSymbol = "^NSEI";
                 else if (yahooSymbol.contains("SENSEX")) yahooSymbol = "^BSESN";
                 else if (yahooSymbol.contains("BANKNIFTY")) yahooSymbol = "^NSEBANK";
                 else if (yahooSymbol.contains("FINNIFTY")) yahooSymbol = "^CNXFIN";
                 else if (yahooSymbol.contains("MIDCPNIFTY")) yahooSymbol = "^CRSMID";
             } else {
                 yahooSymbol = yahooSymbol + ".NS";
             }
        }
        
        String interval = "1d";
        if ("1d".equals(range)) interval = "5m";
        else if ("5d".equals(range)) interval = "15m";
        else if ("1mo".equals(range)) interval = "1d";
        else if ("6mo".equals(range)) interval = "1d";
        else if ("1y".equals(range)) interval = "1d";
        else if ("5y".equals(range)) interval = "1wk";
        else interval = "1d";
        
        try {
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create("https://query2.finance.yahoo.com/v8/finance/chart/" + yahooSymbol + "?interval=" + interval + "&range=" + range))
                .header("User-Agent", "Mozilla/5.0")
                .GET()
                .build();
            java.net.http.HttpResponse<String> response = java.net.http.HttpClient.newHttpClient().send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            String body = response.body();
            
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(body);
            com.fasterxml.jackson.databind.JsonNode result = root.path("chart").path("result").get(0);
            
            if (result == null || result.isMissingNode()) {
                return ResponseEntity.ok(java.util.List.of());
            }
            
            com.fasterxml.jackson.databind.JsonNode timestamps = result.path("timestamp");
            com.fasterxml.jackson.databind.JsonNode closePrices = result.path("indicators").path("quote").get(0).path("close");
            
            java.util.List<Map<String, Object>> chartData = new java.util.ArrayList<>();
            if (timestamps != null && timestamps.isArray()) {
                for (int i = 0; i < timestamps.size(); i++) {
                    com.fasterxml.jackson.databind.JsonNode priceNode = closePrices.get(i);
                    if (priceNode == null || priceNode.isNull() || !priceNode.isNumber()) continue;
                    double price = priceNode.asDouble();
                    if (Double.isNaN(price) || price == 0) continue;
                    long ts = timestamps.get(i).asLong() * 1000;
                    
                    String formattedTime;
                    if ("1d".equals(range) || "5d".equals(range)) {
                        formattedTime = new java.text.SimpleDateFormat("MMM dd, HH:mm").format(new java.util.Date(ts));
                    } else {
                        formattedTime = new java.text.SimpleDateFormat("MMM dd, yyyy").format(new java.util.Date(ts));
                    }
                    
                    chartData.add(Map.of(
                        "time", formattedTime,
                        "timestamp", ts,
                        "price", Math.round(price * 100.0) / 100.0
                    ));
                }
            }
            return ResponseEntity.ok(chartData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

}