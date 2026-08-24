import { NavLink } from "react-router-dom";

const navItems = [
    { to: "/", label: "Dashboard", icon: "dashboard" },
    { to: "/holdings", label: "Holdings", icon: "account_balance_wallet" },
    { to: "/explore", label: "Explore", icon: "explore" },
    { to: "/users", label: "Users", icon: "group" },
    { to: "/stocks", label: "Stocks", icon: "show_chart" },
    { to: "/transactions", label: "Transactions", icon: "receipt_long" },
];

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="logo">
                <span className="material-symbols-outlined">monitoring</span>
                <span>Stock Analyzer</span>
            </div>

            <nav>
                {navItems.map((item) => (
                    <NavLink
                        className={({ isActive }) =>
                            `nav-item${isActive ? " active" : ""}`
                        }
                        key={item.to}
                        to={item.to}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;
