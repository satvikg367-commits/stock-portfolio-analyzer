import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api, { downloadFile, getApiError } from "../services/api";
import { toast } from "sonner";

export default function Profile() {
    const { user, updateUser, logout } = useAuth();
    
    // Profile Edit
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Change Password
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Stats
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [stats, setStats] = useState({
        totalInvested: 0,
        currentValue: 0,
        totalProfitLoss: 0,
        holdingsCount: 0,
        transactionsCount: 0
    });

    useEffect(() => {
        if (user) {
            async function update() { setName(user.name || ""); setEmail(user.email || ""); } update();
            
        }
    }, [user]);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [txRes, portRes] = await Promise.all([
                    api.get("/transactions"),
                    api.get("/portfolio")
                ]);
                const txCount = txRes.data.length;
                const holdings = portRes.data;
                const totalInvested = holdings.reduce((sum, h) => sum + h.investedValue, 0);
                const currentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
                const totalProfitLoss = currentValue - totalInvested;
                setStats({
                    totalInvested,
                    currentValue,
                    totalProfitLoss,
                    holdingsCount: holdings.length,
                    transactionsCount: txCount
                });
            } catch (e) {
                console.error("Failed to load stats", e);
            } finally {
                setIsLoadingStats(false);
            }
        }
        fetchStats();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const response = await api.put("/users/me", { name, email });
            updateUser(response.data);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(getApiError(error, "Failed to update profile"));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error("New passwords do not match!");
        }
        setIsChangingPassword(true);
        try {
            const response = await api.put("/users/me/password", { currentPassword, newPassword });
            updateUser(response.data);
            toast.success("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            toast.error(getApiError(error, "Failed to change password"));
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleExportCsv = async () => {
        await downloadFile('/users/me/export/transactions/csv', 'stock-portfolio-transactions.csv');
    };

    const handleExportExcel = async () => {
        await downloadFile('/users/me/export/portfolio/excel', 'stock-portfolio-report.xlsx');
    };

    const formatCurrency = (value) => 
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

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
                        <p className="text-muted" style={{fontSize: '12px', marginTop: '8px'}}>User ID: {user?.id}</p>
                        
                        <div className="profile-stats">
                            <div className="stat-item">
                                <span>Total Invested</span>
                                <strong>{isLoadingStats ? "-" : formatCurrency(stats.totalInvested)}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Current Value</span>
                                <strong>{isLoadingStats ? "-" : formatCurrency(stats.currentValue)}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Profit/Loss</span>
                                <strong className={stats.totalProfitLoss >= 0 ? "text-success" : "text-danger"}>
                                    {isLoadingStats ? "-" : formatCurrency(stats.totalProfitLoss)}
                                </strong>
                            </div>
                            <div className="stat-item">
                                <span>Active Holdings</span>
                                <strong>{isLoadingStats ? "-" : stats.holdingsCount}</strong>
                            </div>
                            <div className="stat-item">
                                <span>Total Transactions</span>
                                <strong>{isLoadingStats ? "-" : stats.transactionsCount}</strong>
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
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                                    </div>
                                </label>
                                <label className="field">
                                    <span>Email Address</span>
                                    <div className="input-shell">
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                </label>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                                        {isUpdating ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>

                    <section className="panel">
                        <div className="panel-header">
                            <div>
                                <h2>Security</h2>
                                <span className="panel-meta">Update your password</span>
                            </div>
                        </div>
                        <div className="panel-body">
                            <form onSubmit={handleChangePassword} className="settings-form">
                                <label className="field">
                                    <span>Current Password</span>
                                    <div className="input-shell">
                                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                                    </div>
                                </label>
                                <label className="field">
                                    <span>New Password</span>
                                    <div className="input-shell">
                                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                                    </div>
                                </label>
                                <label className="field">
                                    <span>Confirm New Password</span>
                                    <div className="input-shell">
                                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
                                    </div>
                                </label>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={isChangingPassword}>
                                        {isChangingPassword ? "Changing..." : "Change Password"}
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
                                You can download a complete log of all your transactions (buy/sell history) as a CSV file or a full portfolio summary as an Excel document.
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" className="btn btn-secondary" onClick={handleExportCsv}>
                                    <span className="material-symbols-outlined">download</span>
                                    Export Transactions CSV
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={handleExportExcel}>
                                    <span className="material-symbols-outlined">download</span>
                                    Export Portfolio Excel
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="panel border-danger">
                        <div className="panel-header">
                            <div>
                                <h2 className="text-danger">Logout</h2>
                                <span className="panel-meta">End your current session</span>
                            </div>
                        </div>
                        <div className="panel-body">
                            <div className="danger-action">
                                <div>
                                    <strong>Sign Out</strong>
                                    <p>Securely log out of your account on this device.</p>
                                </div>
                                <button type="button" className="btn btn-danger" onClick={logout}>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
