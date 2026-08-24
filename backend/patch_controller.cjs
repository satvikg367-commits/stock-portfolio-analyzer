const fs = require('fs');
let code = fs.readFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/controller/StockController.java', 'utf-8');

code = code.replace(
`import org.springframework.web.bind.annotation.*;`,
`import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;`
);

code = code.replace(
`    // DELETE STOCK
    @DeleteMapping("/{id}")
    public String deleteStock(@PathVariable Integer id) {

        stockService.deleteStock(id);

        return "Stock deleted successfully";
    }`,
`    // DELETE STOCK
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable Integer id) {
        stockService.deleteStock(id);
        return ResponseEntity.noContent().build();
    }`
);
fs.writeFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/controller/StockController.java', code);
