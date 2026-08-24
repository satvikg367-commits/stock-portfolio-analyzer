const fs = require('fs');
let code = fs.readFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/service/IndianMarketDataService.java', 'utf-8');

code = code.replace(/try\s*\{\s*java\.nio\.file\.Files\.write\([\s\S]*?\} catch \(Exception e\) \{\}/, `System.out.println("DEBUG API: " + uri.toString() + " -> " + status + " " + body);`);

fs.writeFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/service/IndianMarketDataService.java', code);
