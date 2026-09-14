import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import Holdings from "./pages/Holdings";
import Explore from "./pages/Explore";
import Stocks from "./pages/Stocks";
import AddStock from "./pages/AddStock";
import Transactions from "./pages/Transactions";
import RecordTransaction from "./pages/RecordTransaction";
import TransactionDetails from "./pages/TransactionDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import TickerTape from "./components/TickerTape";
import LiveMarketWatcher from "./components/LiveMarketWatcher";

import "./App.css";

function AppContent() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    return (
        <div className={isAuthPage ? "app-auth" : "app"}>
            <div className="app-layout">
                {!isAuthPage && <Sidebar />}
                <div className={isAuthPage ? "auth-main" : "main"}>
                    {!isAuthPage && (
                        <>
                            <LiveMarketWatcher />
                            <Topbar />
                            <TickerTape />
                        </>
                    )}
                    <main className={isAuthPage ? "" : "content"}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
                            <Route path="/holdings" element={<ProtectedRoute><Holdings /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/stocks" element={<ProtectedRoute><Stocks /></ProtectedRoute>} />
                        <Route path="/stocks/add" element={<ProtectedRoute><AddStock /></ProtectedRoute>} />
                        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                        <Route
                            path="/transactions/add"
                            element={<ProtectedRoute><RecordTransaction /></ProtectedRoute>}
                        />
                        <Route
                            path="/transactions/:id"
                            element={<ProtectedRoute><TransactionDetails /></ProtectedRoute>}
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster
                    closeButton
                    duration={4500}
                    position="top-right"
                    richColors
                    toastOptions={{ className: "spa-toast" }}
                />
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
