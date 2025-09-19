import { useLocation } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../../lib/authContext.jsx'
import { Medal, Crown } from 'lucide-react'

export default function TrainerResult({ subject = '', correct = 0, percentage = 0, answers = [] }) {
    const { isAuthenticated, loading } = useAuth()
    const [page, setPage] = useState(1)
    const location = useLocation()
    let s = subject
    let c = correct
    let p = percentage
    let a = answers
    if (location && location.state && typeof location.state === 'object') {
        s = location.state.subject || s
        c = Number.isFinite(location.state.correct) ? location.state.correct : c
        p = Number.isFinite(location.state.percentage) ? location.state.percentage : p
        a = Array.isArray(location.state.answers) ? location.state.answers : a
    } else {
        try {
            const raw = sessionStorage.getItem('trainer:result')
            if (raw) {
                const data = JSON.parse(raw)
                s = data.subject || s
                c = Number.isFinite(data.correct) ? data.correct : c
                p = Number.isFinite(data.percentage) ? data.percentage : p
                a = Array.isArray(data.answers) ? data.answers : a
            }
        } catch { /* ignore */ }
    }
    const leaderboard = useMemo(() => {
        // Static placeholder leaderboard of 50 entries
        return Array.from({ length: 50 }, (_, i) => ({ name: `Користувач ${i + 1}`, score: Math.max(50, 100 - Math.floor(i * 0.8)) }))
    }, [])

    function renderPlaceIcon(index) {
        if (index === 0) return <Crown size={18} color="#f59e0b" />
        if (index === 1) return <Medal size={18} color="#9ca3af" />
        if (index === 2) return <Medal size={18} color="#b45309" />
        return <span className="text-xs text-gray-500">{index + 1}</span>
    }

    const totalPages = Math.ceil(leaderboard.length / 10)
    const canPrev = page > 1
    const canNext = page < totalPages
    const [findQuery, setFindQuery] = useState('')
    const [highlightName, setHighlightName] = useState('')

    useEffect(() => {
        // prefill query with user name/email if available
        try {
            const raw = localStorage.getItem('profile_name')
            if (raw) setFindQuery(raw)
        } catch { /* ignore */ }
    }, [])

    const start = (page - 1) * 10
    const current = leaderboard.slice(start, start + 10)

    function handleFindMe() {
        const value = (findQuery || '').trim().toLowerCase()
        if (!value) return
        const idx = leaderboard.findIndex(r => r.name.toLowerCase().includes(value))
        if (idx >= 0) {
            setPage(Math.floor(idx / 10) + 1)
            setHighlightName(leaderboard[idx].name)
            setTimeout(() => setHighlightName(''), 2500)
        }
    }

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Результат тренування — {s}</h1>
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
                <div className="text-sm" style={{ color: 'var(--ink)' }}>Правильних відповідей: {c} з 10 ({p}%)</div>
                <div className="mt-3">
                    <ol className="list-decimal pl-6">
                        {a.map((x, idx) => (
                            <li key={idx} className="mb-2 text-sm leading-6">
                                <div>{x.question}</div>
                                <div>
                                    Ваша відповідь: {x.user} {x.ok ? '✅' : `❌ (правильно: ${x.correct})`}
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
            <p className="mt-4"><a className="inline-flex rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95" href="/trainer">Нове тренування</a></p>

            {/* Leaderboard */}
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 relative">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>Таблиця лідерів</h2>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 text-sm rounded border border-gray-200 disabled:opacity-50" disabled={!canPrev} onClick={() => setPage(p => Math.max(1, p - 1))}>Назад</button>
                        <span className="text-sm text-gray-600">Стор. {page} / {totalPages}</span>
                        <button className="px-3 py-1.5 text-sm rounded border border-gray-200 disabled:opacity-50" disabled={!canNext} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Далі</button>
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <input className="rounded border border-gray-200 px-3 py-1.5 text-sm" placeholder="Моє ім'я або email" value={findQuery} onChange={(e) => setFindQuery(e.target.value)} />
                    <button className="px-3 py-1.5 text-sm rounded border border-gray-200" onClick={handleFindMe}>Знайти мене</button>
                </div>
                <div className="mt-4 divide-y">
                    {current.map((row, idx) => (
                        <div key={start + idx} className={`flex items-center justify-between py-2 ${highlightName === row.name ? 'bg-yellow-50' : ''}`}>
                            <div className="flex items-center gap-3">
                                {renderPlaceIcon(start + idx)}
                                <span className="text-sm text-gray-800">{row.name}</span>
                            </div>
                            <div className="text-sm text-gray-700">{row.score} балів</div>
                        </div>
                    ))}
                </div>
                {!loading && !isAuthenticated && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(131, 131, 131, 0.1)' }}>
                        <div className="rounded-2xl border p-6 text-center shadow-sm max-w-sm" style={{ background: 'var(--surface-solid)', color: 'var(--ink)', borderColor: 'var(--border)' }}>
                            <div className="text-base font-semibold mb-2" style={{ color: 'var(--accent)' }}>Доступ лише для зареєстрованих</div>
                            <div className="text-sm mb-3 text-gray-600">Щоб переглядати таблицю лідерів, увійдіть або зареєструйтеся.</div>
                            <div className="flex items-center justify-center gap-2">
                                <a href="/auth/login" className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border" style={{ background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}>Увійти</a>
                                <a href="/auth/register" className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border" style={{ background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}>Зареєструватися</a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}


