import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../services/api";
import { formatCurrency } from "../utils/format";

const RANGES = [
    { label: "1D", value: "1d" },
    { label: "1W", value: "5d" },
    { label: "1M", value: "1mo" },
    { label: "3M", value: "3mo" },
    { label: "6M", value: "6mo" },
    { label: "1Y", value: "1y" },
    { label: "5Y", value: "5y" }
];

export default function StockChart({ symbol }) {
    const [range, setRange] = useState("1mo");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!symbol) return;
        let ignore = false;
        setTimeout(() => { if (!ignore) setLoading(true); }, 0);
        setTimeout(() => { if (!ignore) setError(""); }, 0);
        
        api.get(`/market/chart`, { params: { symbol, range }, silent: true })
            .then(res => {
                if (!ignore) {
                    setData(res.data || []);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!ignore) {
                    setError("Chart data unavailable");
                    setLoading(false);
                }
            });
            
        return () => { ignore = true; };
    }, [symbol, range]);

    if (!symbol) return null;

    const minPrice = data.length ? Math.min(...data.map(d => d.price)) : 0;
    const maxPrice = data.length ? Math.max(...data.map(d => d.price)) : 0;
    const yAxisDomain = [minPrice * 0.98, maxPrice * 1.02];

    const isPositive = data.length > 1 && data[data.length - 1].price >= data[0].price;
    const color = isPositive ? "#10b981" : "#ef4444";

    return (
        <div className="stock-chart-container" style={{ marginTop: 24, marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {RANGES.map(r => (
                    <button 
                        key={r.value}
                        onClick={() => setRange(r.value)}
                        style={{
                            background: range === r.value ? "var(--primary-color)" : "var(--surface-soft)",
                            color: range === r.value ? "white" : "inherit",
                            border: "none",
                            padding: "4px 12px",
                            borderRadius: "16px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 600
                        }}
                    >
                        {r.label}
                    </button>
                ))}
            </div>
            
            <div style={{ height: 260, width: "100%", position: "relative" }}>
                {loading && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.5)", zIndex: 10 }}>
                        <span className="muted">Loading chart...</span>
                    </div>
                )}
                {error && !loading && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="muted">{error}</span>
                    </div>
                )}
                {!loading && !error && data.length === 0 && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="muted">No chart data</span>
                    </div>
                )}
                
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={color} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="time" 
                            hide={true} 
                        />
                        <YAxis 
                            domain={yAxisDomain} 
                            hide={true} 
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            formatter={(value) => [formatCurrency(value), "Price"]}
                            labelStyle={{ color: "var(--text-muted)", marginBottom: 4 }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke={color} 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
