export default function ErrorModal({
    isOpen,
    onClose,
    title = 'Виникла помилка',
    message = 'Щось пішло не так. Спробуйте пізніше.',
    onRetry
}) {
    if (!isOpen) return null

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
                <div className="p-6">
                    {/* Иконка ошибки */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{ background: 'color-mix(in oklab, #ef4444 15%, transparent)' }}>
                            <svg className="w-8 h-8" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
                            {title}
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                            {message}
                        </p>
                    </div>

                    {/* Дополнительная информация */}
                    <div className="mb-6 p-4 rounded-lg"
                        style={{ background: 'color-mix(in oklab, var(--muted) 5%, transparent)' }}>
                        <div className="text-sm" style={{ color: 'var(--muted)' }}>
                            <strong>Що можна зробити:</strong>
                            <ul className="mt-2 space-y-1">
                                <li>• Перевірте з'єднання з інтернетом</li>
                                <li>• Спробуйте оновити сторінку</li>
                                <li>• Зверніться до підтримки, якщо проблема не зникне</li>
                            </ul>
                        </div>
                    </div>

                    {/* Кнопки */}
                    <div className="flex gap-3">
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
                                style={{
                                    background: 'var(--accent)',
                                    color: '#ffffff'
                                }}
                            >
                                Спробувати ще раз
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={`${onRetry ? 'flex-1' : 'w-full'} px-4 py-3 rounded-lg font-medium transition-colors`}
                            style={{
                                background: 'var(--border)',
                                color: 'var(--ink)'
                            }}
                        >
                            {onRetry ? 'Закрити' : 'Зрозуміло'}
                        </button>
                    </div>

                    {/* Контактная информация */}
                    <div className="mt-4 text-center">
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            Потрібна допомога? Напишіть нам на{' '}
                            <a
                                href="mailto:support@pravohelper.com"
                                className="underline"
                                style={{ color: 'var(--accent)' }}
                            >
                                support@pravohelper.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
