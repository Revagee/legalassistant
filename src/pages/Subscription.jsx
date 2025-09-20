import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../lib/authContext.jsx'
import { PaymentAPI } from '../lib/api.js'
import { useNavigate } from 'react-router-dom'

// Вспомогательные функции для работы с валютой и периодами
function normalizePeriod(period) {
    const p = String(period || '').toLowerCase()
    if (p.startsWith('month')) return 'monthly'
    if (p.startsWith('year') || p.startsWith('annual')) return 'yearly'
    return p
}

function toUah(amount, currency, rate) {
    const cur = String(currency || '').toUpperCase()
    const n = Number(amount || 0)
    if (!isFinite(n)) return 0
    if (cur === 'UAH') return n
    if (cur === 'USD') return n * rate
    // неизвестная валюта — считаем как USD
    return n * rate
}

function toUsd(amount, currency, rate) {
    const cur = String(currency || '').toUpperCase()
    const n = Number(amount || 0)
    if (!isFinite(n)) return 0
    if (cur === 'USD') return n
    if (cur === 'UAH') return n / rate
    return n / rate
}

function useUsdToUahRate() {
    const [rate, setRate] = useState(40) // запасной курс, если сеть недоступна
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const { user } = useAuth()
    useEffect(() => {
        let cancelled = false
        // if (user?.plan_id !== 0) {
        //     navigate('/account')
        // }
        async function fetchRate() {
            try {
                // Пытаемся получить курс USD→UAH из публичного API
                const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=UAH')
                if (!res.ok) throw new Error('Bad status')
                const data = await res.json()
                const v = data?.rates?.UAH
                if (!cancelled && typeof v === 'number' && isFinite(v)) {
                    setRate(v)
                }
            } catch {
                try {
                    // Резервный источник
                    const res2 = await fetch('https://open.er-api.com/v6/latest/USD')
                    const data2 = await res2.json()
                    const v2 = data2?.rates?.UAH
                    if (!cancelled && typeof v2 === 'number' && isFinite(v2)) {
                        setRate(v2)
                    }
                } catch (e2) {
                    if (!cancelled) setError(e2)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        fetchRate()
        return () => { cancelled = true }
    }, [])

    return { rate, loading, error }
}

function formatUah(n) {
    try {
        return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 }).format(n)
    } catch {
        return `${Math.round(n)} грн`
    }
}

function FeatureItem({ children, inverted }) {
    return (
        <li className="flex items-start gap-3">
            <span aria-hidden className="text-base font-bold" style={{ color: inverted ? '#ffffff' : 'var(--accent)' }}>✓</span>
            <span className="text-sm" style={{ color: inverted ? '#ffffff' : 'var(--ink)' }}>{children}</span>
        </li>
    )
}

function PlanCard({ title, price, period, ribbon, ctaLabel, onSelect, features, isCurrent }) {
    const [hovered, setHovered] = useState(false)
    const isInverted = hovered
    const bg = isInverted ? 'var(--accent)' : 'var(--surface)'
    const fg = isInverted ? '#ffffff' : 'var(--ink)'
    const sub = isInverted ? 'rgba(255,255,255,.85)' : 'var(--muted)'

    return (
        <div
            className="rounded-2xl border p-6 relative transition-all duration-300 ease-in-out cursor-pointer"
            style={{
                borderColor: 'var(--border)',
                background: bg,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '400px'
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {ribbon && (
                <div
                    className="absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300"
                    style={{
                        background: isInverted ? 'rgba(255,255,255,.2)' : 'var(--accent)',
                        color: isInverted ? '#ffffff' : '#ffffff',
                        transform: 'translateY(0)'
                    }}
                >
                    {ribbon}
                </div>
            )}

            <div className="text-lg font-semibold transition-colors duration-300" style={{ color: fg }}>{title}</div>
            <div className="mt-3 flex items-baseline gap-1">
                <div className="text-4xl font-bold transition-colors duration-300" style={{ color: fg }}>{price}</div>
                <div className="text-sm transition-colors duration-300" style={{ color: sub }}>/ {period}</div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <ul className="mt-6 space-y-3">
                    {features.map((f, i) => (
                        <FeatureItem key={i} inverted={isInverted}>{f}</FeatureItem>
                    ))}
                </ul>
            </div>

            {isCurrent ? (
                <div
                    className="mt-6 w-full rounded-lg px-4 py-3 text-sm font-semibold text-center transition-all duration-300"
                    style={{
                        background: isInverted ? 'rgba(255,255,255,.2)' : 'var(--surface)',
                        color: isInverted ? '#ffffff' : 'var(--muted)',
                        border: `1px solid ${isInverted ? 'rgba(255,255,255,.3)' : 'var(--border)'}`
                    }}
                >
                    Поточний план
                </div>
            ) : (
                <button
                    onClick={onSelect}
                    className="mt-6 w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
                    style={{
                        background: isInverted ? '#ffffff' : 'var(--accent)',
                        color: isInverted ? 'var(--accent)' : '#ffffff'
                    }}
                >
                    {ctaLabel}
                </button>
            )}
        </div>
    )
}


export default function Subscription() {
    const { user } = useAuth()
    const [plans, setPlans] = useState(null)
    const { rate, loading } = useUsdToUahRate()

    const monthlyPlan = useMemo(() => (plans || []).find(p => normalizePeriod(p?.billing_period) === 'monthly'), [plans])
    const yearlyPlan = useMemo(() => (plans || []).find(p => normalizePeriod(p?.billing_period) === 'yearly'), [plans])

    const prices = useMemo(() => {
        const monthlyUah = monthlyPlan ? toUah(monthlyPlan.amount, monthlyPlan.currency, rate) : 10 * rate
        const yearlyUah = yearlyPlan ? toUah(yearlyPlan.amount, yearlyPlan.currency, rate) : 100 * rate
        return {
            monthlyUah: Math.round(monthlyUah),
            yearlyUah: Math.round(yearlyUah),
        }
    }, [monthlyPlan, yearlyPlan, rate])

    const yearlySavingsPct = useMemo(() => {
        const monthlyUsd = monthlyPlan ? toUsd(monthlyPlan.amount, monthlyPlan.currency, rate) : 10
        const yearlyUsd = yearlyPlan ? toUsd(yearlyPlan.amount, yearlyPlan.currency, rate) : 100
        if (!monthlyUsd || !isFinite(monthlyUsd) || !yearlyUsd || !isFinite(yearlyUsd)) return 0
        const monthlyTotalUsd = 12 * monthlyUsd
        const pct = 1 - (yearlyUsd / monthlyTotalUsd)
        return Math.max(0, Math.round(pct * 100))
    }, [monthlyPlan, yearlyPlan, rate])

    // Определяем, есть ли у пользователя активная подписка
    const hasSubscription = user?.subscription === true
    const isFreePlan = !hasSubscription

    // Загрузим планы и определим активный план по user.plan_id
    useEffect(() => {
        let cancelled = false
        async function fetchPlans() {
            try {
                const res = await PaymentAPI.getPlans()
                if (!cancelled) setPlans(res?.plans || [])
            } catch { /* ignore */ }
        }
        fetchPlans()
        return () => { cancelled = true }
    }, [])

    const activePlanId = Number(user?.plan_id || 0)

    const onSelectMonthly = () => {
        window.location.href = '/subscription/payment?type=monthly'
    }
    const onSelectYearly = () => {
        window.location.href = '/subscription/payment?type=yearly'
    }

    return (
        <div className="mx-auto max-w-6xl">
            <section className="mb-8">
                <div className="text-center">
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Преміум підписка</h1>
                    <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                        Усе зручніше і швидше: преміум відкриває розширені можливості та <strong>необмежені токени</strong> для Юридичного ШІ.
                    </p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                        Ціни беруться з планів. Якщо валюта плану — USD, сума конвертується у гривні за поточним курсом. {loading ? 'Завантажуємо курс…' : ''}
                    </p>
                </div>
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
                {plans?.map(plan => (
                    <PlanCard
                        title={plan.name}
                        price={formatUah(plan.amount)}
                        period={plan.billing_period}
                        ctaLabel={plan.cta_label || 'Оформити'}
                        onSelect={() => { window.location.href = `/subscription/payment?type=${plan.id}` }}
                        isCurrent={plan.id === activePlanId}
                        features={[
                            ...plan.features,
                        ]}
                    />
                ))}
            </section>

        </div>
    )
}


