const fs = require('fs');
let code = fs.readFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/service/StockService.java', 'utf-8');

if (!code.includes('TransactionRepository')) {
    code = code.replace(
        `import com.stockportfolio.stockportfolioanalyzer.repository.StockRepository;`,
        `import com.stockportfolio.stockportfolioanalyzer.repository.StockRepository;
import com.stockportfolio.stockportfolioanalyzer.repository.TransactionRepository;`
    );

    code = code.replace(
        `@Autowired
    private StockRepository stockRepository;`,
        `@Autowired
    private StockRepository stockRepository;

    @Autowired
    private TransactionRepository transactionRepository;`
    );

    code = code.replace(
        `    // DELETE STOCK
    public void deleteStock(Integer id) {

        Stock stock = getStockById(id);

        stockRepository.delete(stock);
    }`,
        `    // DELETE STOCK
    public void deleteStock(Integer id) {

        Stock stock = getStockById(id);
        
        if (transactionRepository.existsByStockId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete " + stock.getSymbol() + " because existing transactions reference this stock."
            );
        }

        stockRepository.delete(stock);
    }`
    );
    fs.writeFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/service/StockService.java', code);
}
