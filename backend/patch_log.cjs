const fs = require('fs');
let code = fs.readFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/service/IndianMarketDataService.java', 'utf-8');

code = code.replace(
`        int status = response.getStatusCode().value();
        String body = response.getBody() == null ? "" : response.getBody();
        String lower = body.toLowerCase();`,
`        int status = response.getStatusCode().value();
        String body = response.getBody() == null ? "" : response.getBody();
        System.out.println("DEBUG API: " + uri.toString() + " -> " + status + " " + body);
        String lower = body.toLowerCase();`
);

fs.writeFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/service/IndianMarketDataService.java', code);
