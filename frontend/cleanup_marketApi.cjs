const fs = require('fs');

let content = fs.readFileSync('src/services/marketApi.js', 'utf-8');

const functionsToRemove = [
    'getStockDetails',
    'getHistoricalData',
    'getTrendingStocks',
    'getNews',
    'getIpoData',
    'getPriceShockers',
    'getBseMostActive',
    'getNseMostActive',
    'get52WeekHighLow',
    'getIndustryStocks',
    'getCorporateActions',
    'getMutualFunds',
    'getMutualFundSearch',
    'getMutualFundDetails',
    'getTargetPrice',
    'getAnnouncements',
    'getCommodities',
    'getStatement',
    'getHistoricalStats',
    'getForecasts',
    'pick',
    'asList',
    'flattenMutualFunds',
    'parseHistoricalSeries',
    'quoteFields'
];

functionsToRemove.forEach(funcName => {
    const regex = new RegExp(`export function ${funcName}\\([\\s\\S]*?\\}\\n\\n?`, 'g');
    content = content.replace(regex, '');
});

fs.writeFileSync('src/services/marketApi.js', content);
