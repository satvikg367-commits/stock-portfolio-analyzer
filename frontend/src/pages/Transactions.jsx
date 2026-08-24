import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import DataTable from "../components/DataTable";
import StatCard from "../components/StatCard";
import api, { getApiError } from "../services/api";
import {
    formatCurrency,
    formatDate,
    formatNumber,
    getInitials,
    getStockCompany,
} from "../utils/format";

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("date-desc");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadTransactions = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const response = await api.get("/transactions");
            setTransactions(response.data || []);
        } catch (loadError) {
            setError(getApiError(loadError, "Unable to load transactions"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    async function handleDelete(transactionId) {
        setError("");

        const shouldDelete = window.confirm(
            `Delete transaction #${transactionId}? This action cannot be undone.`
        );

        if (!shouldDelete) {
            return;
        }

        try {
            await api.delete(`/transactions/${transactionId}`);
            setTransactions((currentTransactions) =>
                currentTransactions.filter(
                    (transaction) => transaction.id !== transactionId
                )
            );
        } catch (deleteError) {
            setError(getApiError(deleteError, "Unable to delete transaction"));
        }
    }

    const visibleTransactions = useMemo(() => {
        const normalizedQuery = searchText.trim().toLowerCase();

        const filteredTransactions = transactions.filter((transaction) => {
            const matchesQuery = !normalizedQuery
                || [
                    String(transaction.id),
                    transaction.user?.name,
                    transaction.stock?.symbol,
                    getStockCompany(transaction.stock),
                ]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(normalizedQuery));
            const matchesType =
                typeFilter === "ALL" || transaction.transactionType === typeFilter;

            return matchesQuery && matchesType;
        });

        return [...filteredTransactions].sort((a, b) => {
            if (sortBy === "value-desc") {
                return Number(b.quantity) * Number(b.price) - Number(a.quantity) * Number(a.price);
            }

            if (sortBy === "value-asc") {
                return Number(a.quantity) * Number(a.price) - Number(b.quantity) * Number(b.price);
            }

            if (sortBy === "date-asc") {
                return String(a.transactionDate || "").localeCompare(String(b.transactionDate || ""));
            }

            return String(b.transactionDate || "").localeCompare(String(a.transactionDate || ""));
        });
    }, [searchText, sortBy, transactions, typeFilter]);

    const buyOrders = transactions.filter(t => t.transactionType === 'BUY').length;
    const sellOrders = transactions.filter(t => t.transactionType === 'SELL').length;
    const totalTradedValue = transactions.reduce((sum, t) => sum + (Number(t.quantity) * Number(t.price)), 0);
    
    const transactionActivityData = useMemo(() => {
        const dailyTotals = transactions.reduce((acc, t) => {
            if (!t.transactionDate) return acc;
            const date = new Date(t.transactionDate).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + (Number(t.quantity) * Number(t.price));
            return acc;
        }, {});
        
        return Object.entries(dailyTotals)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-14)
            .map(([date, amount]) => ({
                date: new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric" }).format(new Date(date)),
                amount
            }));
    }, [transactions]);

    const columns = [
        {
            key: "id",
            header: "ID",
            render: (transaction) => (
                <Link className="table-link" to={`/transactions/${transaction.id}`}>
                    #{transaction.id}
                </Link>
            ),
        },
        {
            key: "user",
            header: "User",
            render: (transaction) => (
                <span className="identity-cell">
                    <span className="avatar avatar-sm">
                        {getInitials(transaction.user?.name)}
                    </span>
                    {transaction.user?.name || "-"}
                </span>
            ),
        },
        {
            key: "stock",
            header: "Stock",
            render: (transaction) => (
                <span className="ticker-cell">
                    <strong>{transaction.stock?.symbol || "-"}</strong>
                    <span>{getStockCompany(transaction.stock)}</span>
                </span>
            ),
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
            key: "value",
            header: "Value",
            align: "right",
            render: (transaction) =>
                formatCurrency(Number(transaction.quantity) * Number(transaction.price)),
        },
        {
            key: "transactionType",
            header: "Type",
            render: (transaction) => (
                <span
                    className={`badge ${transaction.transactionType === "SELL" ? "badge-danger" : "badge-success"
                        }`}
                >
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
        {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (transaction) => (
                <div className="row-actions">
                    <Link
                        aria-label={`Open transaction ${transaction.id}`}
                        className="icon-button"
                        to={`/transactions/${transaction.id}`}
                    >
                        <span className="material-symbols-outlined">open_in_new</span>
                    </Link>
                    <button
                        aria-label={`Delete transaction ${transaction.id}`}
                        className="icon-button danger"
                        onClick={() => handleDelete(transaction.id)}
                        type="button"
                    >
                        <span className="material-symbols-outlined">delete</span>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="page-stack">
            <div className="page-header page-header-row">
                <div>
                    <span className="eyebrow">Ledger</span>
                    <h1>Transactions</h1>
                </div>
                <Link className="btn btn-primary" to="/transactions/add">
                    <span className="material-symbols-outlined">add</span>
                    Add Transaction
                </Link>
            </div>

            {error ? <div className="alert alert-error">{error}</div> : null}

            <section className="stats-grid">
                <StatCard
                    hint="Since inception"
                    icon="receipt_long"
                    label="Total Transactions"
                    value={formatNumber(transactions.length)}
                />
                <StatCard
                    hint={`${(buyOrders / (transactions.length || 1) * 100).toFixed(0)}% of trades`}
                    icon="south_west"
                    label="Buy Orders"
                    value={formatNumber(buyOrders)}
                />
                <StatCard
                    hint={`${(sellOrders / (transactions.length || 1) * 100).toFixed(0)}% of trades`}
                    icon="north_east"
                    label="Sell Orders"
                    value={formatNumber(sellOrders)}
                />
                <StatCard
                    hint="Gross traded value"
                    icon="swap_horiz"
                    label="Total Traded Value"
                    value={formatCurrency(totalTradedValue)}
                />
            </section>

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <span className="eyebrow">Activity</span>
                        <h2>Transaction Volume</h2>
                        <span className="panel-meta">Last 14 sessions by traded value</span>
                    </div>
                </div>
                <div className="chart-frame">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={transactionActivityData}>
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: 'var(--muted)' }} 
                                dy={10} 
                            />
                            <YAxis 
                                hide 
                            />
                            <Tooltip
                                cursor={{ fill: 'var(--surface-soft)' }}
                                formatter={(value) => [formatCurrency(value), 'Traded Value']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar 
                                dataKey="amount" 
                                fill="var(--blue)" 
                                radius={[4, 4, 0, 0]} 
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section className="panel">
                <div className="panel-header">
                    <div>
                        <span className="eyebrow">Orders</span>
                        <h2>Trade Activity</h2>
                    </div>
                    <div className="panel-controls">
                        <label className="field compact-field">
                            <span>Search</span>
                            <div className="input-shell compact-shell">
                                <span className="material-symbols-outlined">search</span>
                                <input
                                    onChange={(event) => setSearchText(event.target.value)}
                                    placeholder="ID, user or stock"
                                    type="text"
                                    value={searchText}
                                />
                            </div>
                        </label>
                        <label className="field compact-field">
                            <span>Type</span>
                            <select onChange={(event) => setTypeFilter(event.target.value)} value={typeFilter}>
                                <option value="ALL">All Types</option>
                                <option value="BUY">BUY</option>
                                <option value="SELL">SELL</option>
                            </select>
                        </label>
                        <label className="field compact-field">
                            <span>Sort</span>
                            <select onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
                                <option value="date-desc">Date Newest</option>
                                <option value="date-asc">Date Oldest</option>
                                <option value="value-desc">Value High-Low</option>
                                <option value="value-asc">Value Low-High</option>
                            </select>
                        </label>
                        <button className="btn btn-secondary" onClick={loadTransactions} type="button">
                            <span className="material-symbols-outlined">refresh</span>
                            Refresh
                        </button>
                    </div>
                </div>
                <DataTable
                    columns={columns}
                    data={visibleTransactions}
                    emptyMessage="No transactions available."
                    isLoading={isLoading}
                />
                <div className="panel-footer">
                    Showing {formatNumber(visibleTransactions.length)} of {formatNumber(transactions.length)} transactions
                </div>
            </section>
        </div>
    );
}

export default Transactions;
