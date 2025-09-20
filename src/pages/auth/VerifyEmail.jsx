import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthAPI } from '../../lib/api.js'

export default function VerifyEmail() {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const token = params.get('token') || ''
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const handled = useRef(false)

    useEffect(() => {
        // Защита от двойного вызова эффекта в React 18 Strict Mode
        if (handled.current) return
        handled.current = true

        setLoading(true)
        setError('')
        AuthAPI.verifyEmail(token)
            .then(() => {
                // На любой успешный ответ переходим на страницу успеха
                navigate('/auth/verify-success', { replace: true })
            })
            .catch((e) => {
                setError(e?.message || 'Не вдалося підтвердити email')
            })
            .finally(() => {
                setLoading(false)
            })
    }, [token, navigate])

    return (
        <div className="mx-auto max-w-md px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Підтвердження email</h1>
            {error ? (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
            ) : (
                <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{loading ? 'Перевіряємо посилання…' : 'Готово'}</div>
            )}
            {!loading && error && (
                <div className="mt-6 grid gap-3">
                    <a href="/auth/login" className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95">Перейти до входу</a>
                </div>
            )}
        </div>
    )
}


