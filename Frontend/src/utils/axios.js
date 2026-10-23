import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
    withCredentials: true, // send/receive httpOnly cookies (refreshToken)
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach the in-memory access token to every request
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── In-memory token store ────────────────────────────────────────────────────
// Stored in memory (not localStorage) so it isn't accessible to XSS scripts.
let _accessToken = null;

export function setAccessToken(token) {
    _accessToken = token;
}

export function getAccessToken() {
    return _accessToken;
}

export function clearAccessToken() {
    _accessToken = null;
}

// ─── Refresh interceptor ─────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
    failedQueue.forEach((prom) =>
        error ? prom.reject(error) : prom.resolve(token)
    );
    failedQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthRequest = originalRequest?.url?.startsWith("/api/auth/");

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isAuthRequest
        ) {
            if (isRefreshing) {
                // Queue the request while a refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await api.get("/api/auth/refresh-token");
                setAccessToken(data.accessToken);
                processQueue(null, data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearAccessToken();
                // Redirect to login
                window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
