const fs = require('fs');
let code = fs.readFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/repository/TransactionRepository.java', 'utf-8');

if (!code.includes('existsByStockId')) {
    code = code.replace(
        `List<Transaction> findByUserIdOrderByTransactionDateDesc(Integer userId);`,
        `List<Transaction> findByUserIdOrderByTransactionDateDesc(Integer userId);
    boolean existsByStockId(Integer stockId);`
    );
    fs.writeFileSync('src/main/java/com/stockportfolio/stockportfolioanalyzer/repository/TransactionRepository.java', code);
}
