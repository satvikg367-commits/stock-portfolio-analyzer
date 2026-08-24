import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: `${apiBaseUrl}/api`,
});

import { toast } from "sonner";

export function getApiBaseUrl() {
    return apiBaseUrl;
}

export function getApiError(error, fallback = "Something went wrong") {
    const message = 
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error?.response?.data === 'string' ? error.response.data : null) ||
        error?.message ||
        fallback;
        
    // Sanitize technical Java/SQL errors for the end user
    if (typeof message === 'string' && (message.includes('java.') || message.includes('SQL') || message.includes('Exception'))) {
        return "A server error occurred. Please try again later.";
    }
    
    return message;
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.config?.silent) {
            const errorMsg = getApiError(error);
            if (error.code === "ERR_NETWORK") {
                toast.error("Backend server is unavailable. Please check your connection.");
            } else {
                toast.error(errorMsg);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
