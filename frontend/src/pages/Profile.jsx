import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "sonner";
import { getApiError } from "../services/api";

export default function Profile() {
    const { user, login } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [isUpdating, setIsUpdating] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        
        async function fetchUserTransactions() {
            try {
                const res = await api.get("/transactions");
                const userTx = (res.data || []).filter(t => t.user?.id === user.id);
                setTransactions(userTx);
            } catch (err) {
                console.error("Failed to load user transactions for stats");
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchUserTransactions();
    }, [user?.id]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            // If the user has a real DB ID, try updating it in the backend
            if (user?.id && String(user.id).length < 5) {
                await api.put(`/users/${user.id}`, { name, email, password: user.password || "123456" });
            }
            
            // Re-login to update context (mock)
            await login(email, "123456");
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(getApiError(error, "Failed to update profile"));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleExportData = () => {
        if (!transactions.length) {
            toast.info("You don't have any transactions to export.");
            return;
        }

        const headers = ["ID", "Stock Symbol", "Transaction Type", "Quantity", "Price", "Date"];
        const rows = transactions.map(t => [
            t.id,
            t.stock?.symbol || "Unknown",
            t.transactionType,
            t.quantity,
            t.price,
            t.transactionDate
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\\n" 
            + rows.map(e => e.join(",")).join("\\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `transactions_${user?.name || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Data exported successfully!");
    };

    return (
        <div className="page-stack">
            <div className="page-header page-header-row">
                <div>
                    <span className="eyebrow">Account</span>
                    <h1>Profile & Settings</h1>
                </div>
            </div>

            <div className="profile-layout">
                {/* Left side: Profile Info & Stats */}
                <div className="profile-sidebar">
                    <div className="panel profile-card">
                        <div className="profile-card-avatar">
                            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <h3>{user?.name || "User"}</h3>
                        <p>{user?.email || "No email provided"}</p>
                        
                        <div className="profile-stats">
                            <div className="stat-item">
                                <span>Lifetime Trades</span>
                                <strong>{isLoading ? "-" : transactions.length}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: Settings Forms */}
                <div className="profile-content">
                    <section className="panel">
                        <div className="panel-header">
                            <div>
                                <h2>General Information</h2>
                                <span className="panel-meta">Update your personal details</span>
                            </div>
                        </div>
                        <div className="panel-body">
                            <form onSubmit={handleUpdateProfile} className="settings-form">
                                <label className="field">
                                    <span>Full Name</span>
                                    <div className="input-shell">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </label>
                                <label className="field">
                                    <span>Email Address</span>
                                    <div className="input-shell">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </label>
                                <div className="form-actions">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>

                    <section className="panel">
                        <div className="panel-header">
                            <div>
                                <h2>Data Management</h2>
                                <span className="panel-meta">Export or download your account data</span>
                            </div>
                        </div>
                        <div className="panel-body">
                            <p style={{ margin: '0 0 16px', color: 'var(--muted)' }}>
                                You can download a complete log of all your transactions (buy/sell history) as a CSV file to open in Excel or Sheets.
                            </p>
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={handleExportData}
                                disabled={isLoading}
                            >
                                <span className="material-symbols-outlined">download</span>
                                Export Transactions to CSV
                            </button>
                        </div>
                    </section>

                    <section className="panel border-danger">
                        <div className="panel-header">
                            <div>
                                <h2 className="text-danger">Danger Zone</h2>
                                <span className="panel-meta">Irreversible account actions</span>
                            </div>
                        </div>
                        <div className="panel-body">
                            <div className="danger-action">
                                <div>
                                    <strong>Delete Account</strong>
                                    <p>Permanently remove your account and all data. This cannot be undone.</p>
                                </div>
                                <button 
                                    type="button" 
                                    className="btn btn-danger"
                                    onClick={() => toast.error("This is a demo. Account deletion is disabled.")}
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
