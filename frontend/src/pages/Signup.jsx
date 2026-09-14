import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import api, { getApiError } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }
        if (!email.trim()) {
            toast.error("Email cannot be empty");
            return;
        }
        if (!password) {
            toast.error("Password cannot be empty");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post("/auth/signup", { name, email, password });
            toast.success("Account created successfully. Please sign in.");
            navigate("/login", { replace: true });
        } catch (error) {
            toast.error(getApiError(error, "Failed to create account"));
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
                    <h2>Create an account</h2>
                    <p>Enter your details to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label className="field">
                        <span>Full Name</span>
                        <div className="input-shell">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </label>

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

                    <label className="field">
                        <span>Confirm Password</span>
                        <div className="input-shell">
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                    
                    <div style={{ marginTop: "16px", textAlign: "center" }}>
                        <span className="muted">Already have an account? </span>
                        <Link to="/login" style={{ color: "var(--blue)", fontWeight: 500 }}>Sign in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
