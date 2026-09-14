import axios from "axios";
import { toast } from "sonner";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: `${apiBaseUrl}/api`,
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("spa.auth.token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
        
    if (typeof message === 'string' && (message.includes('java.') || message.includes('SQL') || message.includes('Exception'))) {
        return "A server error occurred. Please try again later.";
    }
    
    return message;
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config?.url?.startsWith("/auth/")) {
            sessionStorage.removeItem("spa.auth.token");
            window.location.href = "/login";
        }
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

export async function downloadFile(url, filename) {
    try {
        const response = await api.get(url, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        toast.error("Failed to download file");
        throw error;
    }
}
