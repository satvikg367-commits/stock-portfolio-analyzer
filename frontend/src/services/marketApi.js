import api from "./api";

async function marketGet(path, params) {
    try {
        const response = await api.get(path, { params, silent: true });
        return { ok: true, data: response.data, unavailable: false, message: "" };
    } catch (error) {
        const status = error?.response?.status;
        const body = error?.response?.data;
        const unavailable =
            Boolean(body?.unavailable) || status === 401 || status === 403 || status === 429;
        let message = "Unable to fetch market data.";
        if (typeof body?.error === "string" && body.error) {
            message = body.error;
        } else if (status === 404) {
            message = "Stock not found.";
        } else if (unavailable) {
            message = "Currently unavailable";
        } else if (error.code === "ERR_NETWORK") {
            message = "Unable to fetch market data.";
        }
        return { ok: false, data: null, unavailable, message, status };
    }
}

export function getStockPriceQuote(stockName) {
    return marketGet(`/market/price/${stockName}`);
}
