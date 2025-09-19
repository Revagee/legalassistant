import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ALL_TERMS from '../lib/terms.js'

export default function Dictionary({ q = '' }) {
    const [searchParams, setSearchParams] = useSearchParams()
    const initialQ = (searchParams.get('q') || q || '').toString()
    const [query, setQuery] = useState(initialQ)

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
        for (const [term, definition] of entries) {
            const t = term.toLowerCase()
            const d = (definition || '').toLowerCase()
            if (t.startsWith(value)) {
                startsWith.push({ term, definition })
            } else if (t.includes(value) || d.includes(value)) {
                contains.push({ term, definition })
            }
        }
        return [...startsWith, ...contains]
    }, [query])

    const handleSubmit = (e) => {
        e.preventDefault()
        const value = (query || '').trim()
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

    const termList = useMemo(() => Object.keys(ALL_TERMS).sort((a, b) => a.localeCompare(b, ['uk', 'ru'], { sensitivity: 'base' })), [])

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Юридичний словник</h1>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
                <input type="text" name="q" placeholder="Пошук терміну" value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2" style={{ background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--border)' }} />
                <button className="rounded-md px-5 py-3 text-sm font-medium hover:opacity-95" style={{ background: 'var(--accentBg)', color: 'var(--btnText)' }} type="submit">Пошук</button>
                <a className="rounded-md px-5 py-3 text-sm font-medium hover:opacity-95" style={{ background: '#475569', color: '#fff' }} href="/dictionary">Очистити</a>
            </form>

            {filtered !== null ? (
                filtered && filtered.length > 0 ? (
                    <div className="mt-6 grid gap-4">
                        {filtered.map((r) => (
                            <div key={r.term} className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                                <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{r.term}</div>
                                <div className="mt-2 text-sm leading-6" style={{ color: 'var(--muted)' }}>{r.definition}</div>
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
            ) : (
                <>
                    <h3 className="mt-8 text-lg font-semibold" style={{ color: 'var(--ink)' }}>Список термінів</h3>
                    <div className="mt-3 rounded-xl p-5 max-h-[420px] overflow-auto" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <ul className="pl-5 [column-count:1] sm:[column-count:2] [column-gap:24px]">
                            {termList.map((term) => (
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
                </>
            )}
        </div>
    )
}


