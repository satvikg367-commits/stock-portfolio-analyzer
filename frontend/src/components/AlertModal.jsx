import { useState } from "react";
import api, { getApiError } from "../services/api";
import { formatCurrency, getStockCompany, getStockPrice } from "../utils/format";
import { useAuth } from "../context/AuthContext";

export default function AlertModal({ stock, existingAlert, onClose, onAlertSaved, onAlertDeleted }) {
    const { user } = useAuth();
    const currentPrice = getStockPrice(stock);
    const existingCondition = String(existingAlert?.condition || "ABOVE").toUpperCase();
    const [condition, setCondition] = useState(
        existingCondition === "PERCENT" ? "PERCENT" : existingCondition === "BELOW" ? "BELOW" : "ABOVE"
    );
    const [targetPrice, setTargetPrice] = useState(
        existingAlert && existingCondition !== "PERCENT" ? String(existingAlert.targetPrice) : ""
    );
    const [percentMove, setPercentMove] = useState(
        existingAlert && existingCondition === "PERCENT" ? String(existingAlert.targetPrice) : "3"
    );
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleSave(e) {
        e.preventDefault();
        if (!user || !user.id) return;

        setIsSaving(true);
        setError("");

        try {
            const target = condition === "PERCENT" ? Number(percentMove) : Number(targetPrice);
            if (!Number.isFinite(target) || target <= 0) {
                throw new Error(condition === "PERCENT"
                    ? "Percentage must be a valid positive number."
                    : "Target price must be a valid positive number.");
            }

            if (existingAlert) {
                await api.delete(`/alerts/${existingAlert.id}`);
            }

            const payload = {
                stockId: stock.id,
                targetPrice: target,
                condition,
                active: true,
            };

            const response = await api.post("/alerts", payload);
            onAlertSaved(response.data);
            onClose();
        } catch (err) {
            setError(getApiError(err, "Failed to save alert"));
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (!existingAlert) return;
        setIsSaving(true);
        try {
            await api.delete(`/alerts/${existingAlert.id}`);
            onAlertDeleted(existingAlert.id);
            onClose();
        } catch (err) {
            setError(getApiError(err, "Failed to delete alert"));
            setIsSaving(false);
        }
    }

    return (
        <div className="modal-backdrop">
            <div className="panel modal-panel">
                <button className="modal-close" onClick={onClose} type="button">
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="modal-heading">
                    <span className="eyebrow">Set Alert</span>
                    <h2>{stock.symbol}</h2>
                    <div className="panel-meta">{getStockCompany(stock)}</div>
                </div>

                <div className="modal-price-row">
                    <span>Current Price</span>
                    <strong>{formatCurrency(currentPrice)}</strong>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form className="modal-form" onSubmit={handleSave}>
                    <label className="field">
                        <span>Condition</span>
                        <select disabled={isSaving} onChange={(e) => setCondition(e.target.value)} value={condition}>
                            <option value="ABOVE">Price Above</option>
                            <option value="BELOW">Price Below</option>
                            <option value="PERCENT">Percentage Movement</option>
                        </select>
                    </label>

                    {condition === "PERCENT" ? (
                        <label className="field">
                            <span>Move by (%)</span>
                            <div className="input-shell">
                                <input
                                    disabled={isSaving}
                                    min="0.1"
                                    onChange={(e) => setPercentMove(e.target.value)}
                                    placeholder="e.g. 3"
                                    required
                                    step="0.1"
                                    type="number"
                                    value={percentMove}
                                />
                                <span className="input-prefix">%</span>
                            </div>
                        </label>
                    ) : (
                        <label className="field">
                            <span>Target</span>
                            <div className="input-shell">
                                <span className="input-prefix">₹</span>
                                <input
                                    disabled={isSaving}
                                    min="0.01"
                                    onChange={(e) => setTargetPrice(e.target.value)}
                                    placeholder="e.g. 3600"
                                    required
                                    step="0.01"
                                    type="number"
                                    value={targetPrice}
                                />
                            </div>
                        </label>
                    )}

                    <div className="modal-actions">
                        {existingAlert && (
                            <button
                                className="btn btn-secondary"
                                disabled={isSaving}
                                onClick={handleDelete}
                                style={{ color: "var(--red)" }}
                                type="button"
                            >
                                <span className="material-symbols-outlined">delete</span>
                                Remove
                            </button>
                        )}
                        <button className="btn btn-primary" disabled={isSaving} style={{ flex: 1 }} type="submit">
                            {isSaving ? "Saving..." : "Create Alert"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
