import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import DataTable from "../components/DataTable";

import Sparkline from "../components/Sparkline";
import StatCard from "../components/StatCard";
import StockDetailModal from "../components/StockDetailModal";
import { useAuth } from "../context/AuthContext";
import api, { getApiError } from "../services/api";
import { getStockPriceQuote } from "../services/marketApi";
import {
    CHART_COLORS,
    FALLBACK_INDICES,
    PERFORMANCE_PERIODS,
    buildDailyPnL,
    buildPortfolioHistory,
    getStockSeries,
    loadPriceHistory,
    mapIndex,
} from "../utils/charts";
import {
    formatCurrency,
    formatDate,
    formatInrOrNA,
    formatNumber,
    formatSignedPercent,
    getInitials,
    getStockCompany,
    getStockDailyChange,
    getStockPrice,
    getToneFromValue,
} from "../utils/format";

function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [users, setUsers] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [watchlistIds, setWatchlistIds] = useState([]);
    const [profitLossData, setProfitLossData] = useState([]);
    const [indices, setIndices] = useState([]);
    const [priceHistoryById, setPriceHistoryById] = useState(() => loadPriceHistory());
    const [selectedUserId, setSelectedUserId] = useState("");
    const [holdingFilter, setHoldingFilter] = useState("ALL");
    const [period, setPeriod] = useState("1M");
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchText, setSearchText] = useState("");
    const [searchError, setSearchError] = useState("");
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [quotesBySymbol, setQuotesBySymbol] = useState({});

    const loadOverview = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const [usersResponse, stocksResponse, transactionsResponse, indicesResponse] =
                await Promise.all([
                    api.get("/users"),
                    api.get("/stocks"),
                    api.get("/transactions"),
                    api.get("/indices").catch(() => ({ data: [] })),
                ]);

            setUsers(usersResponse.data || []);
            setStocks(stocksResponse.data || []);
            setTransactions(transactionsResponse.data || []);
            setIndices(indicesResponse.data || []);
            setLastUpdatedAt(new Date());
        } catch (loadError) {
            setError(getApiError(loadError, "Unable to load dashboard data"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOverview();
    }, [loadOverview]);

    const { user: authUser } = useAuth();

    useEffect(() => {
        if (authUser?.id) {
            setSelectedUserId(authUser.id);
        }
    }, [authUser]);

    useEffect(() => {
        function syncPrices() {
            setPriceHistoryById(loadPriceHistory());
        }

        window.addEventListener("storage", syncPrices);
        window.addEventListener("spa:prices", syncPrices);
        return () => {
            window.removeEventListener("storage", syncPrices);
            window.removeEventListener("spa:prices", syncPrices);
        };
    }, []);

    useEffect(() => {
        if (!selectedUserId) {
            return;
        }

        let ignore = false;

        async function loadUserPortfolio() {
            setIsPortfolioLoading(true);
            setError("");

            try {
                const [dashboardResponse, portfolioResponse, watchlistResponse, performanceResponse] = await Promise.all([
                    api.get(`/dashboard/user/${selectedUserId}`),
                    api.get(`/portfolio/user/${selectedUserId}`),
                    api.get(`/watchlist/user/${selectedUserId}`),
                    api.get(`/portfolio/user/${selectedUserId}/performance`),
                ]);

                if (!ignore) {
                    setDashboard(dashboardResponse.data);
                    setPortfolio(portfolioResponse.data || []);
                    setWatchlistIds(watchlistResponse.data?.map((w) => w.stock?.id).filter(Boolean) || []);
                    setProfitLossData(performanceResponse.data || []);
                }
            } catch (loadError) {
                if (!ignore) {
                    setError(getApiError(loadError, "Unable to load portfolio metrics"));
                    setDashboard(null);
                    setPortfolio([]);
                }
            } finally {
                if (!ignore) {
                    setIsPortfolioLoading(false);
                }
            }
        }

        loadUserPortfolio();
        return () => {
            ignore = true;
        };
    }, [selectedUserId]);

    useEffect(() => {
        const watchlistSymbols = stocks
            .filter((stock) => watchlistIds.includes(stock.id))
            .map((stock) => stock.symbol);
        const portfolioSymbols = portfolio.map((h) => h.symbol);
        const symbols = [...new Set([...watchlistSymbols, ...portfolioSymbols])]
            .filter(Boolean)
            .slice(0, 20); // avoid too many requests
            
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
    }, [stocks, watchlistIds, portfolio]);

    const selectedUser = users.find((user) => user.id === Number(selectedUserId));
    const activeDashboard = selectedUserId ? dashboard : null;
    const activePortfolio = useMemo(() => {
        if (!selectedUserId) {
            return [];
        }

        return portfolio.map((holding) => {
            const liveQuote = quotesBySymbol[holding.symbol];
            if (liveQuote && liveQuote.price) {
                const livePrice = liveQuote.price;
                const newCurrentValue = holding.quantity * livePrice;
                const newProfitLoss = newCurrentValue - holding.investedValue;
                return {
                    ...holding,
                    currentPrice: livePrice,
                    currentValue: newCurrentValue,
                    profitLoss: newProfitLoss,
                    _isLive: true
                };
            }
            return holding;
        }).filter((holding) => {
            if (holdingFilter === "PROFIT") {
                return Number(holding.profitLoss) > 0;
            }
            if (holdingFilter === "LOSS") {
                return Number(holding.profitLoss) < 0;
            }
            return true;
        });
    }, [holdingFilter, portfolio, selectedUserId, quotesBySymbol]);

    const invested = useMemo(() => {
        return portfolio.reduce((acc, holding) => acc + (Number(holding.investedValue) || 0), 0);
    }, [portfolio]);

    const currentValue = useMemo(() => {
        // use activePortfolio before filter is applied? No, we should use the mapped portfolio without filters to get total.
        // Or we can just calculate it directly.
        return portfolio.reduce((acc, holding) => {
            const liveQuote = quotesBySymbol[holding.symbol];
            const price = (liveQuote && liveQuote.price) ? liveQuote.price : holding.currentPrice;
            return acc + (holding.quantity * price);
        }, 0);
    }, [portfolio, quotesBySymbol]);

    const profitLoss = currentValue - invested;
    const returnPct = invested ? (profitLoss / invested) * 100 : 0;

    const todayPnL = useMemo(() => {
        return portfolio.reduce((sum, holding) => {
            const stock = stocks.find((item) => item.id === holding.stockId) || holding;
            const { change } = getStockDailyChange(stock);
            return sum + change * Number(holding.quantity || 0);
        }, 0);
    }, [portfolio, stocks]);

    const performanceSeries = useMemo(
        () => buildPortfolioHistory({
            currentValue,
            invested,
            period,
            apiPoints: profitLossData,
            seed: Number(selectedUserId) || 7,
        }),
        [currentValue, invested, period, profitLossData, selectedUserId]
    );

    const dailyPnLSeries = useMemo(() => buildDailyPnL(portfolio, 10), [portfolio]);

    const stockAllocation = useMemo(() => {
        const total = portfolio.reduce((acc, holding) => acc + Number(holding.currentValue || 0), 0);
        if (!total) return [];

        return [...portfolio]
            .map((holding) => ({
                symbol: holding.symbol,
                value: Number(holding.currentValue) || 0,
                percent: ((Number(holding.currentValue) || 0) / total) * 100,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [portfolio]);

    const topPerformers = useMemo(() => {
        return [...portfolio]
            .sort((a, b) => Number(b.profitLoss) - Number(a.profitLoss))
            .slice(0, 5)
            .map((holding) => {
                const stock = stocks.find((item) => item.id === holding.stockId) || holding;
                const daily = getStockDailyChange(stock);
                return {
                    ...holding,
                    daily,
                    series: getStockSeries(holding, priceHistoryById, 14),
                };
            });
    }, [portfolio, priceHistoryById, stocks]);

    const marketOverview = useMemo(() => {
        const source = indices.length ? indices : FALLBACK_INDICES;
        const wanted = ["NIFTY 50", "SENSEX", "BANKNIFTY", "FINNIFTY"];
        const mapped = source.map(mapIndex);
        const normalize = (value) => String(value).toUpperCase().replace(/[\s-]/g, "");
        return wanted.map((name) => {
            const match = mapped.find((item) => {
                const left = normalize(item.name);
                const right = normalize(name);
                return left.includes(right) || right.includes(left);
            });
            return match || mapIndex(FALLBACK_INDICES.find((item) => item.name === name));
        });
    }, [indices]);

    const userTransactions = transactions
        .filter((transaction) => transaction.user?.id === Number(selectedUserId))
        .slice(0, 5);
    const watchlistStocks = useMemo(
        () => stocks.filter((stock) => watchlistIds.includes(stock.id)).slice(0, 6),
        [stocks, watchlistIds]
    );
    const displayedWatchStocks = watchlistStocks.length ? watchlistStocks : stocks.slice(0, 6);
    const watchlistCaption = watchlistStocks.length
        ? `${watchlistStocks.length} saved`
        : "Showing top stocks";
    const formattedLastUpdated = useMemo(() => {
        if (!lastUpdatedAt) {
            return "-";
        }
        return new Intl.DateTimeFormat("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(lastUpdatedAt);
    }, [lastUpdatedAt]);

    const tooltipStyle = {
        backgroundColor: "var(--surface)",
        borderRadius: "8px",
        border: "1px solid var(--line)",
        color: "var(--ink)",
        fontSize: 12,
    };

    const transactionColumns = [
        {
            key: "id",
            header: "ID",
            render: (transaction) => `#${transaction.id}`,
        },
        {
            key: "user",
            header: "User",
            render: (transaction) => (
                <span className="identity-cell">
                    <span className="avatar avatar-sm">{getInitials(transaction.user?.name)}</span>
                    {transaction.user?.name || "-"}
                </span>
            ),
        },
        {
            key: "stock",
            header: "Stock",
            render: (transaction) => transaction.stock?.symbol || "-",
        },
        {
            key: "quantity",
            header: "Qty",
            align: "right",
            render: (transaction) => formatNumber(transaction.quantity),
        },
        {
            key: "price",
            header: "Transaction Price",
            align: "right",
            render: (transaction) => formatCurrency(transaction.price),
        },
        {
            key: "transactionType",
            header: "Type",
            render: (transaction) => (
                <span className={`badge ${transaction.transactionType === "SELL" ? "badge-danger" : "badge-success"}`}>
                    {transaction.transactionType}
                </span>
            ),
        },
        {
            key: "transactionDate",
            header: "Date",
            align: "right",
            render: (transaction) => formatDate(transaction.transactionDate),
        },
    ];

    const portfolioColumns = [
        {
            key: "symbol",
            header: "Symbol",
            render: (holding) => (
                <span className="ticker-cell">
                    <strong>{holding.symbol}</strong>
                    <span>{holding.companyName}</span>
                </span>
            ),
        },
        {
            key: "quantity",
            header: "Qty",
            align: "right",
            render: (holding) => formatNumber(holding.quantity),
        },
        {
            key: "currentPrice",
            header: "Current",
            align: "right",
            render: (holding) => formatCurrency(holding.currentPrice),
        },
        {
            key: "profitLoss",
            header: "P/L",
            align: "right",
            render: (holding) => (
                <span className={`money-${getToneFromValue(holding.profitLoss)}`}>
                    {formatCurrency(holding.profitLoss)}
                </span>
            ),
        },
    ];

    return (
        <div className="page-stack">
            <div className="page-header page-header-row">
                <div>
                    <span className="eyebrow">Equity Research Desk</span>
                    <h1>Dashboard</h1>
                    <p className="muted page-subtitle">
                        {selectedUser?.name ? `${selectedUser.name}'s live portfolio snapshot` : "Portfolio overview"}
                    </p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        disabled={isLoading || isPortfolioLoading}
                        onClick={loadOverview}
                        type="button"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                        Refresh
                    </button>
                    <Link className="btn btn-primary" to="/transactions/add">
                        <span className="material-symbols-outlined">add</span>
                        Transaction
                    </Link>
                    <form
                        className="panel-controls"
                        onSubmit={async (event) => {
                            event.preventDefault();
                            const name = searchText.trim();
                            if (!name) return;
                            setSearchError("");
                            const result = await getStockPriceQuote(name);
                            if (!result.ok) {
                                setSearchError(result.message || "Stock not found.");
                                return;
                            }
                            setSelectedQuote({
                                symbol: result.data.symbol,
                                companyName: result.data.companyName,
                                currentPrice: result.data.price,
                                query: name,
                            });
                        }}
                    >
                        <label className="field compact-field">
                            <span>Search stock</span>
                            <div className="input-shell compact-shell">
                                <span className="material-symbols-outlined">search</span>
                                <input
                                    onChange={(event) => setSearchText(event.target.value)}
                                    placeholder="TCS, Tata Steel"
                                    value={searchText}
                                />
                            </div>
                        </label>
                    </form>
                </div>
            </div>

            {error ? <div className="alert alert-error">{error}</div> : null}
            {searchError ? <div className="alert alert-error">{searchError}</div> : null}

            <section className="stats-grid kpi-grid">
                <StatCard
                    hint={selectedUser?.name || "Select a user"}
                    icon="account_balance_wallet"
                    label="Total Invested"
                    trend={{ label: `${formatNumber(activePortfolio.length)} lots`, tone: "neutral" }}
                    value={formatCurrency(invested)}
                />
                <StatCard
                    hint="Marked to market"
                    icon="insights"
                    label="Current Value"
                    trend={{
                        label: `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}% vs cost`,
                        tone: getToneFromValue(profitLoss),
                    }}
                    value={formatCurrency(currentValue)}
                />
                <StatCard
                    hint="Unrealized"
                    icon={profitLoss >= 0 ? "trending_up" : "trending_down"}
                    label="Profit / Loss"
                    tone={getToneFromValue(profitLoss)}
                    trend={{
                        label: `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}%`,
                        tone: getToneFromValue(profitLoss),
                    }}
                    value={formatCurrency(profitLoss)}
                />
                <StatCard
                    hint="All recorded trades"
                    icon="receipt_long"
                    label="Transactions"
                    trend={{ label: `Updated ${formattedLastUpdated}`, tone: "neutral" }}
                    value={formatNumber(activeDashboard?.totalTransactions)}
                />
                <StatCard
                    hint="Estimated from 1D moves"
                    icon="today"
                    label="Today's P/L"
                    tone={getToneFromValue(todayPnL)}
                    trend={{
                        label: currentValue ? `${((todayPnL / currentValue) * 100).toFixed(2)}% today` : "No holdings",
                        tone: getToneFromValue(todayPnL),
                    }}
                    value={`${todayPnL >= 0 ? "+" : ""}${formatCurrency(todayPnL)}`}
                />
                <StatCard
                    hint="Since inception"
                    icon="percent"
                    label="Overall Return %"
                    tone={getToneFromValue(returnPct)}
                    trend={{ label: "On invested capital", tone: getToneFromValue(returnPct) }}
                    value={`${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}%`}
                />
                <StatCard
                    hint="Unique stocks owned"
                    icon="donut_small"
                    label="Active Holdings"
                    trend={{ label: `${formatNumber(stocks.length)} tracked`, tone: "neutral" }}
                    value={formatNumber(activePortfolio.length)}
                />
            </section>



            <section className="panel">
                <div className="panel-header">
                    <div>
                        <span className="eyebrow">Performance</span>
                        <h2>Portfolio Performance</h2>
                        <span className="panel-meta">Portfolio value vs invested capital</span>
                    </div>
                    <div className="panel-chip-group">
                        {PERFORMANCE_PERIODS.map((item) => (
                            <button
                                className={`chip ${period === item ? "active" : ""}`}
                                key={item}
                                onClick={() => setPeriod(item)}
                                type="button"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="chart-frame chart-frame-lg">
                    <ResponsiveContainer height="100%" width="100%">
                        <AreaChart data={performanceSeries}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorInvested" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.18} />
                                    <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
                            <XAxis axisLine={false} dataKey="label" fontSize={11} stroke="var(--muted)" tickLine={false} />
                            <YAxis
                                axisLine={false}
                                fontSize={11}
                                stroke="var(--muted)"
                                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                                tickLine={false}
                                width={52}
                            />
                            <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatCurrency(value), name]} />
                            <Area dataKey="value" fill="url(#colorValue)" fillOpacity={1} name="Portfolio Value" stroke="#2563eb" strokeWidth={2} type="monotone" />
                            <Area dataKey="invested" fill="url(#colorInvested)" fillOpacity={1} name="Invested Value" stroke="#64748b" strokeWidth={2} type="monotone" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <div className="analytics-row">
                <section className="panel">
                    <div className="panel-header">
                        <div>
                            <span className="eyebrow">Composition</span>
                            <h2>Portfolio Allocation</h2>
                            <span className="panel-meta">By current market value</span>
                        </div>
                    </div>
                    <div className="donut-wrap">
                        {stockAllocation.length ? (
                            <>
                                <div className="chart-frame chart-frame-sm">
                                    <ResponsiveContainer height="100%" width="100%">
                                        <PieChart>
                                            <Pie
                                                cx="50%"
                                                cy="50%"
                                                data={stockAllocation}
                                                dataKey="value"
                                                innerRadius={52}
                                                nameKey="symbol"
                                                outerRadius={78}
                                                paddingAngle={3}
                                            >
                                                {stockAllocation.map((entry, index) => (
                                                    <Cell fill={CHART_COLORS[index % CHART_COLORS.length]} key={entry.symbol} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value, name) => [formatCurrency(value), name]} contentStyle={tooltipStyle} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <ul className="legend-list">
                                    {stockAllocation.map((entry, index) => (
                                        <li key={entry.symbol}>
                                            <span>
                                                <i style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />
                                                {entry.symbol}
                                            </span>
                                            <strong>{entry.percent.toFixed(1)}%</strong>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <div className="table-state">No allocation yet.</div>
                        )}
                    </div>
                </section>

                <section className="panel">
                    <div className="panel-header">
                        <div>
                            <span className="eyebrow">Volatility</span>
                            <h2>Daily P/L</h2>
                            <span className="panel-meta">Last 10 sessions</span>
                        </div>
                    </div>
                    <div className="chart-frame">
                        <ResponsiveContainer height="100%" width="100%">
                            <BarChart data={dailyPnLSeries}>
                                <XAxis axisLine={false} dataKey="label" fontSize={11} stroke="var(--muted)" tickLine={false} />
                                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(value), "P/L"]} />
                                <Bar dataKey="pnl" maxBarSize={28} radius={[4, 4, 0, 0]}>
                                    {dailyPnLSeries.map((entry) => (
                                        <Cell fill={entry.pnl >= 0 ? "#16a34a" : "#dc2626"} key={entry.label} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>

            <div className="analytics-row">
                <section className="panel">
                    <div className="panel-header">
                        <div>
                            <span className="eyebrow">Leaders</span>
                            <h2>Top Performers</h2>
                        </div>
                    </div>
                    {topPerformers.length ? (
                        <div className="table-wrap">
                            <table className="data-table dense-table">
                                <thead>
                                    <tr>
                                        <th>Stock</th>
                                        <th className="align-right">Price</th>
                                        <th className="align-right">Today</th>
                                        <th className="align-right">Overall P/L</th>
                                        <th>Trend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topPerformers.map((holding) => (
                                        <tr key={holding.stockId || holding.symbol}>
                                            <td>
                                                <span className="ticker-cell">
                                                    <strong>{holding.symbol}</strong>
                                                    <span>{holding.companyName}</span>
                                                </span>
                                            </td>
                                            <td className="align-right">{formatCurrency(holding.currentPrice)}</td>
                                            <td className={`align-right money-${getToneFromValue(holding.daily.percent)}`}>
                                                {holding.daily.percent >= 0 ? "+" : ""}
                                                {holding.daily.percent.toFixed(2)}%
                                            </td>
                                            <td className={`align-right money-${getToneFromValue(holding.profitLoss)}`}>
                                                {formatCurrency(holding.profitLoss)}
                                            </td>
                                            <td>
                                                <Sparkline
                                                    points={holding.series}
                                                    positive={Number(holding.profitLoss) >= 0}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="table-state">No holdings to rank yet.</div>
                    )}
                </section>

                <section className="panel">
                    <div className="panel-header">
                        <div>
                            <span className="eyebrow">Benchmarks</span>
                            <h2>Market Overview</h2>
                            <span className="panel-meta">NIFTY 50 · SENSEX · BANKNIFTY · FINNIFTY</span>
                        </div>
                    </div>
                    <div className="market-overview">
                        {marketOverview.map((idx) => (
                            <article className="market-index-card" key={idx.name}>
                                <span className="market-index-name">{idx.name}</span>
                                <strong>{formatNumber(idx.price.toFixed(2))}</strong>
                                <span className={`price-delta ${idx.change >= 0 ? "up" : "down"}`}>
                                    {idx.change >= 0 ? "+" : ""}
                                    {idx.percent.toFixed(2)}%
                                </span>
                            </article>
                        ))}
                    </div>
                </section>
            </div>

            <div className="dashboard-grid">
                <section className="panel panel-wide">
                    <div className="panel-header">
                        <div>
                            <span className="eyebrow">Portfolio</span>
                            <h2>Holdings Summary</h2>
                        </div>
                        <div className="panel-chip-group">
                            {["ALL", "PROFIT", "LOSS"].map((item) => (
                                <button
                                    className={`chip ${holdingFilter === item ? "active" : ""}`}
                                    key={item}
                                    onClick={() => setHoldingFilter(item)}
                                    type="button"
                                >
                                    {item === "ALL" ? "All" : item === "PROFIT" ? "Profit" : "Loss"}
                                </button>
                            ))}
                        </div>
                    </div>
                    <DataTable
                        columns={portfolioColumns}
                        data={activePortfolio}
                        emptyMessage="No active holdings for this user."
                        isLoading={isPortfolioLoading}
                    />
                    <div className="panel-footer">Showing {formatNumber(activePortfolio.length)} holdings</div>
                </section>

                <section className="panel">
                    <div className="panel-header">
                        <div>
                            <span className="eyebrow">Recent</span>
                            <h2>Transactions</h2>
                        </div>
                        <Link className="btn btn-secondary btn-small" to="/transactions">
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>
                    <DataTable
                        columns={transactionColumns}
                        data={userTransactions}
                        emptyMessage="No transactions for this user."
                        isLoading={isLoading}
                    />
                </section>

                <section className="panel">
                    <div className="panel-header">
                        <div>
                            <span className="eyebrow">Watchlist</span>
                            <h2>Tracked Stocks</h2>
                            <span className="panel-meta">{watchlistCaption}</span>
                        </div>
                        <Link className="btn btn-secondary btn-small" to="/stocks">
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>
                    <div className="watch-list">
                        {displayedWatchStocks.map((stock) => {
                            const quote = quotesBySymbol[stock.symbol];
                            const daily = quote
                                ? { percent: Number(quote.percentChange) || 0 }
                                : getStockDailyChange(stock);
                            const price = quote?.price ?? getStockPrice(stock);
                            return (
                                <div className="watch-row" key={stock.id}>
                                    <div>
                                        <strong>{stock.symbol}</strong>
                                        <span>{quote?.companyName || getStockCompany(stock)}</span>
                                        <span>
                                            52W {formatInrOrNA(quote?.yearHigh)} / {formatInrOrNA(quote?.yearLow)}
                                        </span>
                                    </div>
                                    <Sparkline
                                        points={getStockSeries(stock, priceHistoryById, 12)}
                                        positive={daily.percent >= 0}
                                    />
                                    <span className={`money-${getToneFromValue(daily.percent)}`}>
                                        {formatInrOrNA(price)}
                                        <small style={{ display: "block" }}>{formatSignedPercent(quote ? quote.percentChange : daily.percent)}</small>
                                    </span>
                                </div>
                            );
                        })}
                        {!stocks.length && !isLoading ? (
                            <div className="table-state">No stocks available.</div>
                        ) : null}
                    </div>
                    <div className="panel-footer">Last sync: {formattedLastUpdated}</div>
                </section>
            </div>
            {selectedQuote ? <StockDetailModal onClose={() => setSelectedQuote(null)} stock={selectedQuote} /> : null}
        </div>
    );
}

export default Dashboard;
