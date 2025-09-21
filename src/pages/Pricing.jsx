import { useState, useEffect } from 'react'
import { PaymentAPI } from '../lib/api.js'

export default function Pricing() {
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        PaymentAPI.getPlans()
            .then(data => {
                // Сервер возвращает объект с полем plans
                setPlans(data?.plans || [])
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [])

    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Ціни</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Актуальні тарифи на послуги</p>

            <div className="mt-6 space-y-4" style={{ color: 'var(--ink)' }}>
                {loading && (
                    <div className="text-sm text-gray-600">Завантаження тарифів...</div>
                )}

                {error && (
                    <div className="text-sm text-red-600">Помилка: {error}</div>
                )}

                {!loading && !error && plans.map((p, i) => (
                    <div key={p.id || i} className="rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>{p.name}</div>
                            <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                                {p.amount === 0 ? 'Безкоштовно' : `${p.amount} ${p.currency}`}
                                {p.amount > 0 && <span className="text-sm font-normal" style={{ color: 'var(--muted)' }}> / {p.billing_period === 'month' ? 'місяць' : p.billing_period}</span>}
                            </div>
                        </div>
                        {p.features && p.features.length > 0 && (
                            <ul className="text-sm space-y-1" style={{ color: 'var(--muted)' }}>
                                {p.features.map((feature, idx) => (
                                    <li key={idx}>• {feature}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}

                {!loading && !error && (
                    <p className="text-xs text-gray-600">Оплата приймається в гривні за курсом банку/платіжної системи на момент оплати.</p>
                )}
            </div>
        </div>
    )
}


