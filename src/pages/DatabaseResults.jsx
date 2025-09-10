export default function DatabaseResults({ mode = 'article', code = '', query = '', content = '', results = [], primaryUrl = '' }) {
    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>Результати</h1>
            <p className="mt-1 text-sm" style={{ color: '#6b7280' }}>Кодекс: {code}. Запит: {query}</p>

            {mode === 'article' ? (
                content ? (
                    <>
                        <div className="mt-3">
                            {primaryUrl && (
                                <a className="inline-flex rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95" href={primaryUrl} target="_blank" rel="noreferrer">Читати у першоджерелі</a>
                            )}
                        </div>
                        <pre className="mt-4 overflow-auto" style={{ whiteSpace: 'pre-wrap', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>{content}</pre>
                    </>
                ) : (
                    <p>Статтю не знайдено.</p>
                )
            ) : (
                results && results.length > 0 ? (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {results.map((r, idx) => (
                            <div key={idx} className="card" style={{ whiteSpace: 'pre-wrap' }}>
                                <div className="text-sm" style={{ color: '#6b7280' }}>Стаття {r.num}</div>
                                <div>{r.snippet || r}</div>
                                {r.link && (
                                    <a className="mt-2 inline-flex rounded-md bg-[#1E3A8A] px-3 py-1 text-xs font-medium text-white hover:opacity-95" href={r.link} target="_blank" rel="noreferrer">Читати у першоджерелі</a>
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


