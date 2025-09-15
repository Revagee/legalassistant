// Lightweight API client with base URL and Authorization header handling

const DEFAULT_BASE_URL = 'https://legal-ai-api-35dc5cd4fd8d.herokuapp.com';

function getBaseUrl() {
    try {
        const envUrl = import.meta?.env?.VITE_API_URL;
        if (envUrl && String(envUrl).trim()) return String(envUrl).trim();
        // In production, prefer same-origin proxy to avoid CORS
        if (typeof window !== 'undefined') {
            const host = window.location?.hostname || '';
            const isLocalhost = host === 'localhost' || host === '127.0.0.1';
            return isLocalhost ? DEFAULT_BASE_URL : '/api';
        }
        return DEFAULT_BASE_URL;
    } catch {
        return DEFAULT_BASE_URL;
    }
}

export function getStoredToken() {
    try {
        return localStorage.getItem('auth_token') || '';
    } catch {
        return '';
    }
}

export function setStoredToken(token) {
    try {
        if (!token) localStorage.removeItem('auth_token');
        else localStorage.setItem('auth_token', token);
    } catch { /* ignore */ }
}

export function getStoredRefreshToken() {
    try {
        return localStorage.getItem('refresh_token') || ''
    } catch {
        return ''
    }
}

export function setStoredRefreshToken(token) {
    try {
        if (!token) localStorage.removeItem('refresh_token')
        else localStorage.setItem('refresh_token', token)
    } catch { /* ignore */ }
}

export async function apiRequest(path, options = {}) {
    const baseUrl = getBaseUrl();
    const url = path.startsWith('http') ? path : `${baseUrl}${path}`;

    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const token = getStoredToken();
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const fetchOptions = {
        method: options.method || 'GET',
        headers,
        body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
        credentials: options.credentials || 'omit',
        mode: options.mode || 'cors',
    };

    const res = await fetch(url, fetchOptions);
    const contentType = res.headers.get('Content-Type') || '';
    let data = null;
    try {
        if (contentType.includes('application/json')) data = await res.json();
        else data = await res.text();
    } catch {
        // ignore parse errors
    }

    if (!res.ok) {
        const message = (data && (data.message || data.error || data.detail)) || `HTTP ${res.status}`;
        const error = new Error(String(message));
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
}

// Normalize auth responses coming from backend
function extractAccessToken(data) {
    if (!data) return '';
    if (data.access_token) return String(data.access_token);
    if (data.token) return String(data.token);
    if (data.data?.access_token) return String(data.data.access_token);
    return '';
}

function extractRefreshToken(data) {
    if (!data) return ''
    if (data.refresh_token) return String(data.refresh_token)
    if (data.data?.refresh_token) return String(data.data.refresh_token)
    return ''
}

// Auth endpoints
export const AuthAPI = {
    async login(email, password) {
        const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
        const accessToken = extractAccessToken(data);
        const refreshToken = extractRefreshToken(data);
        if (accessToken) setStoredToken(accessToken);
        if (refreshToken) setStoredRefreshToken(refreshToken)
        return data;
    },
    async register(name, email, password) {
        const data = await apiRequest('/auth/register', { method: 'POST', body: { name, email, password } });
        const accessToken = extractAccessToken(data);
        const refreshToken = extractRefreshToken(data);
        if (accessToken) setStoredToken(accessToken);
        if (refreshToken) setStoredRefreshToken(refreshToken)
        return data;
    },
    async forgot(email) {
        return apiRequest('/auth/forgot-password', { method: 'POST', body: { email } });
    },
    async reset(token, password) {
        return apiRequest('/auth/reset-password', { method: 'POST', body: { token, new_password: password } });
    },
    async me() {
        return apiRequest('/auth/me', { method: 'GET' });
    },
    async verifyEmail(token) {
        const query = token ? `?token=${encodeURIComponent(token)}` : ''
        return apiRequest(`/auth/verify-email${query}`, { method: 'GET' })
    },
    async refresh() {
        const refreshToken = getStoredRefreshToken()
        return apiRequest('/auth/refresh', { method: 'POST', body: { refresh_token: refreshToken } })
    },
    async logout() {
        try { await apiRequest('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
        setStoredToken('');
        setStoredRefreshToken('');
    }
};


