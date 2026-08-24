const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-IN");

export function formatCurrency(value) {
    const amount = Number(value);
    return currencyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

export function formatInrOrNA(value) {
    if (value === null || value === undefined || value === "") {
        return "N/A";
    }
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
        return "N/A";
    }
    return currencyFormatter.format(amount);
}

export function formatSignedPercent(value) {
    if (value === null || value === undefined || value === "") {
        return "N/A";
    }
    const number = Number(String(value).replace("%", ""));
    if (!Number.isFinite(number)) {
        return "N/A";
    }
    const sign = number > 0 ? "+" : "";
    return `${sign}${number.toFixed(2)}%`;
}

export function displayNA(value) {
    if (value === null || value === undefined || value === "" || value === "null") {
        return "N/A";
    }
    return value;
}

export function formatNumber(value) {
    const number = Number(value);
    return numberFormatter.format(Number.isFinite(number) ? number : 0);
}

export function formatDate(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

export function getInitials(name = "") {
    const initials = name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("");

    return initials.toUpperCase() || "SA";
}

export function getStockCompany(stock) {
    return stock?.companyName || stock?.companyname || "-";
}

export function getStockPrice(stock) {
    return stock?.currentPrice ?? stock?.currentprice ?? 0;
}

export function getToneFromValue(value) {
    const number = Number(value);

    if (number > 0) {
        return "positive";
    }

    if (number < 0) {
        return "negative";
    }

    return "neutral";
}

export function todayInputValue() {
    return new Date().toISOString().slice(0, 10);
}

export function getStockDailyChange(stock) {
    if (!stock || !stock.id) return { change: 0, percent: 0 };
    
    // Deterministic pseudo-random based on ID
    // Maps ID to a percentage between -5.00% and +5.00%
    const seed = (stock.id * 9301 + 49297) % 233280;
    const random = seed / 233280; // 0.0 to 1.0
    
    const percent = (random * 10) - 5; // -5.0 to +5.0
    const price = getStockPrice(stock);
    const change = price * (percent / 100);
    
    return { change, percent };
}
