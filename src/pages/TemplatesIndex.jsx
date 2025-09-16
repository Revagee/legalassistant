import { useMemo, useState } from 'react'
import { TEMPLATE_CATEGORIES } from '../lib/templates.js'

export default function TemplatesIndex({ categories = TEMPLATE_CATEGORIES }) {
    const [query, setQuery] = useState('')

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return categories
        const result = {}
        for (const [cat, items] of Object.entries(categories)) {
            const matched = items.filter((name) => String(name).toLowerCase().includes(q))
            if (matched.length) result[cat] = matched
        }
        return result
    }, [query, categories])

    const hasResults = useMemo(() => Object.keys(filtered || {}).length > 0, [filtered])

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Майстер документів</h1>
            <p className="mt-2 text-sm" style={{ color: '#4B5563' }}>Оберіть шаблон з категорії або скористайтесь пошуком:</p>

            <div className="mt-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Пошук шаблонів… (наприклад, позов, договір)"
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]"
                />
            </div>

            {!hasResults && query.trim() && (
                <p className="mt-4 text-sm" style={{ color: '#6b7280' }}>Нічого не знайдено за запитом «{query}».</p>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.entries(filtered).map(([cat, items]) => (
                    <div key={cat} className="rounded-xl border border-gray-200 bg-white p-5">
                        <h3 className="text-base font-semibold text-gray-900">{cat}</h3>
                        <ul className="mt-2 list-disc pl-6">
                            {items.map((item) => (
                                <li key={item} className="text-sm leading-7">
                                    <a className="text-[var(--accent)] hover:underline" href={`/template?key=${encodeURIComponent(item)}`}>{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}


