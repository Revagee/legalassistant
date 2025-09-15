import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AuthAPI, getStoredToken, setStoredToken } from './api.js'

const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    loading: true,
    login: async (_email, _password) => { },
    register: async (_name, _email, _password) => { },
    logout: async () => { },
    refresh: async () => { },
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
            setUser(data?.user || data || null)
            return data
        } catch (_) {
            setStoredToken('')
            setUser(null)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadMe()
    }, [loadMe])

    const login = useCallback(async (email, password) => {
        const data = await AuthAPI.login(email, password)
        setUser(data?.user || null)
        return data
    }, [])

    const register = useCallback(async (name, email, password) => {
        const data = await AuthAPI.register(name, email, password)
        setUser(data?.user || null)
        return data
    }, [])

    const logout = useCallback(async () => {
        await AuthAPI.logout()
        setUser(null)
    }, [])

    const value = useMemo(() => ({
        isAuthenticated: !!user,
        user,
        loading,
        login,
        register,
        logout,
        refresh: loadMe,
    }), [user, loading, login, register, logout, loadMe])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}


