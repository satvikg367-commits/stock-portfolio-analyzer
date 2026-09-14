import { useCallback, useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import Sparkline from "../components/Sparkline";
import StockDetailModal from "../components/StockDetailModal";
import { useAuth } from "../context/AuthContext";
import api, { getApiError } from "../services/api";
import { getStockPriceQuote } from "../services/marketApi";
import {
  CHART_COLORS,
  getStockSeries,
  loadPriceHistory,
} from "../utils/charts";
import {
  formatCurrency,
  getStockDailyChange,
  getToneFromValue,
} from "../utils/format";

function Holdings() {
  const [portfolio, setPortfolio] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [priceHistoryById, setPriceHistoryById] = useState(() =>
    loadPriceHistory(),
  );
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
    const [selectedStock, setSelectedStock] = useState(null);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  const [error, setError] = useState("");
  const [quotesBySymbol, setQuotesBySymbol] = useState({});

  const loadOverview = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setError("");

    try {
      const [stocksResponse] = await Promise.all([api.get("/stocks")]);
      setStocks(stocksResponse.data || []);
    } catch (loadError) {
      setError(getApiError(loadError, "Unable to load holdings data"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function run() {
      if (isMounted) {
        await loadOverview();
      }
    }
    run();
    return () => {
      isMounted = false;
    };
  }, [loadOverview]);

  const { user: authUser } = useAuth();

  useEffect(() => {
    if (authUser?.id) {
      Promise.resolve().then(() => setSelectedUserId(authUser.id));
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
    const symbols = portfolio.map((h) => h.symbol).filter(Boolean);
    if (!symbols.length) return;

    let ignore = false;
    Promise.all(
      symbols.map(async (symbol) => {
        const result = await getStockPriceQuote(symbol);
        return [symbol, result.ok ? result.data : null];
      }),
    ).then((entries) => {
      if (!ignore) {
        setQuotesBySymbol(Object.fromEntries(entries));
      }
    });
    return () => {
      ignore = true;
    };
  }, [portfolio]);

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    let ignore = false;

    async function loadUserPortfolio() {
      setIsPortfolioLoading(true);
      setError("");

      try {
        const [, portfolioResponse] = await Promise.all([
          api.get("/dashboard"),
          api.get("/portfolio"),
        ]);

        if (!ignore) {
          setPortfolio(portfolioResponse.data || []);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(getApiError(loadError, "Unable to load portfolio metrics"));
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
          _isLive: true,
        };
      }
      return holding;
    });
  }, [portfolio, quotesBySymbol]);

  const totalValue = activePortfolio.reduce(
    (acc, h) => acc + (Number(h.currentValue) || 0),
    0,
  );
  const invested = activePortfolio.reduce(
    (acc, h) => acc + (Number(h.investedValue) || 0),
    0,
  );
  const profitLoss = totalValue - invested;
  const todayPnL = useMemo(() => {
    return activePortfolio.reduce((sum, holding) => {
      const stock =
        stocks.find((item) => item.id === holding.stockId) || holding;
      const { change } = getStockDailyChange(stock);
      return sum + change * Number(holding.quantity || 0);
    }, 0);
  }, [activePortfolio, stocks]);

  const stockAllocation = useMemo(() => {
    if (!totalValue) return [];
    return [...activePortfolio]
      .map((holding) => ({
        symbol: holding.symbol,
        value: Number(holding.currentValue) || 0,
        percent: ((Number(holding.currentValue) || 0) / totalValue) * 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, [activePortfolio, totalValue]);

  const sectorDistribution = useMemo(() => {
    const bySector = {};
    portfolio.forEach((holding) => {
      const stock = stocks.find((item) => item.id === holding.stockId);
      const sector = stock?.sector || "Unclassified";
      bySector[sector] =
        (bySector[sector] || 0) + Number(holding.currentValue || 0);
    });
    const total =
      Object.values(bySector).reduce((sum, value) => sum + value, 0) || 1;
    return Object.entries(bySector)
      .map(([sector, value]) => ({
        sector,
        value,
        percent: (value / total) * 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, [portfolio, stocks]);

  const bestPerformer = activePortfolio.length
    ? activePortfolio.reduce((prev, current) =>
        Number(prev.profitLoss) > Number(current.profitLoss) ? prev : current,
      )
    : null;
  const worstPerformer = activePortfolio.length
    ? activePortfolio.reduce((prev, current) =>
        Number(prev.profitLoss) < Number(current.profitLoss) ? prev : current,
      )
    : null;

  const tooltipStyle = {
    backgroundColor: "var(--surface)",
    borderRadius: "8px",
    border: "1px solid var(--line)",
    fontSize: 12,
  };

  return (
    <div className="page-stack">
      <div className="page-header page-header-row">
        <div>
          <span className="eyebrow">Portfolio</span>
          <h1>Holdings</h1>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="split-layout">
        <div className="split-main">
          <div className="panel holdings-summary">
            <div className="holdings-summary-top">
              <div>
                <span className="eyebrow">
                  Holdings ({activePortfolio.length})
                </span>
                <div className="holdings-value">
                  {formatCurrency(totalValue)}
                </div>
              </div>
            </div>
            <div className="holdings-metrics">
              <div>
                <span>Invested value</span>
                <strong>{formatCurrency(invested)}</strong>
              </div>
              <div>
                <span>Today's change</span>
                <strong className={`money-${getToneFromValue(todayPnL)}`}>
                  {todayPnL >= 0 ? "+" : ""}
                  {formatCurrency(todayPnL)}
                </strong>
              </div>
              <div>
                <span>Total returns</span>
                <strong className={`money-${getToneFromValue(profitLoss)}`}>
                  {profitLoss >= 0 ? "+" : ""}
                  {formatCurrency(profitLoss)}
                </strong>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="table-wrap">
              <table className="data-table dense-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th className="align-right">Alloc %</th>
                    <th className="align-right">Market / 1D</th>
                    <th>Trend</th>
                    <th className="align-right">P/L %</th>
                    <th className="align-right">Current (Invested)</th>
                  </tr>
                </thead>
                <tbody>
                  {activePortfolio.map((holding) => {
                    const investedValue =
                      Number(holding.investedValue) ||
                      Number(holding.averageBuyPrice) *
                        Number(holding.quantity);
                    const plPct = investedValue
                      ? (Number(holding.profitLoss) / investedValue) * 100
                      : 0;
                    const alloc = totalValue
                      ? (Number(holding.currentValue) / totalValue) * 100
                      : 0;
                    const stock =
                      stocks.find((item) => item.id === holding.stockId) ||
                      holding;
                    const daily = getStockDailyChange(stock);
                    const series = getStockSeries(
                      holding,
                      priceHistoryById,
                      12,
                    );

                    return (
                      <tr key={holding.stockId || holding.symbol} onClick={() => setSelectedStock({ ...holding, id: holding.stockId })} style={{ cursor: "pointer" }} className="hover-row">
                        <td>
                          <div className="ticker-cell">
                            <strong>
                              {holding.companyName || holding.symbol}
                            </strong>
                            <span>
                              {holding.quantity} shares · Avg{" "}
                              {formatCurrency(holding.averageBuyPrice)}
                            </span>
                          </div>
                        </td>
                        <td className="align-right">{alloc.toFixed(1)}%</td>
                        <td className="align-right">
                          <div>{formatCurrency(holding.currentPrice)}</div>
                          <div
                            className={`money-${getToneFromValue(daily.percent)}`}
                          >
                            {daily.percent >= 0 ? "+" : ""}
                            {daily.percent.toFixed(2)}%
                          </div>
                        </td>
                        <td>
                          <Sparkline
                            points={series}
                            positive={daily.percent >= 0}
                          />
                        </td>
                        <td
                          className={`align-right money-${getToneFromValue(plPct)}`}
                        >
                          <div>
                            {holding.profitLoss >= 0 ? "+" : ""}
                            {formatCurrency(holding.profitLoss)}
                          </div>
                          <div>
                            {plPct >= 0 ? "+" : ""}
                            {plPct.toFixed(2)}%
                          </div>
                        </td>
                        <td className="align-right">
                          <div>{formatCurrency(holding.currentValue)}</div>
                          <div className="muted">
                            {formatCurrency(investedValue)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!activePortfolio.length && (
              <div className="table-state">
                {isLoading || isPortfolioLoading
                  ? "Loading holdings..."
                  : "No active holdings found."}
              </div>
            )}
          </div>
          <div className="panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">Diversification</span>
                <h2>Sector Allocation</h2>
              </div>
            </div>
            <div className="donut-wrap">
              {sectorDistribution.length ? (
                <div className="chart-frame chart-frame-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorDistribution}
                        dataKey="value"
                        nameKey="sector"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {sectorDistribution.map((entry, index) => (
                          <Cell
                            key={entry.sector}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : null}
              <ul className="legend-list padded">
                {sectorDistribution.map((sector, index) => (
                  <li key={sector.sector}>
                    <span>
                      <i
                        style={{
                          background: CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      {sector.sector}
                    </span>
                    <strong>{sector.percent.toFixed(1)}%</strong>
                  </li>
                ))}
                {!sectorDistribution.length ? (
                  <li className="muted">No sector data.</li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>

        <aside className="split-side">
          <div className="panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">Mix</span>
                <h2>Portfolio Allocation</h2>
              </div>
            </div>
            <div className="chart-frame chart-frame-sm">
              {stockAllocation.length ? (
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={stockAllocation}
                      dataKey="value"
                      innerRadius={48}
                      nameKey="symbol"
                      outerRadius={72}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {stockAllocation.map((entry, index) => (
                        <Cell
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          key={entry.symbol}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="table-state">No allocation data.</div>
              )}
            </div>
            <ul className="legend-list padded">
              {stockAllocation.slice(0, 5).map((entry, index) => (
                <li key={entry.symbol}>
                  <span>
                    <i
                      style={{
                        background: CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                    {entry.symbol}
                  </span>
                  <strong>{entry.percent.toFixed(1)}%</strong>
                </li>
              ))}
            </ul>
          </div>

          {bestPerformer ? (
            <div className="panel performer-card positive">
              <span className="eyebrow">Best Performer</span>
              <div className="performer-row">
                <div>
                  <strong>{bestPerformer.symbol}</strong>
                  <span>{bestPerformer.companyName}</span>
                </div>
                <div className="money-positive">
                  +{formatCurrency(bestPerformer.profitLoss)}
                </div>
              </div>
            </div>
          ) : null}

          {worstPerformer ? (
            <div className="panel performer-card negative">
              <span className="eyebrow">Worst Performer</span>
              <div className="performer-row">
                <div>
                  <strong>{worstPerformer.symbol}</strong>
                  <span>{worstPerformer.companyName}</span>
                </div>
                <div className="money-negative">
                  {formatCurrency(worstPerformer.profitLoss)}
                </div>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
        {selectedStock && <StockDetailModal onClose={() => setSelectedStock(null)} stock={selectedStock} />}
        </div>
  );
}

export default Holdings;
