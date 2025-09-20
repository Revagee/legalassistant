import { useMemo } from 'react'

export default function SubscriptionTimeline({
    subscriptionStartDate,
    subscriptionEndDate,
    status,
    currentDate = new Date(),
    className = "",
}) {
    const startDate = useMemo(() => {
        if (!subscriptionStartDate) return null
        return new Date(subscriptionStartDate)
    }, [subscriptionStartDate])
    const endDate = useMemo(() => {
        if (!subscriptionEndDate) return null
        return new Date(subscriptionEndDate)
    }, [subscriptionEndDate])

    const formatDate = (date) => {
        return date.toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const formatShortDate = (date) => {
        return date.toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit'
        })
    }

    if (!endDate) return null

    const nowMs = currentDate.getTime()
    const startMs = startDate ? startDate.getTime() : nowMs - (30 * 24 * 60 * 60 * 1000)
    const endMs = endDate.getTime()

    // Создаем даты для таймлайна
    const subscriptionStart = new Date(startMs)
    const today = new Date(currentDate)
    const nextPaymentDate = new Date(endDate)

    // Вычисляем пропорциональное положение сегодняшней даты между началом подписки и следующим платежом
    const totalPeriodMs = endMs - startMs
    const currentProgressMs = nowMs - startMs
    const progressRatio = Math.max(0, Math.min(1, currentProgressMs / totalPeriodMs))

    // Позиции точек: начало подписки 10%, сегодня пропорционально, следующий платеж 90%
    const startPct = 10
    const endPct = 90
    const todayPct = startPct + (endPct - startPct) * progressRatio

    const isFrozen = typeof status === 'string' && ['frozen', 'on_hold', 'paused', 'past_due'].includes(status.toLowerCase())

    // Динамические цвета в зависимости от статуса заморозки
    const finalLineColor = isFrozen ? 'var(--border)' : 'color-mix(in oklab, var(--accent) 30%, var(--border))'
    const chevronColor = isFrozen ? 'var(--border)' : 'color-mix(in oklab, var(--accent) 30%, var(--border))'

    return (
        <div className={`mb-4 mt-2 ${className}`}>
            <div className="relative py-12">
                {/* Линия-трек */}
                <div className="absolute h-1 left-0 top-0" style={{
                    right: '0',
                    background: 'var(--border)',
                    borderRadius: '9999px'
                }}>
                    {/* Шеврон в конце таймлайна */}
                    <div className="absolute top-0 right-0 flex items-center" style={{ top: '2px', transform: 'translateY(-50%)', right: '-8px'}}>
                        <svg width="20" height="20" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 2L8 6L4 10" stroke={status === 'cancelled' ? 'var(--border)' : chevronColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* Активная синяя линия от начала подписки до сегодня */}
                <div
                    className="absolute top-0 h-1"
                    style={{
                        left: `${startPct}%`,
                        width: `${todayPct - startPct}%`,
                        background: 'var(--accent)',
                        borderRadius: '9999px'
                    }}
                />

                {/* Серая линия от сегодня до следующего платежа */}
                <div
                    className="absolute top-0 h-1"
                    style={{
                        left: `${todayPct}%`,
                        width: `${endPct - todayPct}%`,
                        background: 'color-mix(in oklab, var(--accent) 30%, var(--border))',
                        borderRadius: '9999px'
                    }}
                />

                {/* Финальная линия от следующего платежа до шеврона */}
                <div
                    className="absolute top-0 h-1"
                    style={{
                        left: `${endPct}%`,
                        right: '0',
                        background: status === 'cancelled' ? 'var(--border)' : finalLineColor,
                        borderRadius: '9999px'
                    }}
                />

                {/* Точка начала подписки */}
                <div className="absolute flex flex-col items-center" style={{ left: `${startPct}%`, transform: 'translateX(-50%)', top: '-4px' }}>
                    <div className="w-3 h-3 rounded-full border-2" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }} />
                    {/* Название сверху */}
                    <div
                        className="timeline-bubble-start"
                        style={{
                            left: startPct <= 5 ? '0' : 'auto',
                            transform: startPct <= 15 ? 'none' : 'translateX(-50%)'
                        }}
                    >
                        Початок підписки
                    </div>
                    {/* Дата снизу */}
                    <div
                        className="timeline-date-start"
                        style={{
                            left: startPct <= 5 ? '0' : 'auto',
                            transform: startPct <= 15 ? 'none' : 'translateX(-50%)'
                        }}
                    >
                        {formatShortDate(subscriptionStart)}
                    </div>
                </div>

                {/* Точка сегодняшней даты */}
                <div className="absolute flex flex-col items-center" style={{ left: `${todayPct}%`, transform: 'translateX(-50%)', top: '-4px' }}>
                    <div className="w-3 h-3 rounded-full border-2" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }} />
                    {/* Дата снизу */}
                    <div
                        className="timeline-bubble-today"
                        style={{
                            left: todayPct <= 5 ? '0' : todayPct >= 85 ? 'auto' : '10px',
                            right: todayPct >= 85 ? '0' : 'auto',
                            transform: (todayPct <= 5 || todayPct >= 95) ? 'none' : 'translateX(-50%)'
                        }}
                    >
                        Сьогодні, {formatShortDate(today)}
                    </div>
                </div>

                {/* Точка следующего платежа */}
                <div className="absolute flex flex-col items-center" style={{ left: `${endPct}%`, transform: 'translateX(-50%)', top: '-4px' }}>
                    <div className="w-3 h-3 rounded-full border-2" style={{ background: '#ffffff', borderColor: 'var(--accent)' }} />
                    {/* Название сверху */}
                    <div
                        className="timeline-bubble-end"
                        style={{
                            right: endPct >= 95 ? '0' : 'auto',
                            transform: endPct >= 85 ? 'none' : 'translateX(-50%)'
                        }}
                    >
                        {status === 'cancelled' ? 'Кінець підписки' : 'Наступний платіж'}
                    </div>
                    {/* Дата снизу */}
                    <div
                        className="timeline-date-end"
                        style={{
                            right: endPct >= 85 ? '0' : 'auto',
                            transform: endPct >= 85 ? 'none' : 'translateX(-50%)'
                        }}
                    >
                        {formatShortDate(nextPaymentDate)}
                    </div>
                </div>

                {/* Снежинка над синей линией при заморозке */}
                {isFrozen && (
                    <div
                        className="absolute -top-16"
                        style={{ left: `calc(${(todayPct + endPct) / 2}% - 8px)` }}
                        title="Підписка тимчасово заморожена: автоматичне списання не вдалось"
                    >
                        <span style={{ color: 'var(--accent)', fontSize: '16px' }}>❄</span>
                    </div>
                )}
            </div>

            {/* Информация о статусе */}
            <div className="p-3 rounded-lg" style={{ background: 'color-mix(in oklab, var(--muted) 5%, transparent)' }}>
                {status === 'cancelled' ? (
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>
                        Підписка скасована i продовжується до дати <strong>{formatDate(endDate)}</strong>
                        <br />
                        Далі буде переведена на безкоштовний план.
                    </div>
                ) : (
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>
                        Підписка активна і продовжується автоматично на дату <strong>{formatDate(endDate)}</strong>
                        <br />
                        Якщо автоматичне списання не вдасться, підписка тимчасово «заморожується» до успішної оплати і може бути переведена на безкоштовний план.
                    </div>
                )}
            </div>
        </div>
    )
}
