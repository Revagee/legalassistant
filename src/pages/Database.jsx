import { useMemo, useState } from 'react'
import DatabaseResults from './DatabaseResults.jsx'

// Офіційні назви і ідентифікатори (як у вашому списку)
const LEGAL_CODES = {
    'Конституція України': { id: '254к/96-вр' },
    'Цивільний кодекс України': { id: '435-15' },
    'Кримінальний кодекс України': { id: '2341-14' },
    'Сімейний кодекс України': { id: '2947-14' },
    'Кодекс законів про працю України': { id: '322-08' },
    'Кримінальний процесуальний кодекс України': { id: '4651-17' },
    'Цивільний процесуальний кодекс України': { id: '1618-15' },
    'Господарський кодекс України': { id: '436-15' },
    'Господарський процесуальний кодекс України': { id: '1798-12' },
    'Кодекс України про адміністративні правопорушення': { id: '80731-10' },
    'Кодекс адміністративного судочинства України': { id: '2747-15' },
    'Податковий кодекс України': { id: '2755-17' },
    'Митний кодекс України': { id: '4495-17' },
    'Земельний кодекс України': { id: '2768-14' },
    'Водний кодекс України': { id: '213/95-вр' },
    'Лісовий кодекс України': { id: '3852-12' },
    'Повітряний кодекс України': { id: '3393-17' },
    'Бюджетний кодекс України': { id: '2456-17' },
    'Виборчий кодекс України': { id: '396-20' },
    'Кодекс України з процедур банкрутства': { id: '2597-19' },
    'Житловий кодекс України': { id: '5464-10' }
}

function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function idToLocalFilename(id) {
    return String(id).replace(/\//g, '_')
}

async function fetchCodeHtml(codeId) {
    const res = await fetch(`/codes/${idToLocalFilename(codeId)}.html`)
    if (!res.ok) throw new Error('Не вдалося завантажити документ')
    return await res.text()
}

async function fetchCodeJson(codeId) {
    const res = await fetch(`/codes/${idToLocalFilename(codeId)}.json`)
    if (!res.ok) throw new Error('no-json')
    return await res.json()
}

function extractTextFromHtml(html) {
    try {
        const dom = new DOMParser().parseFromString(html, 'text/html')
        const container = dom.getElementById('article') || dom.body
        return (container?.textContent || '').replace(/\r\n/g, '\n')
    } catch {
        return html
    }
}

function splitArticles(text) {
    const t = text.replace(/\u00A0/g, ' ')
    const re = /(^|\n)\s*Стаття\s+([^.\n]+)\.(.*?)(?=(\n\s*Стаття\s+[^.\n]+\.|$))/gms
    const list = []
    let m
    while ((m = re.exec(t)) !== null) {
        const num = String(m[2]).trim()
        const body = (`Стаття ${num}.` + String(m[3])).trim()
        list.push({ num, body })
    }
    return list
}

export default function Database() {
    const names = useMemo(() => Object.keys(LEGAL_CODES), [])
    const [selectedName, setSelectedName] = useState(names[0] || '')
    const [articleQuery, setArticleQuery] = useState('')
    const [keywordQuery, setKeywordQuery] = useState('')

    const [articleContent, setArticleContent] = useState('')
    const [primaryUrl, setPrimaryUrl] = useState('')
    const [keywordResults, setKeywordResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function ensureLoadedAndSplit(codeId) {
        // 1) Спроба JSON (структурований і швидший)
        try {
            const json = await fetchCodeJson(codeId)
            if (json && json.articles && typeof json.articles === 'object') {
                const list = []
                for (const num of Object.keys(json.articles)) {
                    const body = String(json.articles[num] || '')
                    const hasPrefix = /^\s*Стаття\s+/i.test(body)
                    list.push({ num, body: hasPrefix ? body : `Стаття ${num}. ${body}` })
                }
                list.sort((a, b) => a.num.localeCompare(b.num, 'uk', { numeric: true }))
                return list
            }
        } catch {
            // ідемо на HTML
        }
        const html = await fetchCodeHtml(codeId)
        const text = extractTextFromHtml(html)
        return splitArticles(text)
    }

    async function onSearchArticle(e) {
        e.preventDefault()
        setError('')
        setKeywordResults([])
        setArticleContent('')
        if (!selectedName) { setError('Оберіть кодекс'); return }
        if (!articleQuery.trim()) { setError('Вкажіть номер статті'); return }
        setLoading(true)
        try {
            const codeId = LEGAL_CODES[selectedName].id
            const articles = await ensureLoadedAndSplit(codeId)
            const q = articleQuery.trim()
            let found = articles.find(a => a.num.toLowerCase() === q.toLowerCase())
            if (!found) {
                try {
                    const re = new RegExp(`(^|\\n)\\s*Стаття\\s+${escapeRegExp(q)}\\b?\\.`, 'i')
                    found = articles.find(a => re.test(a.body))
                } catch {
                    found = articles.find(a => a.body.toLowerCase().includes(`стаття ${q.toLowerCase()}`))
                }
            }
            setArticleContent(found ? found.body : '')
            setPrimaryUrl(found ? `/ui/database/read?code=${encodeURIComponent(codeId)}&article=${encodeURIComponent(found.num)}` : '')
        } catch (err) {
            setError(err.message || 'Помилка завантаження')
        } finally {
            setLoading(false)
        }
    }

    async function onSearchKeyword(e) {
        e.preventDefault()
        setError('')
        setArticleContent('')
        setKeywordResults([])
        if (!selectedName) { setError('Оберіть кодекс'); return }
        if (!keywordQuery.trim()) { setError('Вкажіть ключові слова'); return }
        setLoading(true)
        try {
            const codeId = LEGAL_CODES[selectedName].id
            const articles = await ensureLoadedAndSplit(codeId)
            const q = keywordQuery.trim()
            let re
            try { re = new RegExp(escapeRegExp(q), 'i') } catch { re = null }
            const results = []
            for (const a of articles) {
                const idx = re ? a.body.search(re) : a.body.toLowerCase().indexOf(q.toLowerCase())
                if (idx >= 0) {
                    const start = Math.max(0, idx - 120)
                    const end = Math.min(a.body.length, idx + 280)
                    const snippet = a.body.slice(start, end).trim()
                    results.push({ num: a.num, snippet, link: `/ui/database/read?code=${encodeURIComponent(codeId)}&article=${encodeURIComponent(a.num)}` })
                }
            }
            setKeywordResults(results)
        } catch (err) {
            setError(err.message || 'Помилка завантаження')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>База кодексів</h1>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <form onSubmit={onSearchArticle} className="rounded-xl border border-gray-200 bg-white p-5">
                    <label className="text-sm font-semibold text-gray-900">Кодекс
                        <select name="code" value={selectedName} onChange={e => setSelectedName(e.target.value)} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]">
                            {names.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </label>
                    <label className="mt-4 block text-sm font-semibold text-gray-900">Номер статті
                        <input type="text" name="article" value={articleQuery} onChange={e => setArticleQuery(e.target.value)} placeholder="напр., 130 або 130-1 або 130а" className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                    </label>
                    <button className="mt-4 rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95" type="submit">Шукати статтю</button>
                </form>

                <form onSubmit={onSearchKeyword} className="rounded-xl border border-gray-200 bg-white p-5">
                    <label className="text-sm font-semibold text-gray-900">Кодекс
                        <select name="code" value={selectedName} onChange={e => setSelectedName(e.target.value)} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]">
                            {names.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </label>
                    <label className="mt-4 block text-sm font-semibold text-gray-900">Ключові слова
                        <input type="text" name="keyword" value={keywordQuery} onChange={e => setKeywordQuery(e.target.value)} placeholder="напр., неустойка, аліменти, 625" className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                    </label>
                    <button className="mt-4 rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95" type="submit">Пошук за ключовими словами</button>
                </form>
            </div>

            {loading && <p className="mt-4 text-sm" style={{ color: '#6b7280' }}>Завантаження…</p>}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            {(articleContent || (keywordResults && keywordResults.length > 0)) && (
                <div className="mt-6">
                    <DatabaseResults mode={articleContent ? 'article' : 'keyword'} code={selectedName} query={articleContent ? articleQuery : keywordQuery} content={articleContent} results={keywordResults} primaryUrl={primaryUrl} />
                </div>
            )}
        </div>
    )
}


