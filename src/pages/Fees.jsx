import { useState, useMemo } from 'react'

function clamp(value, lo, hi) {
    return Math.max(lo, Math.min(hi, value))
}

const DEFAULT_PM = 3028.0

function computeCourtFee({ pm, proceeding, party, baseForAppeal, claimAmount, efiling }) {
    if (!pm || pm <= 0) return { error: 'Некоректний ПМ' }
    if (party === 'Пільга/звільнення від збору') {
        return {
            fee: 0,
            details: 'Заявник має пільгу/звільнення від сплати судового збору. Перевірте підстави за Законом України «Про судовий збір».',
        }
    }

    const ratePecuniaryIndividual = 0.01
    const ratePecuniaryLegal = 0.015
    const minCoefNonpecIndividual = 0.4
    const minCoefNonpecLegal = 1.0
    const minCoefPecuniary = 0.4
    const maxCoefPecuniary = 5.0

    function baseFee(calcType) {
        if (calcType === 'Позов немайновий (ЦПК)') {
            if (party === 'Юридична особа') return pm * minCoefNonpecLegal
            return pm * minCoefNonpecIndividual
        }
        const rate = party === 'Фізична особа' ? ratePecuniaryIndividual : ratePecuniaryLegal
        const raw = (Number(claimAmount) || 0) * rate
        return clamp(raw, pm * minCoefPecuniary, pm * maxCoefPecuniary)
    }

    let fee = 0
    let details = ''

    if (proceeding === 'Апеляційна скарга' || proceeding === 'Касаційна скарга') {
        if (!baseForAppeal) return { error: 'Не обрано базовий тип для апеляції/касації' }
        const base = baseFee(baseForAppeal)
        const multiplier = proceeding === 'Апеляційна скарга' ? 1.5 : 2.0
        fee = base * multiplier
        details = `База: ${base.toFixed(2)} грн × ${multiplier} = ${fee.toFixed(2)} грн`
    } else if (proceeding === 'Позов немайновий (ЦПК)' || proceeding === 'Розірвання шлюбу (ЦПК)') {
        fee = baseFee(proceeding)
        details = `Фіксована ставка: ${fee.toFixed(2)} грн`
    } else if (proceeding === 'Заява про видачу судового наказу') {
        const base = baseFee('Позов майновий (ЦПК)')
        fee = base * 0.5
        details = `Судовий наказ: 0.5 від ставки майнового позову. База: ${base.toFixed(2)} грн → ${fee.toFixed(2)} грн`
    } else {
        fee = baseFee('Позов майновий (ЦПК)')
        details = `Ставка: ${(party === 'Фізична особа' ? '1%' : '1.5%')} від суми позову, але не менше ${minCoefPecuniary}×ПМ і не більше ${maxCoefPecuniary}×ПМ.\nРозраховано: ${fee.toFixed(2)} грн`
    }

    if (efiling) {
        fee = fee * 0.8
        details += "\nЗастосовано коефіцієнт 0.8 для подання через 'Електронний суд'."
    }

    const checklist = [
        'Чек-лист до сплати:',
        '- Квитанція банку/електронна квитанція.',
        '- Реквізити рахунку судового збору для вашого суду.',
        '- Призначення платежу з ПІБ/назвою, кодом, назвою суду, суттю звернення.',
        '- Додайте квитанцію до позову/скарги.'
    ].join('\n')

    const disclaimer = 'Увага: розрахунок орієнтовний. Перевірте актуальні норми Закону України «Про судовий збір» та значення ПМ.'

    return { fee: Number(fee.toFixed(2)), details: `${details}\n\n${checklist}\n\n${disclaimer}` }
}

export default function Fees() {
    const [result, setResult] = useState(null)
    const [pm, setPm] = useState(DEFAULT_PM)
    const [proceeding, setProceeding] = useState('Позов майновий (ЦПК)')
    const [party, setParty] = useState('Фізична особа')
    const [claimAmount, setClaimAmount] = useState('')
    const [baseForAppeal, setBaseForAppeal] = useState('')
    const [efiling, setEfiling] = useState('Ні')

    const requiresClaimAmount = useMemo(() => {
        return proceeding === 'Позов майновий (ЦПК)' || proceeding === 'Заява про видачу судового наказу' || baseForAppeal === 'Позов майновий (ЦПК)'
    }, [proceeding, baseForAppeal])

    function onSubmit(e) {
        e.preventDefault()
        const computed = computeCourtFee({
            pm: Number(pm),
            proceeding,
            party,
            baseForAppeal,
            claimAmount: requiresClaimAmount ? Number(claimAmount || 0) : 0,
            efiling: efiling === 'Так',
        })
        setResult(computed)
    }

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Судовий збір</h1>
            <form onSubmit={onSubmit} className="mt-6 grid gap-4 max-w-2xl">
                <label>Прожитковий мінімум (грн)
                    <input className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" type="number" step="0.01" name="pm" value={pm} onChange={e => setPm(e.target.value)} required />
                </label>
                <label>Тип звернення
                    <select className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" name="proceeding" value={proceeding} onChange={e => setProceeding(e.target.value)}>
                        <option>Позов майновий (ЦПК)</option>
                        <option>Позов немайновий (ЦПК)</option>
                        <option>Розірвання шлюбу (ЦПК)</option>
                        <option>Заява про видачу судового наказу</option>
                        <option>Апеляційна скарга</option>
                        <option>Касаційна скарга</option>
                    </select>
                </label>
                <label>Сторона
                    <select className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" name="party" value={party} onChange={e => setParty(e.target.value)}>
                        <option>Фізична особа</option>
                        <option>Юридична особа</option>
                        <option>Пільга/звільнення від збору</option>
                    </select>
                </label>
                {requiresClaimAmount && (
                    <label>Сума позову (грн) — для майнових/наказів
                        <input className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" type="number" step="0.01" name="claim_amount" value={claimAmount} onChange={e => setClaimAmount(e.target.value)} />
                    </label>
                )}
                {(proceeding === 'Апеляційна скарга' || proceeding === 'Касаційна скарга') && (
                    <label>Базовий тип для апеляції/касації (як при позові)
                        <select className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" name="base_for_appeal" value={baseForAppeal} onChange={e => setBaseForAppeal(e.target.value)}>
                            <option value="">—</option>
                            <option>Позов майновий (ЦПК)</option>
                            <option>Позов немайновий (ЦПК)</option>
                        </select>
                    </label>
                )}
                <label>Електронний суд?
                    <select className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" name="efiling" value={efiling} onChange={e => setEfiling(e.target.value)}><option>Ні</option><option>Так</option></select>
                </label>
                <button className="inline-flex items-center rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95" type="submit">Розрахувати</button>
            </form>

            {result && (
                <div className="card" style={{ marginTop: 14 }}>
                    {result.error ? (
                        <div><strong>Помилка:</strong> {String(result.error)}</div>
                    ) : (
                        <div>
                            {'fee' in result && <div><strong>Судовий збір:</strong> {result.fee} грн</div>}
                            {result.details && <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{result.details}</pre>}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}


