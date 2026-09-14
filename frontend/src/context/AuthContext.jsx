import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../services/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "spa.auth.token";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const hasToken = typeof sessionStorage !== "undefined" && !!sessionStorage.getItem(TOKEN_KEY);
    const [isLoading, setIsLoading] = useState(hasToken);

    useEffect(() => {
        if (!hasToken) {
            return undefined;
        }
        api.get("/users/me", { silent: true }).then((response) => setUser(response.data))
            .catch(() => sessionStorage.removeItem(TOKEN_KEY)).finally(() => setIsLoading(false));
        return undefined;
    }, [hasToken]);

    const setSession = (response) => { sessionStorage.setItem(TOKEN_KEY, response.data.token); setUser(response.data.user); return response.data.user; };
    const login = async (email, password) => { const userData = setSession(await api.post("/auth/login", { email, password })); toast.success("Successfully logged in"); return userData; };
    const signup = async (email, password, name) => { const userData = setSession(await api.post("/auth/signup", { email, password, name })); toast.success("Account created successfully"); return userData; };
    const updateUser = (nextUser) => setUser(nextUser);
    const logout = () => { setUser(null); sessionStorage.removeItem(TOKEN_KEY); toast.info("Logged out successfully"); };
    return <AuthContext.Provider value={{ user, isLoading, login, signup, updateUser, logout }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used within an AuthProvider"); return context; }
