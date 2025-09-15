import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthAPI } from '../../lib/api.js'

export default function Reset() {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const token = params.get('token') || ''
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    async function onSubmit(ev) {
        ev.preventDefault()
        const form = ev.currentTarget
        const password = form.password.value
        const password2 = form.password2.value
        if (password !== password2) {
            setError('Паролі не збігаються')
            return
        }
        setError('')
        setLoading(true)
        try {
            await AuthAPI.reset(token, password)
            setDone(true)
            setTimeout(() => navigate('/ui/auth/login'), 1200)
        } catch (e) {
            setError(e?.message || 'Не вдалося оновити пароль')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto max-w-md px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>Скидання пароля</h1>
            {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
            {done && <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">Пароль оновлено</div>}
            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <input type="hidden" name="token" value={token} />
                <label className="text-sm font-semibold text-gray-900">Новий пароль
                    <input type="password" name="password" required disabled={loading} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <label className="text-sm font-semibold text-gray-900">Повторіть пароль
                    <input type="password" name="password2" required disabled={loading} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <button type="submit" disabled={loading} className="rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-70">{loading ? 'Оновлення…' : 'Оновити пароль'}</button>
            </form>
        </div>
    )
}


