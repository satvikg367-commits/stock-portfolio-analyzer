import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api, { getApiError } from "../services/api";

const sectors = [
    "Information Technology",
    "Financials",
    "Energy",
    "Healthcare",
    "Consumer Discretionary",
    "Industrials",
    "Materials",
    "Utilities",
    "FMCG",
];

const initialForm = {
    symbol: "",
    companyname: "",
    sector: "",
    currentprice: "",
};

function AddStock() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function updateField(event) {
        const { name, value } = event.target;
        setForm((currentForm) => ({
            ...currentForm,
            [name]: name === "symbol" ? value.toUpperCase() : value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsSaving(true);
        setError("");
        setSuccess("");

        try {
            await api.post("/stocks", {
                ...form,
                currentprice: Number(form.currentprice),
            });
            setSuccess("Stock added successfully.");
            setForm(initialForm);
            window.setTimeout(() => navigate("/stocks"), 700);
        } catch (saveError) {
            setError(getApiError(saveError, "Unable to add stock"));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="form-page wide-form">
            <section className="form-panel">
                <div className="form-panel-header">
                    <span className="eyebrow">Portfolio Management</span>
                    <h1>Add New Stock</h1>
                </div>

                {error ? <div className="alert alert-error">{error}</div> : null}
                {success ? <div className="alert alert-success">{success}</div> : null}

                <form className="form-grid two-column" onSubmit={handleSubmit}>
                    <label className="field">
                        <span>Symbol</span>
                        <div className="input-shell">
                            <span className="material-symbols-outlined">tag</span>
                            <input
                                name="symbol"
                                onChange={updateField}
                                placeholder="INFY"
                                required
                                type="text"
                                value={form.symbol}
                            />
                        </div>
                    </label>

                    <label className="field">
                        <span>Company Name</span>
                        <div className="input-shell">
                            <span className="material-symbols-outlined">domain</span>
                            <input
                                name="companyname"
                                onChange={updateField}
                                placeholder="Infosys Ltd."
                                required
                                type="text"
                                value={form.companyname}
                            />
                        </div>
                    </label>

                    <label className="field">
                        <span>Sector</span>
                        <div className="input-shell">
                            <span className="material-symbols-outlined">category</span>
                            <select
                                name="sector"
                                onChange={updateField}
                                required
                                value={form.sector}
                            >
                                <option value="">Select sector</option>
                                {sectors.map((sector) => (
                                    <option key={sector} value={sector}>
                                        {sector}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </label>

                    <label className="field">
                        <span>Current Price</span>
                        <div className="input-shell">
                            <span className="input-prefix">₹</span>
                            <input
                                min="0"
                                name="currentprice"
                                onChange={updateField}
                                placeholder="0.00"
                                required
                                step="0.01"
                                type="number"
                                value={form.currentprice}
                            />
                        </div>
                    </label>

                    <div className="form-actions form-actions-span">
                        <Link className="btn btn-secondary" to="/stocks">
                            <span className="material-symbols-outlined">close</span>
                            Cancel
                        </Link>
                        <button className="btn btn-primary" disabled={isSaving} type="submit">
                            <span className="material-symbols-outlined">
                                {isSaving ? "sync" : "arrow_forward"}
                            </span>
                            {isSaving ? "Saving" : "Add Stock"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default AddStock;
