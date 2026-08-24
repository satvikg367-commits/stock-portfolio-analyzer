const fs = require('fs');

let content = fs.readFileSync('src/pages/Holdings.jsx', 'utf-8');

// Add getStockPriceQuote import
content = content.replace(
    'import api, { getApiError } from "../services/api";',
    'import api, { getApiError } from "../services/api";\nimport { getStockPriceQuote } from "../services/marketApi";'
);

// Add quotes state
content = content.replace(
    'const [error, setError] = useState("");',
    'const [error, setError] = useState("");\n    const [quotesBySymbol, setQuotesBySymbol] = useState({});'
);

// Add useEffect to fetch quotes
const useEffectQuotes = `
    useEffect(() => {
        const symbols = portfolio.map((h) => h.symbol).filter(Boolean);
        if (!symbols.length) return;
        
        let ignore = false;
        Promise.all(symbols.map(async (symbol) => {
            const result = await getStockPriceQuote(symbol);
            return [symbol, result.ok ? result.data : null];
        })).then((entries) => {
            if (!ignore) {
                setQuotesBySymbol(Object.fromEntries(entries));
            }
        });
        return () => { ignore = true; };
    }, [portfolio]);
`;

content = content.replace(
    'return () => {\n            window.removeEventListener("storage", syncPrices);\n            window.removeEventListener("spa:prices", syncPrices);\n        };\n    }, []);',
    'return () => {\n            window.removeEventListener("storage", syncPrices);\n            window.removeEventListener("spa:prices", syncPrices);\n        };\n    }, []);\n' + useEffectQuotes
);

// Map portfolio with live quotes
const activePortfolioCode = `
    const activePortfolio = useMemo(() => {
        return portfolio.map((holding) => {
            const liveQuote = quotesBySymbol[holding.symbol];
            if (liveQuote && liveQuote.price) {
                const currentPrice = liveQuote.price;
                const currentValue = holding.quantity * currentPrice;
                const profitLoss = currentValue - holding.investedValue;
                return {
                    ...holding,
                    currentPrice,
                    currentValue,
                    profitLoss,
                    _isLive: true
                };
            }
            return holding;
        });
    }, [portfolio, quotesBySymbol]);
`;

content = content.replace(
    'const activeDashboard = selectedUserId ? dashboard : null;',
    'const activeDashboard = selectedUserId ? dashboard : null;\n' + activePortfolioCode
);

// Replace "portfolio" array mapping with "activePortfolio" in the render part
// e.g. "portfolio.reduce(" -> "activePortfolio.reduce("
content = content.replace(/portfolio\.reduce/g, 'activePortfolio.reduce');
content = content.replace(/\[\.\.\.portfolio\]/g, '[...activePortfolio]');
content = content.replace(/portfolio\.map/g, 'activePortfolio.map');
content = content.replace(/portfolio\.length/g, 'activePortfolio.length');
// BUT don't replace the one inside useEffectQuotes
content = content.replace('activePortfolio.map((h) => h.symbol)', 'portfolio.map((h) => h.symbol)');

// Update total metrics
content = content.replace(
    'const invested = Number(activeDashboard?.totalInvested) || 0;\n    const currentValue = Number(activeDashboard?.currentValue) || 0;\n    const profitLoss = Number(activeDashboard?.profitLoss) || 0;',
    'const invested = activePortfolio.reduce((acc, h) => acc + (Number(h.investedValue) || 0), 0);\n    const currentValue = activePortfolio.reduce((acc, h) => acc + (Number(h.currentValue) || 0), 0);\n    const profitLoss = currentValue - invested;'
);

fs.writeFileSync('src/pages/Holdings.jsx', content);
