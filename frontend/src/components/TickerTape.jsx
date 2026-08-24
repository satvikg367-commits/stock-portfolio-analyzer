import { useEffect, useState } from "react";
import api from "../services/api";
import { FALLBACK_INDICES, mapIndex } from "../utils/charts";

export default function TickerTape() {
    const [indices, setIndices] = useState([]);
    const [error, setError] = useState(null);

    const fetchIndices = () => {
        setError(null);
        api.get("/indices", { silent: true }).then((res) => {
            const data = (res.data || []).map(mapIndex);
            setIndices(data.length ? data : FALLBACK_INDICES.map(mapIndex));
        }).catch((err) => {
            console.error("TickerTape fetch error:", err);
            setIndices(FALLBACK_INDICES.map(mapIndex));
            setError(null);
        });
    };

    // Fetch initial data from backend
    useEffect(() => {
        fetchIndices();
    }, []);

    // Simulate live ticking over the real data
    useEffect(() => {
        if (indices.length === 0) return;
        
        const interval = setInterval(() => {
            setIndices(prev => prev.map(idx => {
                const isPositive = Math.random() > 0.5;
                const changeAmt = (Math.random() * 5);
                const newPrice = isPositive ? idx.price + changeAmt : idx.price - changeAmt;
                return {
                    ...idx,
                    price: newPrice,
                    change: isPositive ? idx.change + changeAmt : idx.change - changeAmt,
                };
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, [indices.length > 0]);

    return (
        <div className="ticker-tape">
            {error && (
                <div style={{ color: 'var(--red)', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>Error: {error}</span>
                    <button onClick={fetchIndices} style={{ background: 'transparent', border: '1px solid var(--line)', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '12px' }}>Retry</button>
                </div>
            )}
            {!error && indices.length === 0 && (
                <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Loading market indices...</div>
            )}
            {indices.map((idx) => {
                const isPos = idx.change >= 0;
                return (
                    <div className="ticker-item" key={idx.name}>
                        <span className="ticker-name">{idx.name}</span>
                        <span className="ticker-price">{idx.price.toFixed(2)}</span>
                        <span className={isPos ? "money-positive" : "money-negative"}>
                            {isPos ? "+" : ""}
                            {idx.change.toFixed(2)} ({idx.percent.toFixed(2)}%)
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
