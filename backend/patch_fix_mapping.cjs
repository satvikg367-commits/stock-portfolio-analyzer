const fs = require('fs');
let code = fs.readFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/controller/MarketController.java', 'utf-8');

code = code.replace(
`    @GetMapping("/price/{stockName}")
    private String normalizeSymbol(String symbol) {`,
`    private String normalizeSymbol(String symbol) {`
);

fs.writeFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/controller/MarketController.java', code);
