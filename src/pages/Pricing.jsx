import { merchant } from '../lib/merchant.js'

export default function Pricing() {
    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Ціни</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Актуальні тарифи на послуги</p>

            <div className="mt-6 space-y-4" style={{ color: 'var(--ink)' }}>
                {merchant.pricing.map((p, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-sm text-gray-600">${p.priceUsd} / USD</div>
                    </div>
                ))}
                <p className="text-xs text-gray-600">Оплата приймається в гривні за курсом банку/платіжної системи на момент оплати.</p>
            </div>
        </div>
    )
}


