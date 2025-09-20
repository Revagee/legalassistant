import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AuthAPI, getStoredToken, setStoredToken, setStoredRefreshToken } from './api.js'

const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    loading: true,
    login: async () => { },
    register: async () => { },
    logout: async () => { },
    refresh: async () => { },
    updateUser: () => { },
})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const loadMe = useCallback(async () => {
        const token = getStoredToken()
        if (!token) {
            setUser(null)
            setLoading(false)
            return null
        }
        try {
            setLoading(true)
            const data = await AuthAPI.me()
            // Backend may return { id, email, name, created_at } or { user: { ... } }
            const me = data?.user || data || null
            setUser(me)
            return me
        } catch {
            setStoredToken('')
            setStoredRefreshToken('')
            setUser(null)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadMe()
    }, [loadMe])

    // Auto refresh every 1 hour while page is open
    useEffect(() => {
        const HOUR_MS = 60 * 60 * 1000
        let intervalId = null
        async function tick() {
            try {
                const res = await AuthAPI.refresh()
                // if backend returns new tokens, persist them
                if (res?.access_token) setStoredToken(res.access_token)
                if (res?.refresh_token) setStoredRefreshToken(res.refresh_token)
                // refresh profile optionally
                await loadMe()
            } catch {
                // on refresh failure, clear session silently
                setStoredToken('')
                setStoredRefreshToken('')
                setUser(null)
            }
        }
        // start timer only if there is a token
        if (getStoredToken()) {
            intervalId = setInterval(tick, HOUR_MS)
            // also run once on mount to extend session if close to expiry
            tick().catch(() => { })
        }
        return () => { if (intervalId) clearInterval(intervalId) }
    }, [loadMe])

    const login = useCallback(async (email, password) => {
        // /auth/login returns tokens; token is stored by AuthAPI.login
        await AuthAPI.login(email, password)
        // Immediately fetch current user
        const me = await loadMe()
        return { user: me }
    }, [loadMe])

    const register = useCallback(async (name, email, password) => {
        // Registration should not auto-login; some backends require email verification first
        const data = await AuthAPI.register(name, email, password)
        // If backend auto-issued token, refresh the user; otherwise keep unauthenticated
        try {
            if (getStoredToken()) await loadMe()
        } catch { /* ignore */ }
        return data
    }, [loadMe])

    const logout = useCallback(async () => {
        await AuthAPI.logout()
        setUser(null)
    }, [])

    const manualRefresh = useCallback(async () => {
        const res = await AuthAPI.refresh()
        if (res?.access_token) setStoredToken(res.access_token)
        if (res?.refresh_token) setStoredRefreshToken(res.refresh_token)
        return loadMe()
    }, [loadMe])

    const updateUser = useCallback((partial) => {
        setUser((prev) => ({ ...(prev || {}), ...(partial || {}) }))
    }, [])

    const value = useMemo(() => ({
        isAuthenticated: !!user,
        user,
        loading,
        login,
        register,
        logout,
        refresh: manualRefresh,
        updateUser,
    }), [user, loading, login, register, logout, manualRefresh, updateUser])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    return useContext(AuthContext)
}


