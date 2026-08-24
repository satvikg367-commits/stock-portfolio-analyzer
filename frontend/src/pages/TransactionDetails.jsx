import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api, { getApiError } from "../services/api";
import {
    formatCurrency,
    formatDate,
    formatNumber,
    getInitials,
    getStockCompany,
} from "../utils/format";

function TransactionDetails() {
    const { id } = useParams();
    const [transaction, setTransaction] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        async function loadTransaction() {
            setIsLoading(true);
            setError("");

            try {
                const response = await api.get(`/transactions/${id}`);

                if (!ignore) {
                    setTransaction(response.data);
                }
            } catch (loadError) {
                if (!ignore) {
                    setError(getApiError(loadError, "Unable to load transaction"));
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadTransaction();

        return () => {
            ignore = true;
        };
    }, [id]);

    const value =
        Number(transaction?.quantity || 0) * Number(transaction?.price || 0);
    const isSell = transaction?.transactionType === "SELL";

    return (
        <div className="page-stack narrow-page">
            <div className="page-header page-header-row">
                <Link className="back-link" to="/transactions">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Transactions
                </Link>
            </div>

            {error ? <div className="alert alert-error">{error}</div> : null}

            <section className="detail-panel">
                {isLoading ? (
                    <div className="table-state">
                        <span className="material-symbols-outlined table-state-icon">
                            sync
                        </span>
                        Loading transaction...
                    </div>
                ) : transaction ? (
                    <>
                        <div className="detail-header">
                            <div>
                                <span className="eyebrow">Transaction Details</span>
                                <h1>Order #{transaction.id}</h1>
                                <span className="muted">
                                    {formatDate(transaction.transactionDate)}
                                </span>
                            </div>
                            <span
                                className={`badge ${
                                    isSell ? "badge-danger" : "badge-success"
                                }`}
                            >
                                {transaction.transactionType} Order
                            </span>
                        </div>

                        <div className="detail-grid">
                            <div className="detail-item">
                                <span>Investor Profile</span>
                                <div className="identity-cell">
                                    <span className="avatar">
                                        {getInitials(transaction.user?.name)}
                                    </span>
                                    <div>
                                        <strong>{transaction.user?.name || "-"}</strong>
                                        <small>{transaction.user?.email || "-"}</small>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-item">
                                <span>Asset Information</span>
                                <div>
                                    <strong>{transaction.stock?.symbol || "-"}</strong>
                                    <small>{getStockCompany(transaction.stock)}</small>
                                </div>
                            </div>
                        </div>

                        <div className="execution-strip">
                            <div>
                                <span>Quantity</span>
                                <strong>{formatNumber(transaction.quantity)} shares</strong>
                            </div>
                            <div>
                                <span>Execution Price</span>
                                <strong>{formatCurrency(transaction.price)}</strong>
                            </div>
                            <div>
                                <span>Total Value</span>
                                <strong>{formatCurrency(value)}</strong>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="table-state">Transaction not found.</div>
                )}
            </section>
        </div>
    );
}

export default TransactionDetails;
