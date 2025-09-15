import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../lib/authContext.jsx'

export default function Login() {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const next = params.get('next') || ''
    const { login } = useAuth()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function onSubmit(ev) {
        ev.preventDefault()
        const form = ev.currentTarget
        const email = form.email.value
        const password = form.password.value
        setError('')
        setLoading(true)
        try {
            await login(email, password)
            navigate(next || '/account')
        } catch (e) {
            const msg = e?.message || 'Помилка входу'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto max-w-md px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>Вхід</h1>
            {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <label className="text-sm font-semibold text-gray-900">Email
                    <input type="email" name="email" required disabled={loading} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <label className="text-sm font-semibold text-gray-900">Пароль
                    <input type="password" name="password" required disabled={loading} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <button type="submit" disabled={loading} className="rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-70">{loading ? 'Вхід…' : 'Увійти'}</button>
            </form>
            <p className="mt-4 text-sm"><a className="text-[#1E3A8A] hover:underline" href="/forgot">Забули пароль?</a></p>
            <p className="mt-1 text-sm">Ще немає акаунта? <a className="text-[#1E3A8A] hover:underline" href={`/auth/register${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Зареєструватися</a></p>
        </div>
    )
}


