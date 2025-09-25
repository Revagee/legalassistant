export default function RenewSubscriptionSuccessModal({
    isOpen,
    onClose,
    subscriptionEndDate,
    onNavigateToAccount
}) {
    if (!isOpen) return null

    const formatDate = (dateString) => {
        if (!dateString) return ''
        return new Date(dateString).toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4"
                style={{
                    background: 'var(--surface-solid)',
                    border: '1px solid var(--border)'
                }}
            >
                <div className="p-6" style={{ background: 'var(--surface-solid)' }}>
                    {/* Иконка успеха */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{ background: 'color-mix(in oklab, #10b981 15%, transparent)' }}>
                            <svg className="w-8 h-8" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
                            Підписку відновлено
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                            Дякуємо! Автопродовження знову активне. Доступ до преміум‑функцій збережено.
                        </p>
                    </div>

                    {/* Інформація */}
                    <div className="mb-6 p-4 rounded-lg"
                        style={{ background: 'color-mix(in oklab, var(--accent) 5%, transparent)' }}>
                        <h3 className="font-semibold mb-3" style={{ color: 'var(--ink)' }}>
                            Деталі підписки
                        </h3>
                        <div className="space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
                            <div className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>Автоматичне списання буде виконано у дату продовження</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">ℹ</span>
                                <span>
                                    Поточна оплата покриває період до{' '}
                                    <strong style={{ color: 'var(--ink)' }}>
                                        {subscriptionEndDate ? formatDate(subscriptionEndDate) : 'кінця оплаченого періоду'}
                                    </strong>
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">ℹ</span>
                                <span>Скасувати автопродовження можна в розділі «Акаунт» у будь‑який час</span>
                            </div>
                        </div>
                    </div>

                    {/* Кнопки */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
                            style={{
                                background: 'var(--border)',
                                color: 'var(--ink)'
                            }}
                        >
                            Закрити
                        </button>
                        <button
                            onClick={onNavigateToAccount}
                            className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
                            style={{
                                background: 'var(--accent)',
                                color: '#ffffff'
                            }}
                        >
                            До акаунту
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}


