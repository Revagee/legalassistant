import { useState } from 'react'

export default function Esv() {
    const [result, setResult] = useState(null)
    const [minSalary, setMinSalary] = useState(8000)
    const [months, setMonths] = useState(1)

    function onSubmit(e) {
        e.preventDefault()
        const ms = Number(minSalary)
        const m = Number(months)
        if (!Number.isFinite(ms) || ms <= 0) {
            setResult({ error: 'Введіть коректний ПМ (мін. зарплату) > 0' })
            return
        }
        if (!Number.isInteger(m) || m <= 0 || m > 120) {
            setResult({ error: 'Місяців має бути ціле число у діапазоні 1–120' })
            return
        }
        const rate = 0.22
        const monthly = ms * rate
        const total = monthly * m
        setResult({ monthly: monthly.toFixed(2), months: m, total: total.toFixed(2) })
    }

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>ЄСВ (для ФОП)</h1>
            <form onSubmit={onSubmit} className="mt-6 grid gap-4 max-w-xl">
                <label>Мінімальна заробітна плата (грн)
                    <input className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" type="number" step="0.01" name="min_salary" value={minSalary} onChange={e => setMinSalary(e.target.value)} required />
                </label>
                <label>Місяців
                    <input className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" type="number" name="months" value={months} onChange={e => setMonths(e.target.value)} required />
                </label>
                <button className="inline-flex items-center rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95" type="submit">Розрахувати</button>
            </form>

            {result && (
                <div className="card" style={{ marginTop: 14 }}>
                    {result.error ? (
                        <div><strong>Помилка:</strong> {String(result.error)}</div>
                    ) : (
                        <div>
                            <div>Місячний ЄСВ: {result.monthly} грн</div>
                            <div>Разом за {result.months} міс.: {result.total} грн</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}


