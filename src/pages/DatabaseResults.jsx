export default function DatabaseResults({ mode = 'article', code = '', query = '', content = '', results = [], primaryUrl = '' }) {
    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Результати</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>Кодекс: {code}. Запит: {query}</p>

            {mode === 'article' ? (
                content ? (
                    <>
                        <div className="mt-3">
                            {primaryUrl && (
                                <a className="inline-flex rounded-md px-4 py-2 text-sm font-medium hover:opacity-95" style={{ background: 'var(--accentBg)', color: 'var(--btnText)' }} href={primaryUrl} target="_blank" rel="noreferrer">Читати у першоджерелі</a>
                            )}
                        </div>
                        <pre className="mt-4 overflow-auto" style={{ whiteSpace: 'pre-wrap', border: '1px solid var(--border)', borderRadius: 8, padding: 12, background: 'var(--surface)', color: 'var(--ink)' }}>{content}</pre>
                    </>
                ) : (
                    <p>Статтю не знайдено.</p>
                )
            ) : (
                results && results.length > 0 ? (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {results.map((r, idx) => (
                            <div key={idx} className="card" style={{ whiteSpace: 'pre-wrap', background: 'var(--surface)', border: '1px solid var(--border)', backdropFilter: 'saturate(1.1) blur(1px)' }}>
                                <div className="text-sm" style={{ color: 'var(--muted)' }}>{r.codeName ? `${r.codeName}: ` : ''}Стаття {r.num}</div>
                                <div>{r.snippet || r}</div>
                                {r.link && (
                                    <a className="mt-2 inline-flex rounded-md px-3 py-1 text-xs font-medium hover:opacity-95 focus:outline-none" style={{ background: 'var(--accentBg)', color: 'var(--btnText)', outline: '2px solid transparent' }} href={r.link} target="_blank" rel="noreferrer" onFocus={(e) => { e.currentTarget.style.outline = `2px solid var(--ring)`; e.currentTarget.style.outlineOffset = '2px' }} onBlur={(e) => { e.currentTarget.style.outline = '2px solid transparent' }}>Читати у першоджерелі</a>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Нічого не знайдено.</p>
                )
            )}
        </div>
    )
}


