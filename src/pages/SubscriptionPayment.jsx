import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PaymentAPI } from '../lib/api.js'
import { useAuth } from '../lib/authContext.jsx'
import { Lock } from 'lucide-react'

// Парсинг периода и валюты
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
    return n * rate
}

function formatUah(n) {
    try {
        return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 }).format(n)
    } catch {
        return `${Math.round(n)} грн`
    }
}

// Валидация номера телефона (украинский формат)
function validatePhone(phone) {
    const phoneRegex = /^(\+380|380|0)[0-9]{9}$/
    return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''))
}

// Валидация номера карты (базовая проверка длины)
function validateCard(card) {
    const cardRegex = /^[0-9]{13,19}$/
    return cardRegex.test(card.replace(/\s/g, ''))
}

// Валидация CVV
function validateCvv(cvv) {
    const cvvRegex = /^[0-9]{3,4}$/
    return cvvRegex.test(cvv)
}

// (obsolete) validateMonth/validateYear были заменены на parseAndValidateExpiry

// Форматирование номера карты для отображения
function formatCardNumber(value) {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
        return parts.join(' ')
    } else {
        return v
    }
}

// Форматирование номера телефона
function formatPhone(value) {
    const v = value.replace(/\D/g, '')
    if (v.startsWith('380')) {
        return `+${v.substring(0, 3)} ${v.substring(3, 5)} ${v.substring(5, 8)} ${v.substring(8, 10)} ${v.substring(10, 12)}`
    } else if (v.startsWith('0')) {
        return `${v.substring(0, 3)} ${v.substring(3, 5)} ${v.substring(5, 8)} ${v.substring(8, 10)} ${v.substring(10, 12)}`
    }
    return value
}

// Форматирование срока действия карты (MM/YY)
function formatExpiry(value) {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

// Парсинг и валидация срока действия (MM/YY) → { valid, month, yearFull, message }
function parseAndValidateExpiry(expiry) {
    const match = /^(\d{2})\/(\d{2})$/.exec(expiry)
    if (!match) return { valid: false, message: 'Невірний формат MM/YY' }
    const mm = parseInt(match[1], 10)
    const yy = parseInt(match[2], 10)
    if (mm < 1 || mm > 12) return { valid: false, message: 'Невірний місяць (01-12)' }

    const current = new Date()
    const currentYear = current.getFullYear()
    const currentMonth = current.getMonth() + 1

    // Преобразуем YY в полный год 2000+YY
    const yearFull = 2000 + yy
    if (yearFull < currentYear || (yearFull === currentYear && mm < currentMonth)) {
        return { valid: false, message: 'Термін дії минув' }
    }
    if (yearFull > currentYear + 20) {
        return { valid: false, message: 'Невірний рік' }
    }

    return { valid: true, month: String(mm).padStart(2, '0'), yearFull }
}

export default function SubscriptionPayment() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const planIdParam = searchParams.get('type')
    const { user, loading, updateUser, refresh } = useAuth()
    const [plans, setPlans] = useState([])
    const [rate, setRate] = useState(40)
    const [loadingRate, setLoadingRate] = useState(true)
    const [loadingPlans, setLoadingPlans] = useState(true)

    // Загрузка курсу USD→UAH
    useEffect(() => {
        let cancelled = false
        async function fetchRate() {
            try {
                const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=UAH')
                const data = await res.json()
                const v = data?.rates?.UAH
                if (!cancelled && typeof v === 'number' && isFinite(v)) setRate(v)
            } catch {
                try {
                    const res2 = await fetch('https://open.er-api.com/v6/latest/USD')
                    const data2 = await res2.json()
                    const v2 = data2?.rates?.UAH
                    if (!cancelled && typeof v2 === 'number' && isFinite(v2)) setRate(v2)
                } catch { /* ignore */ }
            } finally {
                if (!cancelled) setLoadingRate(false)
            }
        }
        fetchRate()
        return () => { cancelled = true }
    }, [])

    // Загрузка планов
    useEffect(() => {
        let cancelled = false
        async function fetchPlans() {
            try {
                const res = await PaymentAPI.getPlans()
                if (!cancelled) setPlans(res?.plans || [])
            } catch { /* ignore */ }
            finally { if (!cancelled) setLoadingPlans(false) }
        }
        fetchPlans()
        return () => { cancelled = true }
    }, [])

    const numericPlanId = Number(planIdParam || 0)
    const selectedPlan = useMemo(() => (plans || []).find(p => Number(p.id) === numericPlanId) || null, [plans, numericPlanId])
    const activePlanId = Number(user?.plan_id || 0)

    // Редирект, если тип равен текущему или 0
    useEffect(() => {
        if (!loading && user) {
            // if (!numericPlanId || numericPlanId === activePlanId) {
            //     navigate('/account')
            // }
        }
    }, [numericPlanId, activePlanId, user, loading, navigate])

    // Состояние формы
    const [formData, setFormData] = useState({
        phone: '',
        card: '',
        cvv: '',
        expiry: '',
    })

    // Состояние валидации
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')

    // Проверяем авторизацию пользователя (ждём завершения загрузки)
    useEffect(() => {
        if (!loading && !user) {
            navigate('/auth/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search))
        }
    }, [user, loading, navigate])

    // Обработка изменения полей
    const handleChange = (field, value) => {
        let formattedValue = value

        // Форматирование в зависимости от поля
        if (field === 'card') {
            formattedValue = formatCardNumber(value)
        } else if (field === 'phone') {
            formattedValue = formatPhone(value)
        } else if (field === 'cvv') {
            formattedValue = value.replace(/\D/g, '').substring(0, 4)
        } else if (field === 'expiry') {
            formattedValue = formatExpiry(value)
        }

        setFormData(prev => ({ ...prev, [field]: formattedValue }))

        // Убираем ошибку при изменении поля
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    // Валидация формы
    const validateForm = () => {
        const newErrors = {}

        if (!formData.phone.trim()) {
            newErrors.phone = 'Номер телефону обов\'язковий'
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Невірний формат номера телефону'
        }

        if (!formData.card.trim()) {
            newErrors.card = 'Номер карти обов\'язковий'
        } else if (!validateCard(formData.card)) {
            newErrors.card = 'Невірний номер карти'
        }

        if (!formData.cvv.trim()) {
            newErrors.cvv = 'CVV код обов\'язковий'
        } else if (!validateCvv(formData.cvv)) {
            newErrors.cvv = 'Невірний CVV код'
        }

        if (!formData.expiry.trim()) {
            newErrors.expiry = 'Термін дії обов\'язковий'
        } else {
            const parsed = parseAndValidateExpiry(formData.expiry)
            if (!parsed.valid) newErrors.expiry = parsed.message
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Обработка отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        setSubmitError('')

        try {
            if (!selectedPlan) {
                setSubmitError('План не знайдено. Поверніться та оберіть план ще раз.')
                return
            }
            const parsed = parseAndValidateExpiry(formData.expiry)
            if (!parsed.valid) {
                setErrors(prev => ({ ...prev, expiry: parsed.message || 'Невірний термін дії' }))
                return
            }
            const payload = {
                plan_id: numericPlanId,
                phone: formData.phone.replace(/\s|-|\(|\)/g, ''),
                card: formData.card.replace(/\s/g, ''),
                cvv: formData.cvv,
                card_exp_month: parsed.month,
                card_exp_year: String(parsed.yearFull).slice(-2)
            }

            const resp = await PaymentAPI.createSubscription(payload)

            // Если бекенд возвращает подписку/план, сохраним это в user и освежим профиль
            if (resp && typeof resp === 'object') {
                // ожидаем хотя бы plan_id/status/start_date/end_date
                const subscription = resp.subscription || resp
                if (subscription) {
                    updateUser({
                        plan_id: subscription.plan_id ?? user?.plan_id,
                        subscription_status: subscription.status ?? user?.subscription_status,
                        subscription_start_date: subscription.start_date ?? user?.subscription_start_date,
                        subscription_end_date: subscription.end_date ?? user?.subscription_end_date,
                        subscription: true,
                    })
                }
            }

            // На всякий случай дернем refresh, если сервер выставляет статус только через /auth/me
            try { await refresh() } catch { /* ignore */ }

            // Успешная оплата - перенаправляем на страницу успеха
            navigate('/subscription/success')

        } catch (error) {
            console.error('Payment error:', error)
            setSubmitError(error.message || 'Помилка при обробці платежу. Спробуйте ще раз.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const priceUah = useMemo(() => selectedPlan ? toUah(selectedPlan.amount, selectedPlan.currency, rate) : 0, [selectedPlan, rate])
    const subscriptionTitle = selectedPlan ? `${selectedPlan.name} підписка` : 'Підписка'
    const subscriptionPrice = selectedPlan ? `${formatUah(priceUah)} / ${normalizePeriod(selectedPlan.billing_period) === 'yearly' ? 'рік' : 'місяць'}` : ''

    // Если передали несуществующий plan_id — отправим назад на выбор планов
    useEffect(() => {
        if (!loadingPlans && numericPlanId && !selectedPlan) {
            navigate('/subscription')
        }
    }, [loadingPlans, numericPlanId, selectedPlan, navigate])

    if (loading || loadingPlans || loadingRate) {
        return <div className="flex justify-center items-center min-h-64">
            <div className="text-lg" style={{ color: 'var(--muted)' }}>Завантаження...</div>
        </div>
    }
    if (!user) return null

    return (
        <div className="mx-auto max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>
                    Оплата підписки
                </h1>
                <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                    Оформлення {subscriptionTitle.toLowerCase()} за {subscriptionPrice}
                </p>
            </div>

            {/* Информация о подписке */}
            <div
                className="rounded-lg border p-4 mb-6"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
                <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)' }}>{subscriptionTitle}</h3>
                <div className="text-2xl font-bold mb-3" style={{ color: 'var(--accent)' }}>{subscriptionPrice}</div>
                <ul className="space-y-1 text-sm" style={{ color: 'var(--muted)' }}>
                    {(Array.isArray(selectedPlan?.features) && selectedPlan.features.length ? selectedPlan.features : [
                        'Необмежені токени для Юридичного ШІ',
                        'Безлімітні генерації документів (.docx)',
                        'Розширений правовий пошук з фільтрами',
                        'Пріоритетна черга відповідей ШІ',
                    ]).map((f, i) => (
                        <li key={i}>✓ {f}</li>
                    ))}
                </ul>
            </div>

            {/* Форма оплаты */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Номер телефона */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
                        Номер телефону *
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+380 XX XXX XX XX"
                        className="w-full px-3 py-2 rounded-md border text-sm"
                        style={{
                            borderColor: errors.phone ? '#ef4444' : 'var(--border)',
                            background: 'var(--surface)',
                            color: 'var(--ink)'
                        }}
                        disabled={isSubmitting}
                    />
                    {errors.phone && (
                        <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.phone}</p>
                    )}
                </div>

                {/* Номер карты */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
                        Номер карти *
                    </label>
                    <input
                        type="text"
                        value={formData.card}
                        onChange={(e) => handleChange('card', e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength="23"
                        className="w-full px-3 py-2 rounded-md border text-sm"
                        style={{
                            borderColor: errors.card ? '#ef4444' : 'var(--border)',
                            background: 'var(--surface)',
                            color: 'var(--ink)'
                        }}
                        disabled={isSubmitting}
                    />
                    {errors.card && (
                        <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.card}</p>
                    )}
                </div>

                {/* CVV и срок действия */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
                            CVV *
                        </label>
                        <input
                            type="text"
                            value={formData.cvv}
                            onChange={(e) => handleChange('cvv', e.target.value)}
                            placeholder="123"
                            maxLength="4"
                            className="w-full px-3 py-2 rounded-md border text-sm"
                            style={{
                                borderColor: errors.cvv ? '#ef4444' : 'var(--border)',
                                background: 'var(--surface)',
                                color: 'var(--ink)'
                            }}
                            disabled={isSubmitting}
                        />
                        {errors.cvv && (
                            <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.cvv}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
                            Термін дії (MM/YY) *
                        </label>
                        <input
                            type="text"
                            value={formData.expiry}
                            onChange={(e) => handleChange('expiry', e.target.value)}
                            placeholder="MM/YY"
                            maxLength="5"
                            className="w-full px-3 py-2 rounded-md border text-sm"
                            style={{
                                borderColor: errors.expiry ? '#ef4444' : 'var(--border)',
                                background: 'var(--surface)',
                                color: 'var(--ink)'
                            }}
                            disabled={isSubmitting}
                            inputMode="numeric"
                        />
                        {errors.expiry && (
                            <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.expiry}</p>
                        )}
                    </div>
                </div>

                {/* Ошибка отправки */}
                {submitError && (
                    <div
                        className="p-3 rounded-md text-sm"
                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                    >
                        {submitError}
                    </div>
                )}

                {/* Кнопки */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/subscription')}
                        className="flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors"
                        style={{
                            borderColor: 'var(--border)',
                            background: 'var(--surface)',
                            color: 'var(--ink)'
                        }}
                        disabled={isSubmitting}
                    >
                        Скасувати
                    </button>

                    <button
                        type="submit"
                        className="flex-1 px-4 py-3 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                        style={{ background: 'var(--accent)' }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Обробка...' : `Оплатити ${subscriptionPrice}`}
                    </button>
                </div>
            </form>

            {/* Информация о безопасности */}
            <div className="mt-8 p-4 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--ink)' }}>
                    <Lock />
                    Безпека платежів</h4>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    Ваші платіжні дані захищені за допомогою SSL-шифрування.
                    Ми не зберігаємо дані вашої карти на наших серверах.
                </p>
            </div>
        </div>
    )
}
