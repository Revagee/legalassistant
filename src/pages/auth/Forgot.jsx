import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthAPI } from '../../lib/api.js'

export default function Forgot() {
    const navigate = useNavigate()
    const [info, setInfo] = useState('')
    const [error, setError] = useState('')
    const [resetLink, setResetLink] = useState('')
    const [loading, setLoading] = useState(false)

    async function onSubmit(ev) {
        ev.preventDefault()
        const form = ev.currentTarget
        const email = form.email.value
        setInfo('')
        setError('')
        setResetLink('')
        setLoading(true)
        try {
            const res = await AuthAPI.forgot(email)
            const message = res?.message || 'Якщо email існує, інструкції надіслано'
            setInfo(message)
            if (res?.reset_link) setResetLink(res.reset_link)
            try { sessionStorage.setItem('last_forgot_email', email) } catch (_) { }
            navigate('/auth/check-email', { state: { email } })
        } catch (e) {
            setError(e?.message || 'Не вдалося надіслати інструкції')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto max-w-md px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Відновлення пароля</h1>
            {info && <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{info}</div>}
            {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
            {resetLink && (
                <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">Тестове посилання для скидання: <a className="underline" href={resetLink}>{resetLink}</a></div>
            )}
            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <label className="text-sm font-semibold text-gray-900">Email
                    <input type="email" name="email" required disabled={loading} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <button type="submit" disabled={loading} className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-70">{loading ? 'Надсилання…' : 'Надіслати інструкції'}</button>
            </form>
        </div>
    )
}


