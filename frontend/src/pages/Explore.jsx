import { useEffect, useState } from "react";
import StockDetailModal from "../components/StockDetailModal";
import api from "../services/api";
import { getStockPriceQuote } from "../services/marketApi";
import { formatInrOrNA } from "../utils/format";

export default function Explore() {
    const [tracked, setTracked] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [searchError, setSearchError] = useState("");
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        api.get("/stocks").then((res) => setTracked(res.data || [])).catch(() => setTracked([]));
    }, []);

    async function handleSearch(event) {
        event.preventDefault();
        const name = searchText.trim();
        if (!name) return;
        setSearching(true);
        setSearchError("");
        const result = await getStockPriceQuote(name);
        setSearching(false);
        if (!result.ok) {
            setSearchError("Live market data unavailable");
            return;
        }
        setSelectedStock({
            symbol: result.data.symbol,
            companyName: result.data.companyName,
            currentPrice: result.data.price,
            query: name,
        });
    }

    return (
        <div className="page-stack">
            <div className="page-header page-header-row">
                <div>
                    <span className="eyebrow">Market Pulse</span>
                    <h1>Explore</h1>
                </div>
            </div>

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <span className="eyebrow">Search</span>
                        <h2>Stock Search</h2>
                        <span className="panel-meta">Live quote from the Indian market API via backend</span>
                    </div>
                    <form className="panel-controls" onSubmit={handleSearch}>
                        <label className="field compact-field">
                            <span>Name or symbol</span>
                            <div className="input-shell compact-shell">
                                <span className="material-symbols-outlined">search</span>
                                <input
                                    onChange={(event) => setSearchText(event.target.value)}
                                    placeholder="TCS, Tata Steel, Reliance"
                                    type="text"
                                    value={searchText}
                                />
                            </div>
                        </label>
                        <button className="btn btn-primary" disabled={searching} type="submit">
                            {searching ? "Searching..." : "Search"}
                        </button>
                    </form>
                </div>
                {searchError ? <div className="table-state muted">{searchError}</div> : null}
            </section>

            {tracked.length ? (
                <section>
                    <h2 className="section-heading">Available Stocks</h2>
                    <div className="explore-grid">
                        {tracked.slice(0, 8).map((stock) => (
                            <button className="explore-card" key={stock.id} onClick={() => setSelectedStock(stock)} type="button">
                                <strong>{stock.symbol}</strong>
                                <div className="explore-card-price">{formatInrOrNA(stock.currentPrice ?? stock.currentprice)}</div>
                            </button>
                        ))}
                    </div>
                </section>
            ) : null}

            {selectedStock && <StockDetailModal onClose={() => setSelectedStock(null)} stock={selectedStock} />}
        </div>
    );
}
