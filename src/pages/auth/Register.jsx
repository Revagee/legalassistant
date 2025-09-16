import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../lib/authContext.jsx'

export default function Register() {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const next = params.get('next') || ''
    const { register } = useAuth()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function onSubmit(ev) {
        ev.preventDefault()
        const form = ev.currentTarget
        const name = form.name.value
        const email = form.email.value
        const password = form.password.value
        const password2 = form.password2.value
        if (password !== password2) {
            setError('Паролі не збігаються')
            return
        }
        setError('')
        setLoading(true)
        try {
            const res = await register(name, email, password)
            // После регистрации ведём на CheckEmail, email передаём через state
            navigate('/auth/check-email', { state: { email } })
        } catch (e) {
            setError(e?.message || 'Помилка реєстрації')
        } finally {
            setLoading(false)
        }
        try { sessionStorage.setItem('last_forgot_email', form.email.value) } catch (_) { }
    }

    return (
        <div className="mx-auto max-w-md px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Реєстрація</h1>
            {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <label className="text-sm font-semibold text-gray-900">Ім'я
                    <input type="text" name="name" required disabled={loading} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <label className="text-sm font-semibold text-gray-900">Email
                    <input type="email" name="email" required disabled={loading} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <label className="text-sm font-semibold text-gray-900">Пароль
                    <input type="password" name="password" required disabled={loading} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <label className="text-sm font-semibold text-gray-900">Повторіть пароль
                    <input type="password" name="password2" required disabled={loading} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <button type="submit" disabled={loading} className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-70">{loading ? 'Створення…' : 'Створити акаунт'}</button>
            </form>
            <p className="mt-4 text-sm">Вже маєте акаунт? <a className="text-[var(--accent)] hover:underline" href={`/auth/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Увійти</a></p>
        </div>
    )
}


