import { useEffect, useMemo, useState } from "react";
import { getApiBaseUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Topbar() {
    const [now, setNow] = useState(() => new Date());
    const apiBaseUrl = getApiBaseUrl();
    const { user, logout } = useAuth();

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(new Date());
        }, 30000);

        return () => window.clearInterval(timer);
    }, []);

    const environment = useMemo(() => {
        if (apiBaseUrl.includes("localhost")) {
            return "Local API";
        }
        return "Remote API";
    }, [apiBaseUrl]);

    const formattedNow = useMemo(
        () =>
            new Intl.DateTimeFormat("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).format(now),
        [now]
    );

    return (
        <header className="topbar">
            <div className="topbar-status">
                <span className="material-symbols-outlined">database</span>
                <div className="topbar-status-copy">
                    <strong>{environment}</strong>
                    <span>{apiBaseUrl}</span>
                </div>
            </div>

            <div className="profile">
                <div className="profile-copy">
                    <span>{formattedNow}</span>
                    <strong>{user?.name || "Portfolio Desk"}</strong>
                </div>
                <div className="profile-icon">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
                </div>
                <button 
                    onClick={logout}
                    className="icon-button"
                    aria-label="Logout"
                    title="Logout"
                >
                    <span className="material-symbols-outlined">logout</span>
                </button>
            </div>
        </header>
    );
}

export default Topbar;
