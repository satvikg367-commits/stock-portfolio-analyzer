import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mock checking for existing session
        const storedUser = localStorage.getItem("spa.auth.user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from local storage");
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        // Mock login
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password) {
                    const mockUser = { id: 1, name: email.split("@")[0], email };
                    setUser(mockUser);
                    localStorage.setItem("spa.auth.user", JSON.stringify(mockUser));
                    toast.success("Successfully logged in");
                    resolve(mockUser);
                } else {
                    reject(new Error("Invalid credentials"));
                }
            }, 1000);
        });
    };

    const loginWithGoogle = async () => {
        // Mock Google Login
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockUser = { id: 2, name: "Google User", email: "user@gmail.com" };
                setUser(mockUser);
                localStorage.setItem("spa.auth.user", JSON.stringify(mockUser));
                toast.success("Successfully logged in with Google");
                resolve(mockUser);
            }, 1000);
        });
    };

    const signup = async (email, password, name) => {
        // Mock signup
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password && name) {
                    const mockUser = { id: 3, name, email };
                    setUser(mockUser);
                    localStorage.setItem("spa.auth.user", JSON.stringify(mockUser));
                    toast.success("Account created successfully");
                    resolve(mockUser);
                } else {
                    reject(new Error("Please fill in all fields"));
                }
            }, 1000);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("spa.auth.user");
        toast.info("Logged out successfully");
    };

    const value = {
        user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
