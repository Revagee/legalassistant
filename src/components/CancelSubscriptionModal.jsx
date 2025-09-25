import { useState } from 'react'

export default function CancelSubscriptionModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false
}) {
    const [selectedReason, setSelectedReason] = useState('')
    const [customReason, setCustomReason] = useState('')
    const [showFeedbackForm, setShowFeedbackForm] = useState(false)

    const cancellationReasons = [
        { id: 'too_expensive', label: 'Занадто дорого' },
        { id: 'not_using', label: 'Не користуюся достатньо' },
        { id: 'missing_features', label: 'Не вистачає функцій' },
        { id: 'found_alternative', label: 'Знайшов альтернативу' },
        { id: 'technical_issues', label: 'Технічні проблеми' },
        { id: 'temporary_pause', label: 'Тимчасова пауза' },
        { id: 'other', label: 'Інше' }
    ]

    const handleFirstStepConfirm = () => {
        setShowFeedbackForm(true)
    }

    const handleFinalConfirm = () => {
        const feedbackData = {
            reason: selectedReason,
            customReason: selectedReason === 'other' ? customReason : '',
            timestamp: new Date().toISOString()
        }
        onConfirm(feedbackData)
    }

    const handleClose = () => {
        setSelectedReason('')
        setCustomReason('')
        setShowFeedbackForm(false)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
                style={{
                    background: 'var(--surface-solid)',
                    border: '1px solid var(--border)'
                }}
            >
                {!showFeedbackForm ? (
                    // Первый шаг - подтверждение отмены
                    <div className="p-6" style={{ background: 'var(--surface-solid)' }}>
                        {/* Заголовок */}
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                                style={{ background: 'color-mix(in oklab, #ef4444 15%, transparent)' }}>
                                <svg className="w-8 h-8" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
                                Скасувати підписку?
                            </h2>
                            <p className="text-sm" style={{ color: 'var(--muted)' }}>
                                Ви впевнені, що хочете скасувати свою підписку?
                            </p>
                        </div>

                        {/* Информация о последствиях */}
                        <div className="mb-6 p-4 rounded-lg"
                            style={{ background: 'color-mix(in oklab, var(--accent) 5%, transparent)' }}>
                            <h3 className="font-semibold mb-2" style={{ color: 'var(--ink)' }}>
                                Що станеться після скасування:
                            </h3>
                            <ul className="space-y-1 text-sm" style={{ color: 'var(--muted)' }}>
                                <li>✓ Ви зможете користуватися преміум функціями до кінця оплаченого періоду</li>
                                <li>✓ Автоматичне списання буде зупинено</li>
                                <li>✓ Після закінчення періоду перейдете на безкоштовний план</li>
                                <li>✓ Ваші дані та історія чатів збережуться</li>
                            </ul>
                        </div>

                        {/* Кнопки */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
                                style={{
                                    background: 'var(--border)',
                                    color: 'var(--ink)'
                                }}
                            >
                                Залишити підписку
                            </button>
                            <button
                                onClick={handleFirstStepConfirm}
                                className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
                                style={{
                                    background: '#ef4444',
                                    color: '#ffffff'
                                }}
                            >
                                Скасувати підписку
                            </button>
                        </div>
                    </div>
                ) : (
                    // Второй шаг - форма обратной связи
                    <div className="p-6" style={{ background: 'var(--surface-solid)' }}>
                        {/* Заголовок */}
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                                style={{ background: 'color-mix(in oklab, var(--accent) 15%, transparent)' }}>
                                <svg className="w-8 h-8" fill="none" stroke="var(--accent)" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
                                Допоможіть нам стати кращими
                            </h2>
                            <p className="text-sm" style={{ color: 'var(--muted)' }}>
                                Розкажіть, чому ви вирішили скасувати підписку
                            </p>
                        </div>

                        {/* Причины отмены */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3" style={{ color: 'var(--ink)' }}>
                                Причина скасування:
                            </h3>
                            <div className="space-y-2">
                                {cancellationReasons.map((reason) => (
                                    <label
                                        key={reason.id}
                                        className="flex items-center p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                                        style={{
                                            background: selectedReason === reason.id
                                                ? 'color-mix(in oklab, var(--accent) 10%, transparent)'
                                                : 'transparent',
                                            border: selectedReason === reason.id
                                                ? '1px solid var(--accent)'
                                                : '1px solid var(--border)'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="cancellationReason"
                                            value={reason.id}
                                            checked={selectedReason === reason.id}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div
                                            className="w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center"
                                            style={{
                                                borderColor: selectedReason === reason.id ? 'var(--accent)' : 'var(--border)'
                                            }}
                                        >
                                            {selectedReason === reason.id && (
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ background: 'var(--accent)' }}
                                                />
                                            )}
                                        </div>
                                        <span className="text-sm" style={{ color: 'var(--ink)' }}>
                                            {reason.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Поле для кастомной причины */}
                        {selectedReason === 'other' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
                                    Опишіть причину:
                                </label>
                                <textarea
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    placeholder="Розкажіть, що можна покращити..."
                                    className="w-full px-3 py-2 rounded-lg resize-none"
                                    style={{
                                        border: '1px solid var(--border)',
                                        background: 'var(--surface-solid)',
                                        color: 'var(--ink)'
                                    }}
                                    rows={3}
                                />
                            </div>
                        )}

                        {/* Кнопки */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFeedbackForm(false)}
                                className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
                                style={{
                                    background: 'var(--border)',
                                    color: 'var(--ink)'
                                }}
                            >
                                Назад
                            </button>
                            <button
                                onClick={handleFinalConfirm}
                                disabled={!selectedReason || isLoading}
                                className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    background: '#ef4444',
                                    color: '#ffffff'
                                }}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Скасування...
                                    </div>
                                ) : (
                                    'Підтвердити скасування'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
