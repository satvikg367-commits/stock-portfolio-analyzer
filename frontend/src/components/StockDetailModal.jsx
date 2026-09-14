import { useEffect, useState } from "react";
import api from "../services/api";
import { getStockPriceQuote } from "../services/marketApi";
import StockChart from "./StockChart";
import { useAuth } from "../context/AuthContext";
import {
    formatCurrency,
    formatInrOrNA,
    formatNumber,
    formatSignedPercent,
    getStockCompany,
    getStockPrice,
    getToneFromValue,
} from "../utils/format";

function lookupName(stock) {
    return stock?.query || stock?.symbol || getStockCompany(stock) || "";
}

export default function StockDetailModal({ stock, onClose }) {
    const { user } = useAuth();
    const [holding, setHolding] = useState(null);
    const [isLoading, setIsLoading] = useState(!!(stock && user));
    const [quote, setQuote] = useState(null);
    const [quoteError, setQuoteError] = useState("");

    const queryName = lookupName(stock);

    useEffect(() => {
        if (!stock || !user) {
            return;
        }
        let ignore = false;
        async function fetchData() {
            setIsLoading(true);
            try {
                const res = await api.get("/portfolio");
                if (ignore) return;
                const userPortfolio = res.data || [];
                const specificHolding = userPortfolio.find((h) => h.stockId === stock.id);
                setHolding(specificHolding || null);
            } catch {
                if (ignore) return;
                setHolding(null);
            } finally {
                if (!ignore) setIsLoading(false);
            }
        }
        fetchData();
        return () => { ignore = true; };
    }, [stock, user]);

    useEffect(() => {
        if (!queryName) {
            return;
        }
        let ignore = false;
        getStockPriceQuote(queryName).then((result) => {
            if (ignore) return;
            if (!result.ok) {
                setQuote(null);
                setQuoteError("Live market data unavailable");
                return;
            }
            setQuote(result.data);
            setQuoteError("");
        });
        return () => {
            ignore = true;
        };
    }, [queryName]);

    if (!stock) return null;

    const livePrice = quote?.price ?? getStockPrice(stock);
    const liveChange = quote?.percentChange;

    return (
        <div className="modal-backdrop">
            <div className="panel modal-panel" style={{ maxWidth: "720px", maxHeight: "90vh", overflowY: "auto" }}>
                <button className="modal-close" onClick={onClose} type="button">
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="panel-header" style={{ paddingLeft: 0, paddingRight: 36 }}>
                    <div>
                        <span className="eyebrow">{stock.sector || "Equities"}</span>
                        <h2>{quote?.symbol || stock.symbol || queryName}</h2>
                        <span className="panel-meta">{quote?.companyName || getStockCompany(stock)}</span>
                    </div>
                    {livePrice != null ? (
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "24px", fontWeight: 600 }}>{formatInrOrNA(livePrice)}</div>
                            <div className={`money-${getToneFromValue(liveChange)}`}>{formatSignedPercent(liveChange)}</div>
                        </div>
                    ) : null}
                </div>

                {quoteError ? <div className="table-state muted">{quoteError}</div> : null}

                
                {quote?.symbol || stock?.symbol || queryName ? (
                    <StockChart symbol={quote?.symbol || stock?.symbol || queryName} />
                ) : null}
                <div className="holdings-metrics" style={{ marginBottom: 16 }}>
                    {quote?.nsePrice != null && (
                        <div>
                            <span>NSE</span>
                            <strong>{formatInrOrNA(quote.nsePrice)}</strong>
                        </div>
                    )}
                    {quote?.bsePrice != null && (
                        <div>
                            <span>BSE</span>
                            <strong>{formatInrOrNA(quote.bsePrice)}</strong>
                        </div>
                    )}
                    {quote?.previousClose != null && (
                        <div>
                            <span>Previous Close</span>
                            <strong>{formatInrOrNA(quote.previousClose)}</strong>
                        </div>
                    )}
                    {quote?.dayHigh != null && (
                        <div>
                            <span>Day High</span>
                            <strong>{formatInrOrNA(quote.dayHigh)}</strong>
                        </div>
                    )}
                    {quote?.dayLow != null && (
                        <div>
                            <span>Day Low</span>
                            <strong>{formatInrOrNA(quote.dayLow)}</strong>
                        </div>
                    )}
                    {quote?.yearHigh != null && (
                        <div>
                            <span>52 Week High</span>
                            <strong>{formatInrOrNA(quote.yearHigh)}</strong>
                        </div>
                    )}
                    {quote?.yearLow != null && (
                        <div>
                            <span>52 Week Low</span>
                            <strong>{formatInrOrNA(quote.yearLow)}</strong>
                        </div>
                    )}
                </div>

                <div style={{ background: "var(--surface-soft)", padding: 16, borderRadius: 8, marginTop: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Your Position</h3>
                    {isLoading ? (
                        <div className="muted">Loading position...</div>
                    ) : holding ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <span className="muted">Quantity</span>
                                <strong>{formatNumber(holding.quantity)} shares</strong>
                            </div>
                            <div>
                                <span className="muted">Avg Buy Price</span>
                                <strong>{formatCurrency(holding.averageBuyPrice)}</strong>
                            </div>
                            <div>
                                <span className="muted">Invested Value</span>
                                <strong>{formatCurrency(holding.investedValue)}</strong>
                            </div>
                            <div>
                                <span className="muted">Current Value</span>
                                <strong>{formatCurrency(holding.currentValue)}</strong>
                            </div>
                        </div>
                    ) : (
                        <div className="muted">You do not currently hold this stock.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
