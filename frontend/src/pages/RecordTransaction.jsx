import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import api, { getApiError } from "../services/api";
import {
    formatCurrency,
    getStockCompany,
    getStockPrice,
    todayInputValue,
} from "../utils/format";

const initialForm = {
    userId: "",
    stockId: "",
    transactionType: "BUY",
    transactionDate: todayInputValue(),
    quantity: "",
    price: "",
};

function RecordTransaction() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
        const [stocks, setStocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let ignore = false;

        async function loadOptions() {
            setIsLoading(true);
            setError("");

            try {
                const stocksResponse = await api.get("/stocks");

                if (ignore) {
                    return;
                }

                                const nextStocks = stocksResponse.data || [];
                                setStocks(nextStocks);
                setForm((currentForm) => ({
                    ...currentForm,
                    userId: user?.id || "",
                    stockId: currentForm.stockId || nextStocks[0]?.id || "",
                    price:
                        currentForm.price ||
                        (nextStocks[0] ? String(getStockPrice(nextStocks[0])) : ""),
                }));
            } catch (loadError) {
                if (!ignore) {
                    setError(getApiError(loadError, "Unable to load form options"));
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadOptions();

        return () => {
            ignore = true;
        };
    }, []);

    const selectedStock = useMemo(
        () => stocks.find((stock) => stock.id === Number(form.stockId)),
        [form.stockId, stocks]
    );

    const orderValue =
        (Number(form.quantity) || 0) * (Number(form.price) || 0);

    function updateField(event) {
        const { name, value } = event.target;

        setForm((currentForm) => {
            if (name === "stockId") {
                const stock = stocks.find((candidate) => candidate.id === Number(value));
                return {
                    ...currentForm,
                    stockId: value,
                    price: stock ? String(getStockPrice(stock)) : currentForm.price,
                };
            }

            return { ...currentForm, [name]: value };
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsSaving(true);
        setError("");
        setSuccess("");

        try {
            const payload = {
                stock: { id: Number(form.stockId) },
                quantity: Number(form.quantity),
                price: Number(form.price),
                transactionType: form.transactionType,
                transactionDate: form.transactionDate,
            };

            await api.post("/transactions", payload);
            setSuccess("Transaction recorded successfully.");
            setForm({
                ...initialForm,
                stockId: form.stockId,
                price: selectedStock ? String(getStockPrice(selectedStock)) : "",
            });
            window.setTimeout(() => navigate("/transactions"), 700);
        } catch (saveError) {
            setError(getApiError(saveError, "Unable to record transaction"));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="transaction-form-layout">
            <section className="form-panel">
                <div className="form-panel-header">
                    <span className="eyebrow">Operation Desk</span>
                    <h1>Record Transaction</h1>
                </div>

                {error ? <div className="alert alert-error">{error}</div> : null}
                {success ? <div className="alert alert-success">{success}</div> : null}

                <form className="form-grid two-column" onSubmit={handleSubmit}>
                    <label className="field">
                        <span>User Profile</span>
                        <div className="input-shell">
                            <span className="material-symbols-outlined">person</span>
                            <input
                                disabled
                                type="text"
                                value={user?.name || "Loading..."}
                            />
                        </div>
                    </label>

                    <label className="field">
                        <span>Security Ticker</span>
                        <div className="input-shell">
                            <span className="material-symbols-outlined">show_chart</span>
                            <select
                                disabled={isLoading}
                                name="stockId"
                                onChange={updateField}
                                required
                                value={form.stockId}
                            >
                                <option value="">Select stock</option>
                                {stocks.map((stock) => (
                                    <option key={stock.id} value={stock.id}>
                                        {stock.symbol} ({getStockCompany(stock)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </label>

                    <div className="field">
                        <span>Order Type</span>
                        <div className="segmented-control">
                            <label>
                                <input
                                    checked={form.transactionType === "BUY"}
                                    name="transactionType"
                                    onChange={updateField}
                                    type="radio"
                                    value="BUY"
                                />
                                <span>BUY</span>
                            </label>
                            <label>
                                <input
                                    checked={form.transactionType === "SELL"}
                                    name="transactionType"
                                    onChange={updateField}
                                    type="radio"
                                    value="SELL"
                                />
                                <span>SELL</span>
                            </label>
                        </div>
                    </div>

                    <label className="field">
                        <span>Execution Date</span>
                        <div className="input-shell">
                            <span className="material-symbols-outlined">calendar_today</span>
                            <input
                                name="transactionDate"
                                onChange={updateField}
                                required
                                type="date"
                                value={form.transactionDate}
                            />
                        </div>
                    </label>

                    <label className="field">
                        <span>Volume</span>
                        <div className="input-shell">
                            <span className="material-symbols-outlined">numbers</span>
                            <input
                                min="1"
                                name="quantity"
                                onChange={updateField}
                                placeholder="100"
                                required
                                step="1"
                                type="number"
                                value={form.quantity}
                            />
                        </div>
                    </label>

                    <label className="field">
                        <span>Execution Price</span>
                        <div className="input-shell">
                            <span className="input-prefix">₹</span>
                            <input
                                min="0.01"
                                name="price"
                                onChange={updateField}
                                placeholder="0.00"
                                required
                                step="0.01"
                                type="number"
                                value={form.price}
                            />
                        </div>
                    </label>

                    <div className="order-preview form-actions-span">
                        <span>Estimated Value</span>
                        <strong>{formatCurrency(orderValue)}</strong>
                    </div>

                    <div className="form-actions form-actions-span">
                        <Link className="btn btn-secondary" to="/transactions">
                            <span className="material-symbols-outlined">close</span>
                            Cancel
                        </Link>
                        <button className="btn btn-primary" disabled={isSaving} type="submit">
                            <span className="material-symbols-outlined">
                                {isSaving ? "sync" : "check_circle"}
                            </span>
                            {isSaving ? "Saving" : "Record Transaction"}
                        </button>
                    </div>
                </form>
            </section>

            <aside className="market-panel">
                <div className="panel-header">
                    <div>
                        <span className="eyebrow">Market Pulse</span>
                        <h2>Selected Security</h2>
                    </div>
                </div>
                {selectedStock ? (
                    <div className="market-list">
                        <div className="market-row">
                            <span>Symbol</span>
                            <strong>{selectedStock.symbol}</strong>
                        </div>
                        <div className="market-row">
                            <span>Company</span>
                            <strong>{getStockCompany(selectedStock)}</strong>
                        </div>
                        <div className="market-row">
                            <span>Stored Price</span>
                            <strong>{formatCurrency(getStockPrice(selectedStock))}</strong>
                        </div>
                    </div>
                ) : (
                    <div className="table-state">No stock selected.</div>
                )}
            </aside>
        </div>
    );
}

export default RecordTransaction;
