import { useState } from 'react'

export default function Alimony() {
    const [mode, setMode] = useState('За кількістю дітей (25/33/50%)')
    const [children, setChildren] = useState('1')
    const [percent, setPercent] = useState('')
    const [income, setIncome] = useState('')
    const [checkMin, setCheckMin] = useState('Так')
    const [pmChild, setPmChild] = useState('')
    const [result, setResult] = useState(null)

    function onSubmit(e) {
        e.preventDefault()
        let pct
        if (mode === 'За кількістю дітей (25/33/50%)') {
            pct = (children === '1') ? 25 : (children === '2') ? 33 : 50
        } else {
            const p = Number(String(percent).replace(/\s+/g, '').replace(',', '.'))
            if (!Number.isFinite(p) || p <= 0 || p > 100) {
                setResult({ error: 'Відсоток має бути у діапазоні 0–100' })
                return
            }
            pct = p
        }
        const inc = Number(String(income).replace(/\s+/g, '').replace(',', '.'))
        if (!Number.isFinite(inc) || inc <= 0) {
            setResult({ error: 'Дохід має бути > 0' })
            return
        }
        const ch = children === '3+' ? 3 : Number(children)
        const calcAmount = inc * (pct / 100.0)

        if (checkMin === 'Ні') {
            setResult({ amount: calcAmount.toFixed(2), children: ch, income: inc.toFixed(2), percent: pct.toFixed(2) })
            return
        }

        const pm = Number(String(pmChild).replace(/\s+/g, '').replace(',', '.'))
        if (!Number.isFinite(pm) || pm <= 0) {
            setResult({ error: 'ПМ на дитину має бути > 0' })
            return
        }
        const minAmount = ch * pm * 0.5
        const amount = Math.max(calcAmount, minAmount)
        const usedMin = amount === minAmount && minAmount > calcAmount
        setResult({ amount: amount.toFixed(2), children: ch, income: inc.toFixed(2), percent: pct.toFixed(2), pmChild: pm.toFixed(2), minAmount: minAmount.toFixed(2), usedMin })
    }

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Аліменти (спрощено)</h1>
            <form onSubmit={onSubmit} className="mt-6 grid gap-4 max-w-xl">
                <label>Режим
                    <select className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" value={mode} onChange={e => setMode(e.target.value)}>
                        <option>За кількістю дітей (25/33/50%)</option>
                        <option>Власний відсоток</option>
                    </select>
                </label>
                {mode === 'Власний відсоток' && (
                    <label>Власний відсоток, %
                        <input className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" type="number" step="0.01" value={percent} onChange={e => setPercent(e.target.value)} />
                    </label>
                )}
                <label>Кількість дітей
                    <select className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" value={children} onChange={e => setChildren(e.target.value)}>
                        <option>1</option>
                        <option>2</option>
                        <option>3+</option>
                    </select>
                </label>
                <label>Місячний дохід (грн)
                    <input className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" type="number" step="0.01" value={income} onChange={e => setIncome(e.target.value)} />
                </label>
                <label>Перевірити мінімум (50% ПМ на дитину)?
                    <select className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" value={checkMin} onChange={e => setCheckMin(e.target.value)}>
                        <option>Так</option>
                        <option>Ні</option>
                    </select>
                </label>
                {checkMin === 'Так' && (
                    <label>ПМ на одну дитину (грн)
                        <input className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" type="number" step="0.01" value={pmChild} onChange={e => setPmChild(e.target.value)} />
                    </label>
                )}
                <button className="inline-flex items-center rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95" type="submit">Розрахувати</button>
            </form>

            {result && (
                <div className="card" style={{ marginTop: 14 }}>
                    {result.error ? (
                        <div><strong>Помилка:</strong> {String(result.error)}</div>
                    ) : (
                        <div>
                            <div>Діти: {result.children}</div>
                            <div>Дохід: {result.income} грн</div>
                            <div>Відсоток: {result.percent}%</div>
                            {result.pmChild && (
                                <div>ПМ на дитину: {result.pmChild} грн (мінімум: {result.minAmount} грн/міс)</div>
                            )}
                            <div>Аліменти: {result.amount} грн/міс {result.usedMin ? '(застосовано мінімум 50% ПМ)' : ''}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}


