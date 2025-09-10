import { useState } from 'react'

export default function Penalty() {
    const [result, setResult] = useState(null)
    const [amount, setAmount] = useState('')
    const [rateDaily, setRateDaily] = useState('')
    const [days, setDays] = useState('')

    function onSubmit(e) {
        e.preventDefault()
        const a = Number(String(amount).replace(/\s+/g, ''))
        const r = Number(String(rateDaily).replace(/\s+/g, ''))
        const d = Number(String(days).trim())
        if (!Number.isFinite(a) || a <= 0) {
            setResult({ error: 'Введіть коректну базу (>0)' })
            return
        }
        if (!Number.isFinite(r) || r < 0) {
            setResult({ error: 'Ставка має бути числом (\u2265 0)' })
            return
        }
        if (!Number.isInteger(d) || d < 0 || d > 36500) {
            setResult({ error: 'Дні мають бути цілим числом 0–36500' })
            return
        }
        const penalty = a * (r / 100.0) * d
        setResult({ penalty: penalty.toFixed(2) })
    }

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>Пеня (договірна)</h1>
            <form onSubmit={onSubmit} className="mt-6 grid gap-4 max-w-xl">
                <label>База (грн)
                    <input className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" type="number" step="0.01" name="amount" value={amount} onChange={e => setAmount(e.target.value)} required />
                </label>
                <label>Ставка, % на день
                    <input className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" type="number" step="0.0001" name="rate_daily" value={rateDaily} onChange={e => setRateDaily(e.target.value)} required />
                </label>
                <label>Кількість днів
                    <input className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" type="number" name="days" value={days} onChange={e => setDays(e.target.value)} required />
                </label>
                <button className="inline-flex items-center rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95" type="submit">Розрахувати</button>
            </form>

            {result && (
                <div className="card" style={{ marginTop: 14 }}>
                    {result.error ? (
                        <div><strong>Помилка:</strong> {String(result.error)}</div>
                    ) : (
                        <div>Пеня: {result.penalty} грн</div>
                    )}
                </div>
            )}
        </div>
    )
}


