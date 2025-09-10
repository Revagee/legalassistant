import { useState } from 'react'

function parseDate(str) {
    const t = String(str || '').trim()
    if (!t) return null
    const m = t.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
    if (!m) return null
    const day = Number(m[1])
    const month = Number(m[2])
    const year = Number(m[3])
    const d = new Date(year, month - 1, day)
    if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null
    return d
}

function daysBetween(start, end) {
    const ms = Math.max(0, end.getTime() - start.getTime())
    return Math.floor(ms / 86400000)
}

export default function Interest() {
    const [result, setResult] = useState(null)
    const [amount, setAmount] = useState('')
    const [start, setStart] = useState('')
    const [end, setEnd] = useState('')

    function formatDate(d) {
        const dd = String(d.getDate()).padStart(2, '0')
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const yyyy = String(d.getFullYear())
        return `${dd}.${mm}.${yyyy}`
    }

    function onSubmit(e) {
        e.preventDefault()
        const a = Number(String(amount).replace(/\s+/g, ''))
        if (!Number.isFinite(a) || a <= 0) {
            setResult({ error: 'Введіть коректну суму боргу (>0)' })
            return
        }
        const sd = parseDate(start)
        if (!sd) {
            setResult({ error: 'Початок має бути ДД.ММ.РРРР' })
            return
        }
        let ed
        const endTrim = String(end || '').trim().toLowerCase()
        if (endTrim === 'сьогодні' || endTrim === 'сегодня') {
            const today = new Date()
            ed = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        } else {
            ed = parseDate(end)
        }
        if (!ed) {
            setResult({ error: 'Кінець має бути ДД.ММ.РРРР або "Сьогодні"' })
            return
        }
        if (ed.getTime() < sd.getTime()) {
            setResult({ error: 'Кінцева дата не може бути раніше початкової' })
            return
        }
        const days = daysBetween(sd, ed)
        const interest = a * 0.03 * (days / 365.0)
        const total = a + interest
        setResult({ s: formatDate(sd), e: formatDate(ed), days, interest: interest.toFixed(2), total: total.toFixed(2) })
    }

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>3% річних (ЦК України ст. 625)</h1>
            <form onSubmit={onSubmit} className="mt-6 grid gap-4 max-w-xl">
                <label>Сума боргу (грн)
                    <input className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" type="number" step="0.01" name="amount" value={amount} onChange={e => setAmount(e.target.value)} required />
                </label>
                <label>Початок прострочки (ДД.ММ.РРРР)
                    <input className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" type="text" name="start_date" placeholder="01.01.2024" value={start} onChange={e => setStart(e.target.value)} required />
                </label>
                <label>Кінець прострочки (ДД.ММ.РРРР або "Сьогодні")
                    <input className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" type="text" name="end_date" placeholder="Сьогодні" value={end} onChange={e => setEnd(e.target.value)} required />
                </label>
                <button className="inline-flex items-center rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95" type="submit">Розрахувати</button>
            </form>

            {result && (
                <div className="card" style={{ marginTop: 14 }}>
                    {result.error ? (
                        <div><strong>Помилка:</strong> {String(result.error)}</div>
                    ) : (
                        <div>
                            <div>Період: {result.s} — {result.e} ({result.days} дн.)</div>
                            <div>Нараховано: {result.interest} грн</div>
                            <div>Разом до стягнення: {result.total} грн</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}


