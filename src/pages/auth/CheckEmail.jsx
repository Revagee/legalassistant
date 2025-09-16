import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function CheckEmail() {
    const navigate = useNavigate()
    const location = useLocation()
    const [email, setEmail] = useState('')

    useEffect(() => {
        try {
            const stateEmail = location?.state?.email
            if (stateEmail && typeof stateEmail === 'string') {
                setEmail(stateEmail)
                sessionStorage.setItem('last_forgot_email', stateEmail)
            } else {
                const stored = sessionStorage.getItem('last_forgot_email') || ''
                setEmail(stored)
            }
        } catch {
            // ignore
        }
    }, [location])

    function goToLogin() {
        navigate('/auth/login')
    }

    return (
        <div className="mx-auto max-w-md px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Перевірте пошту</h1>
            <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                Ми надіслали інструкції для скидання пароля на {email ? (<strong>{email}</strong>) : ('вказану адресу електронної пошти')}. Якщо листа немає, перевірте папку «Спам» або зачекайте кілька хвилин.
            </div>
            <div className="mt-6 grid gap-3">
                <button onClick={goToLogin} className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95">Повернутися до входу</button>
                <p className="text-xs text-gray-500">Вже отримали лист? Перейдіть за посиланням з листа, щоб встановити новий пароль.</p>
            </div>
        </div>
    )
}



