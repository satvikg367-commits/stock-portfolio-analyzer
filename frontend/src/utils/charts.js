export const PRICE_HISTORY_STORAGE_KEY = "spa.stock.priceHistoryById";
export const TOAST_COOLDOWN_KEY = "spa.toast.cooldown";

export const CHART_COLORS = [
    "#2563eb",
    "#0ea5e9",
    "#22c55e",
    "#f59e0b",
    "#8b5cf6",
    "#14b8a6",
    "#ef4444",
    "#64748b",
];

export const FALLBACK_INDICES = [
    { id: "nifty", name: "NIFTY 50", currentPrice: 24780.45, previousClosePrice: 24690.1 },
    { id: "sensex", name: "SENSEX", currentPrice: 81245.3, previousClosePrice: 80980.2 },
    { id: "banknifty", name: "BANKNIFTY", currentPrice: 51240.8, previousClosePrice: 51410.15 },
    { id: "finnifty", name: "FINNIFTY", currentPrice: 23890.6, previousClosePrice: 23740.25 },
];

export const PERFORMANCE_PERIODS = ["1D", "1W", "1M", "3M", "6M", "1Y"];

export function seededUnit(seed) {
    const next = (Number(seed) * 9301 + 49297) % 233280;
    return next / 233280;
}

export function loadPriceHistory() {
    try {
        const parsed = JSON.parse(window.localStorage.getItem(PRICE_HISTORY_STORAGE_KEY) || "{}");
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

export function savePriceHistory(history) {
    window.localStorage.setItem(PRICE_HISTORY_STORAGE_KEY, JSON.stringify(history));
}

export function buildSparklinePath(points, width, height, padding = 2) {
    if (!points.length) {
        return "";
    }

    const minValue = Math.min(...points);
    const maxValue = Math.max(...points);
    const range = maxValue - minValue || 1;
    const step = (width - padding * 2) / Math.max(points.length - 1, 1);

    return points
        .map((point, index) => {
            const x = padding + index * step;
            const y = height - padding - ((point - minValue) / range) * (height - padding * 2);
            return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(" ");
}

export function generatePriceSeries(basePrice, seed, length = 16, volatility = 0.012) {
    const price = Number(basePrice) || 100;
    const series = [];
    let cursor = price * (0.97 + seededUnit(seed) * 0.04);

    for (let index = 0; index < length; index += 1) {
        const wave = Math.sin((index + seed) / 3.2) * volatility;
        const noise = (seededUnit(seed * 17 + index * 13) - 0.48) * volatility * 1.4;
        cursor = Math.max(price * 0.82, cursor * (1 + wave + noise));
        series.push(Number(cursor.toFixed(2)));
    }

    series[series.length - 1] = Number(price.toFixed(2));
    return series;
}

export function getStockSeries(stock, historyById = {}, length = 16) {
    const stockId = stock?.id ?? stock?.stockId;
    const existing = historyById[stockId];
    if (Array.isArray(existing) && existing.length >= 4) {
        return existing.slice(-length);
    }

    const price = stock?.currentPrice ?? stock?.currentprice ?? 0;
    return generatePriceSeries(price, stockId || 1, length);
}

export function getDayRange(stock, series) {
    const price = Number(stock?.currentPrice ?? stock?.currentprice ?? 0);
    const points = series?.length ? series : [price];
    return {
        high: Math.max(price, ...points),
        low: Math.min(price, ...points),
    };
}

export function getMockVolume(stock) {
    const seed = (stock?.id || 1) * 17;
    return Math.round((8 + seededUnit(seed) * 92) * 100000);
}

export function getMockMarketCap(stock) {
    const price = Number(stock?.currentPrice ?? stock?.currentprice ?? 0);
    const shares = 40 + seededUnit(stock?.id || 1) * 420;
    return price * shares * 10000000;
}

export function formatCompactNumber(value) {
    const number = Number(value) || 0;
    if (number >= 1e12) return `₹${(number / 1e12).toFixed(2)}T`;
    if (number >= 1e7) return `₹${(number / 1e7).toFixed(2)} Cr`;
    if (number >= 1e5) return `₹${(number / 1e5).toFixed(2)} L`;
    return `₹${number.toFixed(0)}`;
}

export function formatVolume(value) {
    const number = Number(value) || 0;
    if (number >= 1e7) return `${(number / 1e7).toFixed(2)} Cr`;
    if (number >= 1e5) return `${(number / 1e5).toFixed(2)} L`;
    if (number >= 1e3) return `${(number / 1e3).toFixed(1)}K`;
    return String(Math.round(number));
}

function formatAxisDate(date, period) {
    if (period === "1D") {
        return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(date);
    }

    if (period === "1W" || period === "1M") {
        return new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric" }).format(date);
    }

    return new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit" }).format(date);
}

export function buildPortfolioHistory({ currentValue, invested, period, apiPoints = [], seed = 7 }) {
    const value = Number(currentValue) || 0;
    const investedValue = Number(invested) || value * 0.92;
    const configs = {
        "1D": { points: 24, stepMs: 60 * 60 * 1000 },
        "1W": { points: 7, stepMs: 24 * 60 * 60 * 1000 },
        "1M": { points: 22, stepMs: 24 * 60 * 60 * 1000 },
        "3M": { points: 13, stepMs: 7 * 24 * 60 * 60 * 1000 },
        "6M": { points: 26, stepMs: 7 * 24 * 60 * 60 * 1000 },
        "1Y": { points: 12, stepMs: 30 * 24 * 60 * 60 * 1000 },
    };
    const config = configs[period] || configs["1M"];

    if (period === "6M" && apiPoints.length >= 4) {
        const lastApi = Number(apiPoints[apiPoints.length - 1]?.value) || value || 1;
        return apiPoints.map((point, index) => {
            const ratio = index / Math.max(apiPoints.length - 1, 1);
            const rawDate = point.date || point.label;
            const date = rawDate ? new Date(rawDate) : new Date();
            return {
                label: point.label || formatAxisDate(date, period),
                value: Number(point.value) || value * (0.8 + ratio * 0.2),
                invested: Number(point.invested) || investedValue * (0.78 + ratio * 0.22),
            };
        }).concat(lastApi === value ? [] : [{
            label: "Now",
            value,
            invested: investedValue,
        }]);
    }

    const now = Date.now();
    const series = [];
    let cursor = value * (0.86 + seededUnit(seed) * 0.08);

    for (let index = 0; index < config.points; index += 1) {
        const progress = index / Math.max(config.points - 1, 1);
        const drift = (value - cursor) * 0.08;
        const noise = (seededUnit(seed * 11 + index * 19) - 0.5) * value * 0.012;
        cursor = Math.max(value * 0.7, cursor + drift + noise);
        const date = new Date(now - (config.points - 1 - index) * config.stepMs);
        series.push({
            label: formatAxisDate(date, period),
            value: index === config.points - 1 ? value : Number(cursor.toFixed(2)),
            invested: Number((investedValue * (0.76 + progress * 0.24)).toFixed(2)),
        });
    }

    return series;
}

export function buildDailyPnL(portfolio = [], days = 14) {
    const totalValue = portfolio.reduce((sum, holding) => sum + Number(holding.currentValue || 0), 0);
    const now = Date.now();

    return Array.from({ length: days }, (_, index) => {
        const date = new Date(now - (days - 1 - index) * 24 * 60 * 60 * 1000);
        const wave = Math.sin((index + 2) / 2.4) * 0.006;
        const noise = (seededUnit(index * 29 + days) - 0.5) * 0.008;
        const pnl = totalValue * (wave + noise);

        return {
            label: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date),
            pnl: Number(pnl.toFixed(2)),
        };
    });
}

export function shouldFireToast(key, cooldownMs = 90000) {
    try {
        const parsed = JSON.parse(window.sessionStorage.getItem(TOAST_COOLDOWN_KEY) || "{}");
        const lastFired = Number(parsed[key] || 0);
        if (Date.now() - lastFired < cooldownMs) {
            return false;
        }
        parsed[key] = Date.now();
        window.sessionStorage.setItem(TOAST_COOLDOWN_KEY, JSON.stringify(parsed));
        return true;
    } catch {
        return true;
    }
}

export function mapIndex(idx) {
    const price = Number(idx.currentPrice ?? idx.price ?? 0);
    const previous = Number(idx.previousClosePrice ?? idx.previousClose ?? price);
    const change = price - previous;
    const percent = previous ? (change / previous) * 100 : 0;

    return {
        id: idx.id ?? idx.name,
        name: idx.name,
        price,
        change,
        percent,
    };
}
