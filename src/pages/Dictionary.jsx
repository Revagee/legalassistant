import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ALL_TERMS from '../lib/terms.js'

export default function Dictionary({ q = '' }) {
    const [searchParams, setSearchParams] = useSearchParams()
    const initialQ = (searchParams.get('q') || q || '').toString()
    const [query, setQuery] = useState(initialQ)
    const [activeTerm, setActiveTerm] = useState('')

    useEffect(() => {
        const nextQ = (searchParams.get('q') || '').toString()
        if (nextQ !== query) setQuery(nextQ)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    const filtered = useMemo(() => {
        const value = (query || '').trim().toLowerCase()
        if (!value) return null
        const entries = Object.entries(ALL_TERMS)
        const startsWith = []
        const contains = []
        for (const [term, data] of entries) {
            const t = term.toLowerCase()
            // Поддерживаем как старый формат (строка), так и новый (объект)
            const definition = typeof data === 'string' ? data : data.definition
            const example = typeof data === 'object' ? data.example : null
            const d = (definition || '').toLowerCase()
            const ex = (example || '').toLowerCase()

            if (t.startsWith(value)) {
                startsWith.push({ term, definition, example })
            } else if (t.includes(value) || d.includes(value) || ex.includes(value)) {
                contains.push({ term, definition, example })
            }
        }
        return [...startsWith, ...contains]
    }, [query])

    // Нормализация структуры термина
    const getTermData = (term) => {
        const raw = ALL_TERMS[term]
        if (!raw) return null
        if (typeof raw === 'string') {
            return { term, definition: raw, description: raw, examples: [] }
        }
        const description = raw.description || raw.definition || ''
        const examples = Array.isArray(raw.examples)
            ? raw.examples
            : (raw.example ? [raw.example] : [])
        return { term, definition: raw.definition || '', description, examples }
    }

    const activeData = activeTerm ? getTermData(activeTerm) : null
    const showWiki = activeTerm ? activeTerm.trim().split(/\s+/).length < 3 : false

    // Подсветка термина в примерах «пузырьком»
    const highlightTermInline = (text, term) => {
        if (!text || !term) return text
        const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        const parts = text.split(re)
        return parts.map((part, idx) => {
            if (part.toLowerCase() === term.toLowerCase()) {
                return (
                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent)', border: '1px solid rgba(59,130,246,0.25)' }}>
                        {part}
                    </span>
                )
            }
            return <span key={idx}>{part}</span>
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const value = (query || '').trim()
        // Сбрасываем активную карточку при запуске поиска
        setActiveTerm('')
        if (value) setSearchParams({ q: value })
        else setSearchParams({})
    }

    const googleHref = useMemo(() => {
        const value = (query || '').trim()
        if (!value) return '#'
        const gq = `${value} це`
        return `https://www.google.com/search?q=${encodeURIComponent(gq)}`
    }, [query])

    const aiHref = useMemo(() => {
        const value = (query || '').trim()
        if (!value) return '/ai'
        const aq = `${value} це?`
        return `/ai?q=${encodeURIComponent(aq)}`
    }, [query])

    const termsByLetter = useMemo(() => {
        const sorted = Object.keys(ALL_TERMS).sort((a, b) => a.localeCompare(b, ['uk', 'ru'], { sensitivity: 'base' }))
        const grouped = {}

        for (const term of sorted) {
            const firstLetter = term.charAt(0).toUpperCase()
            if (!grouped[firstLetter]) {
                grouped[firstLetter] = []
            }
            grouped[firstLetter].push(term)
        }

        return grouped
    }, [])

    const amount = Object.keys(ALL_TERMS).length

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Юридичний словник</h1>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
                <input type="text" name="q" placeholder="Пошук терміну" value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2" style={{ background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--border)' }} />
                <button className="rounded-md px-5 py-3 text-sm font-medium hover:opacity-95" style={{ background: 'var(--accentBg)', color: 'var(--btnText)' }} type="submit">Пошук</button>
                <a className="rounded-md px-5 py-3 text-sm font-medium hover:opacity-95" style={{ background: '#475569', color: '#fff' }} href="/dictionary">Очистити</a>
            </form>

            {filtered !== null ? (
                // Режим детального просмотра активного термина
                activeData ? (
                    <div className="mt-6">
                        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>{activeTerm}</h2>
                                <button
                                    type="button"
                                    onClick={() => setActiveTerm('')}
                                    className="text-xs px-3 py-1.5 rounded hover:opacity-90"
                                    style={{ background: 'var(--accentBg)', color: 'var(--btnText)' }}
                                >
                                    Назад
                                </button>
                            </div>

                            {/* Описание (расширенное либо определение) */}
                            <div className="mt-3 text-sm leading-7" style={{ color: 'var(--muted)' }}>
                                {activeData.description}
                            </div>

                            {/* Примеры использования */}
                            {activeData.examples && activeData.examples.length > 0 && (
                                <div className="mt-5 space-y-3">
                                    {activeData.examples.map((ex, i) => (
                                        <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>Приклад {i + 1}</div>
                                            <div className="text-sm italic leading-6" style={{ color: 'var(--ink)' }}>
                                                {highlightTermInline(ex, activeTerm)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Действия */}
                            <div className="mt-6 flex flex-col sm:flex-row gap-2">
                                <a
                                    className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium hover:opacity-95"
                                    style={{ background: 'var(--accentBg)', color: 'var(--btnText)' }}
                                    href={`/ai?q=${encodeURIComponent(`${activeTerm} це?`)}`}
                                >
                                    Поставити питання ШІ
                                </a>
                                <a
                                    className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium hover:opacity-95"
                                    style={{ background: '#475569', color: '#fff' }}
                                    href={`https://www.google.com/search?q=${encodeURIComponent(`${activeTerm} це`)}`}
                                    target="_blank" rel="noopener noreferrer"
                                >
                                    Шукати в Google
                                </a>
                                {showWiki && (
                                    <a
                                        className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium hover:opacity-95"
                                        style={{ background: '#2563EB', color: '#fff' }}
                                        href={`https://uk.wikipedia.org/wiki/${encodeURIComponent(activeTerm)}`}
                                        target="_blank" rel="noopener noreferrer"
                                    >
                                        Wikipedia
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Список карточек терминов
                    filtered && filtered.length > 0 ? (
                        <div className="mt-6 grid gap-4">
                            {filtered.map((r) => (
                                <div key={r.term} className="rounded-xl p-5 cursor-pointer hover:opacity-95" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={() => setActiveTerm(r.term)}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{r.term}</div>
                                            <div className="mt-2 text-sm leading-6 line-clamp-3" style={{ color: 'var(--muted)' }}>{r.definition}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setActiveTerm(r.term) }}
                                            aria-label="Детальніше"
                                            className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-md"
                                            style={{ background: 'var(--accentBg)', color: 'var(--btnText)' }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="m9 18 6-6-6-6" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-6">
                            <p className="text-sm" style={{ color: '#4B5563' }}>Нічого не знайдено.</p>
                            <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                <a className="inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-95" href={googleHref} target="_blank" rel="noopener noreferrer">Шукати в Google</a>
                                <a className="inline-flex items-center justify-center rounded-md bg-gray-700 px-5 py-2.5 text-sm font-medium text-white hover:opacity-95" href={aiHref}>Поставити питання ШІ</a>
                            </div>
                        </div>
                    )
                )
            ) : (
                <>
                    <h3 className="mt-8 text-lg font-semibold" style={{ color: 'var(--ink)' }}>Список термінів {amount > 0 ? `(${amount})` : ''}</h3>
                    <div className="mt-3 rounded-xl p-5 max-h-[420px] overflow-auto" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        {Object.entries(termsByLetter).map(([letter, terms]) => (
                            <div key={letter} className="mb-6 last:mb-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <h4 className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{letter}</h4>
                                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }}></div>
                                </div>
                                <ul className="pl-2 [column-count:1] sm:[column-count:2] [column-gap:24px]">
                                    {terms.map((term) => (
                                        <li
                                            key={term}
                                            className="break-inside-avoid text-sm leading-7 cursor-pointer hover:underline"
                                            style={{ color: 'var(--ink)' }}
                                            onClick={() => setQuery(term)}
                                        >
                                            {term}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}


