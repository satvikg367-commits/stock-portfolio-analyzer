import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import DataTable from "../components/DataTable";
import AlertModal from "../components/AlertModal";
import Sparkline from "../components/Sparkline";
import api, { getApiError } from "../services/api";
import { getDayRange, getStockSeries, loadPriceHistory, savePriceHistory } from "../utils/charts";
import {
    formatCurrency,
    formatInrOrNA,
    formatSignedPercent,
    getStockCompany,
    getStockDailyChange,
    getStockPrice,
} from "../utils/format";
import { useAuth } from "../context/AuthContext";
import { getStockPriceQuote } from "../services/marketApi";

function formatAlertCondition(alert) {
    const condition = String(alert.condition || "ABOVE").toUpperCase();
    if (condition === "BELOW") return "Price Below";
    if (condition === "PERCENT") return "Percentage Movement";
    return "Price Above";
}

function formatAlertTarget(alert) {
    const condition = String(alert.condition || "ABOVE").toUpperCase();
    if (condition === "PERCENT") {
        return `±${Number(alert.targetPrice).toFixed(2)}%`;
    }
    return formatCurrency(alert.targetPrice);
}

function getAlertStatus(alert, stock) {
    if (!alert.active) return { label: "Disabled", tone: "neutral" };
    const price = Number(getStockPrice(stock));
    const target = Number(alert.targetPrice);
    const condition = String(alert.condition || "ABOVE").toUpperCase();
    const daily = getStockDailyChange(stock);

    if (condition === "ABOVE" && price >= target) return { label: "Triggered", tone: "warning" };
    if (condition === "BELOW" && price <= target) return { label: "Triggered", tone: "warning" };
    if (condition === "PERCENT" && Math.abs(daily.percent) >= target) return { label: "Triggered", tone: "warning" };
    return { label: "Active", tone: "success" };
}

function Stocks() {
    const { user } = useAuth();
    const [stocks, setStocks] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [selectedAlertStock, setSelectedAlertStock] = useState(null);
    const [priceHistoryById, setPriceHistoryById] = useState(() => loadPriceHistory());
    const [searchText, setSearchText] = useState("");
    const [selectedSector, setSelectedSector] = useState("ALL");
    const [sortBy, setSortBy] = useState("symbol-asc");
    const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
    const [isLiveMode, setIsLiveMode] = useState(true);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [quotesBySymbol, setQuotesBySymbol] = useState({});

    const loadStocks = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const response = await api.get("/stocks");
            const nextStocks = response.data || [];
            setStocks(nextStocks);
            setPriceHistoryById((currentHistoryById) => {
                const nextHistoryById = { ...currentHistoryById };
                nextStocks.forEach((stock) => {
                    const nextPrice = Number(getStockPrice(stock));
                    const existingSeries = Array.isArray(currentHistoryById[stock.id])
                        ? currentHistoryById[stock.id]
                        : [];
                    nextHistoryById[stock.id] = [...existingSeries, nextPrice]
                        .filter((value) => Number.isFinite(value))
                        .slice(-24);
                });
                savePriceHistory(nextHistoryById);
                return nextHistoryById;
            });
            setLastUpdatedAt(new Date());
        } catch (loadError) {
            setError(getApiError(loadError, "Unable to load stocks"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.id) {
            api.get(`/watchlist/user/${user.id}`).then((res) => setWatchlist(res.data || [])).catch(console.error);
            api.get(`/alerts/user/${user.id}`).then((res) => setAlerts(res.data || [])).catch(console.error);
        }
    }, [user?.id]);

    useEffect(() => {
        loadStocks();
    }, [loadStocks]);

    const watchlistIds = useMemo(() => watchlist.map((w) => w.stock?.id), [watchlist]);

    useEffect(() => {
        const symbols = [...new Set(watchlist.map((item) => item.stock?.symbol).filter(Boolean))].slice(0, 8);
        if (!symbols.length) {
            return;
        }
        let ignore = false;
        Promise.all(symbols.map(async (symbol) => {
            const result = await getStockPriceQuote(symbol);
            return [symbol, result.ok ? result.data : null];
        })).then((entries) => {
            if (!ignore) {
                setQuotesBySymbol(Object.fromEntries(entries));
            }
        });
        return () => {
            ignore = true;
        };
    }, [watchlist]);

    useEffect(() => {
        if (!isLiveMode) {
            return;
        }
        const timer = window.setInterval(() => {
            loadStocks();
        }, 15000);
        return () => window.clearInterval(timer);
    }, [isLiveMode, loadStocks]);

    async function toggleWatchlist(stockId) {
        if (!user?.id) return;
        const existing = watchlist.find((w) => w.stock?.id === stockId);

        try {
            if (existing) {
                await api.delete(`/watchlist/${existing.id}`);
                setWatchlist((prev) => prev.filter((w) => w.id !== existing.id));
            } else {
                const res = await api.post("/watchlist", { userId: user.id, stockId });
                setWatchlist((prev) => [...prev, res.data]);
            }
        } catch {
            toast.error("Failed to update watchlist");
        }
    }

    function configureAlertRule(stock) {
        setSelectedAlertStock(stock);
    }

    async function handleDelete(stockId) {
        setError("");
        const currentStock = stocks.find((stock) => stock.id === stockId);
        const shouldDelete = window.confirm(
            `Delete ${currentStock?.symbol || "this stock"}? This action cannot be undone.`
        );
        if (!shouldDelete) {
            return;
        }
        try {
            await api.delete(`/stocks/${stockId}`, { silent: true });
            setStocks((currentStocks) => currentStocks.filter((stock) => stock.id !== stockId));
        } catch (deleteError) {
            if (deleteError?.response?.status === 409) {
                setError(`Cannot delete ${currentStock?.symbol || "this stock"} because existing transactions reference this stock.`);
            } else {
                console.error("Deletion failure:", deleteError);
                setError("Failed to delete stock. Please try again later.");
            }
        }
    }

    async function disableAlert(alert) {
        try {
            await api.put(`/alerts/${alert.id}/deactivate`);
            setAlerts((prev) => prev.map((item) => (item.id === alert.id ? { ...item, active: false } : item)));
        } catch {
            toast.error("Unable to disable alert");
        }
    }

    async function deleteAlert(alert) {
        try {
            await api.delete(`/alerts/${alert.id}`);
            setAlerts((prev) => prev.filter((item) => item.id !== alert.id));
        } catch {
            toast.error("Unable to delete alert");
        }
    }

    const sectors = useMemo(() => {
        const uniqueSectors = new Set(stocks.map((stock) => stock.sector).filter(Boolean));
        return ["ALL", ...Array.from(uniqueSectors).sort((a, b) => a.localeCompare(b))];
    }, [stocks]);

    const visibleStocks = useMemo(() => {
        const normalizedQuery = searchText.trim().toLowerCase();
        const filteredStocks = stocks.filter((stock) => {
            const matchesQuery = !normalizedQuery
                || [stock.symbol, getStockCompany(stock), stock.sector, String(stock.id)]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(normalizedQuery));
            const matchesSector = selectedSector === "ALL" || stock.sector === selectedSector;
            const matchesWatchlist = !showWatchlistOnly || watchlistIds.includes(stock.id);
            return matchesQuery && matchesSector && matchesWatchlist;
        });

        return [...filteredStocks].sort((a, b) => {
            if (sortBy === "price-desc") return Number(getStockPrice(b)) - Number(getStockPrice(a));
            if (sortBy === "price-asc") return Number(getStockPrice(a)) - Number(getStockPrice(b));
            if (sortBy === "symbol-desc") return String(b.symbol || "").localeCompare(String(a.symbol || ""));
            return String(a.symbol || "").localeCompare(String(b.symbol || ""));
        });
    }, [searchText, selectedSector, showWatchlistOnly, sortBy, stocks, watchlistIds]);

    const formattedLastUpdated = useMemo(() => {
        if (!lastUpdatedAt) return "-";
        return new Intl.DateTimeFormat("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(lastUpdatedAt);
    }, [lastUpdatedAt]);

    const watchlistColumns = [
        {
            key: "symbol",
            header: "Symbol",
            render: (stock) => (
                <span className="ticker-cell">
                    <strong>{stock.symbol}</strong>
                    <span>{stock.sector}</span>
                </span>
            ),
        },
        {
            key: "company",
            header: "Company",
            render: (stock) => getStockCompany(stock),
        },
        {
            key: "price",
            header: "Current Price",
            align: "right",
            render: (stock) => {
                const quote = quotesBySymbol[stock.symbol];
                return formatInrOrNA(quote?.price ?? getStockPrice(stock));
            },
        },
        {
            key: "change",
            header: "1D Change",
            align: "right",
            render: (stock) => {
                const quote = quotesBySymbol[stock.symbol];
                const percent = quote ? quote.percentChange : getStockDailyChange(stock).percent;
                return (
                    <span className={`price-delta ${Number(percent) >= 0 ? "up" : "down"}`}>
                        {formatSignedPercent(percent)}
                    </span>
                );
            },
        },
        {
            key: "spark",
            header: "Trend",
            render: (stock) => (
                <Sparkline
                    points={getStockSeries(stock, priceHistoryById, 14)}
                    positive={getStockDailyChange(stock).percent >= 0}
                />
            ),
        },
        {
            key: "range",
            header: "Day Range",
            render: (stock) => {
                const quote = quotesBySymbol[stock.symbol];
                if (quote) {
                    return (
                        <span className="range-cell">
                            52W H: {formatInrOrNA(quote.yearHigh)}
                            <small>52W L: {formatInrOrNA(quote.yearLow)}</small>
                        </span>
                    );
                }
                const range = getDayRange(stock, getStockSeries(stock, priceHistoryById, 14));
                return (
                    <span className="range-cell">
                        H: {formatCurrency(range.high)}
                        <small>L: {formatCurrency(range.low)}</small>
                    </span>
                );
            },
        },
        {
            key: "alert",
            header: "Alert",
            render: (stock) => {
                const activeAlert = alerts.find((a) => a.stock?.id === stock.id && a.active);
                return (
                    <button
                        aria-label={`Set alert for ${stock.symbol}`}
                        className={`alert-tag-button ${activeAlert ? "active" : ""}`}
                        onClick={() => configureAlertRule(stock)}
                        type="button"
                    >
                        <span className="material-symbols-outlined">
                            {activeAlert ? "notifications_active" : "notifications"}
                        </span>
                        <span>{activeAlert ? "Alert" : "Set Alert"}</span>
                    </button>
                );
            },
        },
    ];

    const masterColumns = [
        {
            key: "watch",
            header: "Watch",
            render: (stock) => {
                const isWatched = watchlistIds.includes(stock.id);
                return (
                    <button
                        aria-label={`${isWatched ? "Remove" : "Add"} ${stock.symbol} ${isWatched ? "from" : "to"} watchlist`}
                        className={`icon-button watch-toggle ${isWatched ? "active" : ""}`}
                        onClick={() => toggleWatchlist(stock.id)}
                        type="button"
                    >
                        <span className="material-symbols-outlined">{isWatched ? "star" : "star_outline"}</span>
                    </button>
                );
            },
        },
        {
            key: "symbol",
            header: "Symbol",
            render: (stock) => (
                <span className="ticker-cell">
                    <strong>{stock.symbol}</strong>
                    <span>{getStockCompany(stock)}</span>
                </span>
            ),
        },
        {
            key: "sector",
            header: "Sector",
            render: (stock) => <span className="badge badge-neutral">{stock.sector}</span>,
        },
        {
            key: "currentprice",
            header: "Price / 1D",
            align: "right",
            render: (stock) => {
                const daily = getStockDailyChange(stock);
                return (
                    <div className="price-cell">
                        <strong>{formatCurrency(getStockPrice(stock))}</strong>
                        <span className={`price-delta ${daily.percent >= 0 ? "up" : "down"}`}>
                            {daily.percent >= 0 ? "+" : ""}
                            {daily.percent.toFixed(2)}%
                        </span>
                    </div>
                );
            },
        },
        {
            key: "spark",
            header: "Trend",
            render: (stock) => (
                <Sparkline
                    points={getStockSeries(stock, priceHistoryById, 14)}
                    positive={getStockDailyChange(stock).percent >= 0}
                />
            ),
        },
        {
            key: "alert",
            header: "Alert",
            render: (stock) => {
                const activeAlert = alerts.find((a) => a.stock?.id === stock.id && a.active);
                return (
                    <button
                        className={`alert-tag-button ${activeAlert ? "active" : ""}`}
                        onClick={() => configureAlertRule(stock)}
                        type="button"
                    >
                        <span className="material-symbols-outlined">
                            {activeAlert ? "notifications_active" : "notifications"}
                        </span>
                        <span>{activeAlert ? "Alert" : "Set Alert"}</span>
                    </button>
                );
            },
        },
        {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (stock) => (
                <div className="row-actions">
                    <button
                        aria-label={`Delete ${stock.symbol}`}
                        className="icon-button danger"
                        onClick={() => handleDelete(stock.id)}
                        type="button"
                    >
                        <span className="material-symbols-outlined">delete</span>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="page-stack">
            <div className="page-header page-header-row">
                <div>
                    <span className="eyebrow">Portfolio Management</span>
                    <h1>Stocks</h1>
                </div>
                <Link className="btn btn-primary" to="/stocks/add">
                    <span className="material-symbols-outlined">add</span>
                    Add Stock
                </Link>
            </div>

            {error ? <div className="alert alert-error">{error}</div> : null}

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <span className="eyebrow">Alerts</span>
                        <h2>Active Price Alerts</h2>
                        <span className="panel-meta">{alerts.filter((a) => a.active).length} watching the tape</span>
                    </div>
                </div>
                {alerts.length ? (
                    <div className="table-wrap">
                        <table className="data-table dense-table">
                            <thead>
                                <tr>
                                    <th>Stock</th>
                                    <th>Condition</th>
                                    <th className="align-right">Target</th>
                                    <th className="align-right">Current</th>
                                    <th>Status</th>
                                    <th className="align-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.map((alert) => {
                                    const stock = stocks.find((item) => item.id === alert.stock?.id) || alert.stock;
                                    const status = getAlertStatus(alert, stock);
                                    return (
                                        <tr key={alert.id}>
                                            <td>
                                                <span className="ticker-cell">
                                                    <strong>{stock?.symbol || "—"}</strong>
                                                    <span>{getStockCompany(stock)}</span>
                                                </span>
                                            </td>
                                            <td>{formatAlertCondition(alert)}</td>
                                            <td className="align-right">{formatAlertTarget(alert)}</td>
                                            <td className="align-right">{formatCurrency(getStockPrice(stock))}</td>
                                            <td>
                                                <span className={`badge ${status.tone === "success" ? "badge-success" : status.tone === "warning" ? "badge-warning" : "badge-neutral"}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="align-right">
                                                <div className="row-actions">
                                                    {alert.active ? (
                                                        <button className="btn btn-secondary btn-tiny" onClick={() => disableAlert(alert)} type="button">
                                                            Disable
                                                        </button>
                                                    ) : null}
                                                    <button className="icon-button danger" onClick={() => deleteAlert(alert)} type="button">
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="table-state">No price alerts yet. Set one from the watchlist.</div>
                )}
            </section>

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <span className="eyebrow">Securities</span>
                        <h2>{showWatchlistOnly ? "Watchlist" : "Stock Master"}</h2>
                    </div>
                    <div className="panel-controls">
                        <div className="panel-chip-group">
                            <button
                                className={`chip ${showWatchlistOnly ? "" : "active"}`}
                                onClick={() => setShowWatchlistOnly(false)}
                                type="button"
                            >
                                All Stocks
                            </button>
                            <button
                                className={`chip ${showWatchlistOnly ? "active" : ""}`}
                                onClick={() => setShowWatchlistOnly(true)}
                                type="button"
                            >
                                Watchlist
                            </button>
                        </div>
                        <label className="field compact-field">
                            <span>Search</span>
                            <div className="input-shell compact-shell">
                                <span className="material-symbols-outlined">search</span>
                                <input
                                    onChange={(event) => setSearchText(event.target.value)}
                                    placeholder="Symbol, company or ID"
                                    type="text"
                                    value={searchText}
                                />
                            </div>
                        </label>
                        <label className="field compact-field">
                            <span>Sector</span>
                            <select onChange={(event) => setSelectedSector(event.target.value)} value={selectedSector}>
                                {sectors.map((sector) => (
                                    <option key={sector} value={sector}>
                                        {sector === "ALL" ? "All Sectors" : sector}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="field compact-field">
                            <span>Sort</span>
                            <select onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
                                <option value="symbol-asc">Symbol A-Z</option>
                                <option value="symbol-desc">Symbol Z-A</option>
                                <option value="price-desc">Price High-Low</option>
                                <option value="price-asc">Price Low-High</option>
                            </select>
                        </label>
                        <button className="btn btn-secondary" onClick={loadStocks} type="button">
                            <span className="material-symbols-outlined">refresh</span>
                            Refresh
                        </button>
                        <button
                            className={`btn btn-secondary ${isLiveMode ? "btn-live-active" : ""}`}
                            onClick={() => setIsLiveMode((current) => !current)}
                            type="button"
                        >
                            <span className="material-symbols-outlined">
                                {isLiveMode ? "sensors" : "sensors_off"}
                            </span>
                            {isLiveMode ? "Live On" : "Live Off"}
                        </button>
                    </div>
                </div>
                <DataTable
                    columns={showWatchlistOnly ? watchlistColumns : masterColumns}
                    data={visibleStocks}
                    emptyMessage={showWatchlistOnly ? "No watchlist stocks yet." : "No stocks available."}
                    isLoading={isLoading}
                />
                <div className="panel-footer">
                    Showing {visibleStocks.length} of {stocks.length} stocks | Watchlist: {watchlistIds.length} | Last update: {formattedLastUpdated}
                </div>
            </section>

            {selectedAlertStock && (
                <AlertModal
                    existingAlert={alerts.find((a) => a.stock?.id === selectedAlertStock.id && a.active)}
                    onAlertDeleted={(deletedId) => setAlerts((prev) => prev.filter((a) => a.id !== deletedId))}
                    onAlertSaved={(newAlert) => setAlerts((prev) => [...prev.filter((a) => a.stock?.id !== newAlert.stock?.id), newAlert])}
                    onClose={() => setSelectedAlertStock(null)}
                    stock={selectedAlertStock}
                />
            )}
        </div>
    );
}

export default Stocks;
