import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export default function SubscriptionSuccess() {
    return (
        <div className="mx-auto max-w-lg text-center">
            <div className="rounded-2xl border p-8" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="text-3xl mb-2 flex justify-center" style={{ color: 'var(--accent)' }}>
                    <CheckCircle size={40} />
                </div>
                <h1 className="text-2xl font-semibold" style={{ color: 'var(--ink)' }}>
                    Оплату успішно виконано
                </h1>
                <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                    Дякуємо! Ваша підписка активована. Ви можете відразу користуватись преміум‑можливостями.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link to="/ai" className="px-4 py-3 rounded-lg text-sm font-medium text-white text-center" style={{ background: 'var(--accent)' }}>
                        До AI‑чату
                    </Link>
                    <Link to="/subscription" className="px-4 py-3 rounded-lg text-sm font-medium text-center border" style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}>
                        Керувати підпискою
                    </Link>
                </div>
            </div>
        </div>
    )
}
