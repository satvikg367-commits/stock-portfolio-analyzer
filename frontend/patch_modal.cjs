const fs = require('fs');
let code = fs.readFileSync('src/components/StockDetailModal.jsx', 'utf-8');

code = code.replace(
`    const livePrice = quote?.price ?? (quoteError ? null : getStockPrice(stock));`,
`    const livePrice = quote?.price ?? getStockPrice(stock);`
);

fs.writeFileSync('src/components/StockDetailModal.jsx', code);
