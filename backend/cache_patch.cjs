const fs = require('fs');
let code = fs.readFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/controller/MarketController.java', 'utf-8');

code = code.replace(
`import org.springframework.web.bind.annotation.RestController;`,
`import org.springframework.web.bind.annotation.RestController;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;`
);

code = code.replace(
`    private final IndianMarketDataService marketDataService;

    public MarketController(IndianMarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }`,
`    private final IndianMarketDataService marketDataService;
    private final Map<String, StockPriceResponse> priceCache = new ConcurrentHashMap<>();
    private final Map<String, Long> cacheTime = new ConcurrentHashMap<>();

    public MarketController(IndianMarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }`
);

code = code.replace(
`    @GetMapping("/price/{stockName}")
    public ResponseEntity<StockPriceResponse> getPricePath(@PathVariable String stockName) {
        return ResponseEntity.ok(marketDataService.getCurrentPrice(stockName));
    }`,
`    @GetMapping("/price/{stockName}")
    public ResponseEntity<StockPriceResponse> getPricePath(@PathVariable String stockName) {
        String key = stockName.toLowerCase();
        if (priceCache.containsKey(key) && (System.currentTimeMillis() - cacheTime.get(key) < 60000)) {
            return ResponseEntity.ok(priceCache.get(key));
        }
        StockPriceResponse response = marketDataService.getCurrentPrice(stockName);
        priceCache.put(key, response);
        cacheTime.put(key, System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }`
);

code = code.replace(
`    @GetMapping("/price")
    public ResponseEntity<StockPriceResponse> getPriceQuery(
            @RequestParam(required = false) String stockName,
            @RequestParam(required = false) String name
    ) {
        String query = stockName != null ? stockName : name;
        if (query == null || query.isBlank()) {
            throw new IndianApiException(400, "Unable to fetch market data.", false);
        }
        return ResponseEntity.ok(marketDataService.getCurrentPrice(query));
    }`,
`    @GetMapping("/price")
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
    }`
);

fs.writeFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/controller/MarketController.java', code);
