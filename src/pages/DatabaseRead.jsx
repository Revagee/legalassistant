import { useEffect, useMemo, useRef, useState } from 'react'

function idToLocalFilename(id) {
    return String(id).replace(/\//g, '_')
}

function getParam(name) {
    const u = new URL(window.location.href)
    return u.searchParams.get(name) || ''
}

export default function DatabaseRead() {
    const code = useMemo(() => getParam('code'), [])
    const article = useMemo(() => getParam('article'), [])
    const [html, setHtml] = useState('')
    const [error, setError] = useState('')
    const containerRef = useRef(null)

    useEffect(() => {
        let cancelled = false
        async function run() {
            try {
                const res = await fetch(`/codes/${idToLocalFilename(code)}.html`)
                if (!res.ok) throw new Error('Не вдалося завантажити документ')
                const text = await res.text()
                if (!cancelled) setHtml(text)
            } catch (e) {
                if (!cancelled) setError(e.message || 'Помилка завантаження')
            }
        }
        if (code) run()
        return () => { cancelled = true }
    }, [code])

    useEffect(() => {
        if (!html || !article) return
        // Даем браузеру вставить HTML, затем пытаемся проскроллить
        const t = setTimeout(() => {
            try {
                const root = containerRef.current
                if (!root) return
                // Ищем элементы, содержащие точный текст заголовка статьи
                const headingText = `Стаття ${article}.`
                const candidates = root.querySelectorAll('*')
                let target = null
                for (const el of candidates) {
                    const txt = (el.textContent || '').trim()
                    if (txt.startsWith(headingText)) { target = el; break }
                }
                if (!target) {
                    // Фолбек — якоря виду n123 чи просто перша згадка
                    const anchors = root.querySelectorAll('a[name], [id]')
                    if (anchors.length > 0) target = anchors[0]
                }
                if (target && typeof target.scrollIntoView === 'function') {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
            } catch { }
        }, 50)
        return () => clearTimeout(t)
    }, [html, article])

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <p><a className="text-[var(--accent)] hover:underline" href="/database">← Повернутися до пошуку</a></p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Першоджерело</h1>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            {!error && !html && <p className="mt-4 text-sm" style={{ color: '#6b7280' }}>Завантаження…</p>}
            <div ref={containerRef} className="mt-4 prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
}


