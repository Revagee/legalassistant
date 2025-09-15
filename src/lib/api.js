// Lightweight API client with base URL and Authorization header handling

const DEFAULT_BASE_URL = 'https://legal-ai-api-35dc5cd4fd8d.herokuapp.com';

function getBaseUrl() {
    try {
        const envUrl = import.meta?.env?.VITE_API_URL;
        return (envUrl && String(envUrl).trim()) || DEFAULT_BASE_URL;
    } catch (_) {
        return DEFAULT_BASE_URL;
    }
}

export function getStoredToken() {
    try {
        return localStorage.getItem('auth_token') || '';
    } catch (_) {
        return '';
    }
}

export function setStoredToken(token) {
    try {
        if (!token) localStorage.removeItem('auth_token');
        else localStorage.setItem('auth_token', token);
    } catch (_) { /* ignore */ }
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
    } catch (_) {
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

// Auth endpoints
export const AuthAPI = {
    async login(email, password) {
        const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
        // Expected: { token, user }
        if (data && data.token) setStoredToken(data.token);
        return data;
    },
    async register(name, email, password) {
        const data = await apiRequest('/auth/register', { method: 'POST', body: { name, email, password } });
        if (data && data.token) setStoredToken(data.token);
        return data;
    },
    async forgot(email) {
        return apiRequest('/auth/forgot', { method: 'POST', body: { email } });
    },
    async reset(token, password) {
        return apiRequest('/auth/reset', { method: 'POST', body: { token, password } });
    },
    async me() {
        return apiRequest('/auth/me', { method: 'GET' });
    },
    async logout() {
        try { await apiRequest('/auth/logout', { method: 'POST' }); } catch (_) { /* ignore */ }
        setStoredToken('');
    }
};


