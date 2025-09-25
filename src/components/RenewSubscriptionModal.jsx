import { useState } from 'react'

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

export default function RenewSubscriptionModal({ isOpen, onClose, onRenew, isLoading }) {
    const [formData, setFormData] = useState({
        phone: '',
        card: '',
        cvv: '',
        expiry: '',
    })

    const [errors, setErrors] = useState({})

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

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm()) {
            // Преобразуем данные в формат, ожидаемый API
            const parsed = parseAndValidateExpiry(formData.expiry)
            const cardData = {
                cardNumber: formData.card,
                expiryMonth: parsed.month,
                expiryYear: String(parsed.yearFull).slice(-2),
                cvc: formData.cvv,
                cardholderName: '', // Не используется в SubscriptionPayment
                email: '', // Не используется в SubscriptionPayment
                phone: formData.phone
            }
            onRenew(cardData)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative w-full max-w-md mx-4 rounded-xl border p-6" style={{ background: 'var(--surface-solid)', borderColor: 'var(--border)' }}>
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mb-6" style={{ background: 'var(--surface-solid)' }}>
                    <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--ink)' }}>
                        Відновити підписку
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        Заповніть дані карти для відновлення підписки. Плата буде стягнута лише після закінчення поточного періоду.
                    </p>
                </div>

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
                                background: 'var(--surface-solid)',
                                color: 'var(--ink)'
                            }}
                            disabled={isLoading}
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
                        <div className="mb-2 flex items-center gap-2 opacity-80">
                            <img src="/img/Visa-logo.svg" alt="Visa" className="h-5" />
                            <img src="/img/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
                        </div>
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
                            disabled={isLoading}
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
                                disabled={isLoading}
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
                                disabled={isLoading}
                                inputMode="numeric"
                            />
                            {errors.expiry && (
                                <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.expiry}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors"
                            style={{
                                borderColor: 'var(--border)',
                                background: 'var(--surface)',
                                color: 'var(--ink)'
                            }}
                            disabled={isLoading}
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                            style={{ background: 'var(--accent)' }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Обробка...' : 'Відновити підписку'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
