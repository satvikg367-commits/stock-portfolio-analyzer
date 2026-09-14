import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch {
            toast.error("Invalid credentials");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo auth-logo">
                        <span className="material-symbols-outlined">monitoring</span>
                        Stock Analyzer
                    </div>
                    <h2>Welcome back</h2>
                    <p>Enter your credentials to access your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label className="field">
                        <span>Email address</span>
                        <div className="input-shell">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </label>

                    <label className="field">
                        <span>Password</span>
                        <div className="input-shell">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </label>

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                    
                    <div style={{ marginTop: "16px", textAlign: "center" }}>
                        <span className="muted">Don't have an account? </span>
                        <Link to="/signup" style={{ color: "var(--blue)", fontWeight: 500 }}>Create account</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
