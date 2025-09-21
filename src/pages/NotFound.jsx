import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Search, MessageCircle } from 'lucide-react'

export default function NotFound() {
    const navigate = useNavigate()

    const goBack = () => {
        if (window.history.length > 1) {
            navigate(-1)
        } else {
            navigate('/')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
            <div className="max-w-2xl w-full text-center">
                {/* Большая цифра 404 */}
                <div className="mb-8">
                    <h1 className="text-8xl sm:text-9xl font-bold tracking-tight" style={{ color: 'var(--accent)', opacity: 0.1 }}>
                        404
                    </h1>
                </div>

                {/* Основной контент */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3" style={{ color: 'var(--accent)' }}>
                            Сторінка не знайдена
                        </h2>
                        <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
                            На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.
                            Можливо, ви перейшли за застарілим посиланням або допустили помилку в адресі.
                        </p>
                    </div>

                    {/* Кнопки дій */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                            onClick={goBack}
                            className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium transition-all hover:opacity-90"
                            style={{ background: 'var(--accent)', color: 'white' }}
                        >
                            <ArrowLeft size={18} />
                            Повернутися назад
                        </button>

                        <a
                            href="/"
                            className="inline-flex items-center gap-2 rounded-md border px-6 py-3 text-sm font-medium transition-all hover:bg-gray-50"
                            style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
                        >
                            <Home size={18} />
                            На головну
                        </a>
                    </div>

                    {/* Корисні посилання */}
                    <div className="pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
                        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                            Або скористайтеся одним з наших сервісів:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                            <a
                                href="/ai"
                                className="flex flex-col items-center gap-2 p-4 rounded-lg border transition-all hover:shadow-sm"
                                style={{ borderColor: 'var(--border)', background: 'var(--surface-solid)' }}
                            >
                                <MessageCircle size={24} style={{ color: 'var(--accent)' }} />
                                <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>ШІ-чат</span>
                            </a>

                            <a
                                href="/database"
                                className="flex flex-col items-center gap-2 p-4 rounded-lg border transition-all hover:shadow-sm"
                                style={{ borderColor: 'var(--border)', background: 'var(--surface-solid)' }}
                            >
                                <Search size={24} style={{ color: 'var(--accent)' }} />
                                <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Законодавство</span>
                            </a>

                            <a
                                href="/documents"
                                className="flex flex-col items-center gap-2 p-4 rounded-lg border transition-all hover:shadow-sm"
                                style={{ borderColor: 'var(--border)', background: 'var(--surface-solid)' }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Шаблони</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Декоративный элемент */}
                <div className="mt-12 flex justify-center">
                    <div className="w-16 h-1 rounded-full" style={{ background: 'var(--accent)', opacity: 0.2 }}></div>
                </div>
            </div>
        </div>
    )
}
