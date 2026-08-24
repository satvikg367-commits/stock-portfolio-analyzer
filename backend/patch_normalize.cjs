const fs = require('fs');
let code = fs.readFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/controller/MarketController.java', 'utf-8');

code = code.replace(
`    public ResponseEntity<StockPriceResponse> getPricePath(@PathVariable String stockName) {`,
`    private String normalizeSymbol(String symbol) {
        if ("TATAMOTORS".equalsIgnoreCase(symbol)) return "TATA MOTORS";
        if ("BAJAJ-AUTO".equalsIgnoreCase(symbol)) return "BAJAJ AUTO";
        if ("M&M".equalsIgnoreCase(symbol)) return "MAHINDRA & MAHINDRA";
        return symbol;
    }

    @GetMapping("/price/{stockName}")
    public ResponseEntity<StockPriceResponse> getPricePath(@PathVariable String stockName) {
        stockName = normalizeSymbol(stockName);`
);

code = code.replace(
`    public ResponseEntity<StockPriceResponse> getPriceQuery(@RequestParam("query") String query) {`,
`    public ResponseEntity<StockPriceResponse> getPriceQuery(@RequestParam("query") String query) {
        query = normalizeSymbol(query);`
);

fs.writeFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/controller/MarketController.java', code);
