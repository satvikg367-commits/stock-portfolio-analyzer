const fs = require('fs');
let code = fs.readFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/service/IndianMarketDataService.java', 'utf-8');

code = code.replace(
`System.out.println("DEBUG API: " + uri.toString() + " -> " + status + " " + body);`,
`try {
    java.nio.file.Files.write(
        java.nio.file.Paths.get("api_debug.log"),
        ("DEBUG API: " + uri.toString() + " -> " + status + " " + body + "\n").getBytes(),
        java.nio.file.StandardOpenOption.CREATE,
        java.nio.file.StandardOpenOption.APPEND
    );
} catch (Exception e) {}`
);

fs.writeFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/service/IndianMarketDataService.java', code);
