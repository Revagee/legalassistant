import { useEffect, useMemo, useState } from 'react'
import * as Switch from '@radix-ui/react-switch'
import { RadioCards, Select } from '@radix-ui/themes'
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
    const [mode, setMode] = useState('article') // 'article' | 'keyword'
    const [queryValue, setQueryValue] = useState('')
    const [autoAll, setAutoAll] = useState(false)

    const [articleContent, setArticleContent] = useState('')
    const [primaryUrl, setPrimaryUrl] = useState('')
    const [keywordResults, setKeywordResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        // При увімкненому Автоматично — тільки пошук за ключовими словами
        if (autoAll && mode === 'article') {
            setMode('keyword')
        }
    }, [autoAll, mode])

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
        if (e && e.preventDefault) e.preventDefault()
        setError('')
        setKeywordResults([])
        setArticleContent('')
        if (!selectedName) { setError('Оберіть кодекс'); return }
        if (!queryValue.trim()) { setError('Вкажіть номер статті'); return }
        setLoading(true)
        try {
            const codeId = LEGAL_CODES[selectedName].id
            const articles = await ensureLoadedAndSplit(codeId)
            const q = queryValue.trim()
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
            setPrimaryUrl(found ? `/database/read?code=${encodeURIComponent(codeId)}&article=${encodeURIComponent(found.num)}` : '')
        } catch (err) {
            setError(err.message || 'Помилка завантаження')
        } finally {
            setLoading(false)
        }
    }

    async function onSearchKeyword(e) {
        if (e && e.preventDefault) e.preventDefault()
        setError('')
        setArticleContent('')
        setKeywordResults([])
        if (!selectedName) { setError('Оберіть кодекс'); return }
        if (!queryValue.trim()) { setError('Вкажіть ключові слова'); return }
        setLoading(true)
        try {
            const codeId = LEGAL_CODES[selectedName].id
            const articles = await ensureLoadedAndSplit(codeId)
            const q = queryValue.trim()
            let re
            try { re = new RegExp(escapeRegExp(q), 'i') } catch { re = null }
            const results = []
            for (const a of articles) {
                const idx = re ? a.body.search(re) : a.body.toLowerCase().indexOf(q.toLowerCase())
                if (idx >= 0) {
                    const start = Math.max(0, idx - 120)
                    const end = Math.min(a.body.length, idx + 280)
                    const snippet = a.body.slice(start, end).trim()
                    results.push({ num: a.num, snippet, link: `/database/read?code=${encodeURIComponent(codeId)}&article=${encodeURIComponent(a.num)}` })
                }
            }
            setKeywordResults(results)
        } catch (err) {
            setError(err.message || 'Помилка завантаження')
        } finally {
            setLoading(false)
        }
    }

    async function onSearchKeywordAll(e) {
        if (e && e.preventDefault) e.preventDefault()
        setError('')
        setArticleContent('')
        setKeywordResults([])
        if (!queryValue.trim()) { setError('Вкажіть ключові слова'); return }
        setLoading(true)
        try {
            const q = queryValue.trim()
            let re
            try { re = new RegExp(escapeRegExp(q), 'i') } catch { re = null }
            const results = []
            const entries = Object.entries(LEGAL_CODES)
            // Паралельне завантаження всіх кодексів
            const lists = await Promise.all(entries.map(async ([name, meta]) => {
                try {
                    const arr = await ensureLoadedAndSplit(meta.id)
                    return [name, meta.id, arr]
                } catch {
                    return [name, meta.id, []]
                }
            }))
            for (const [name, codeId, articles] of lists) {
                for (const a of articles) {
                    const idx = re ? a.body.search(re) : a.body.toLowerCase().indexOf(q.toLowerCase())
                    if (idx >= 0) {
                        const start = Math.max(0, idx - 120)
                        const end = Math.min(a.body.length, idx + 280)
                        const snippet = a.body.slice(start, end).trim()
                        results.push({ codeName: name, num: a.num, snippet, link: `/database/read?code=${encodeURIComponent(codeId)}&article=${encodeURIComponent(a.num)}` })
                    }
                }
            }
            setKeywordResults(results)
        } catch (err) {
            setError(err.message || 'Помилка завантаження')
        } finally {
            setLoading(false)
        }
    }

    async function onSubmitUnified(e) {
        e.preventDefault()
        if (autoAll) {
            await onSearchKeywordAll()
        } else {
            if (mode === 'article') {
                await onSearchArticle()
            } else {
                await onSearchKeyword()
            }
        }
    }

    return (
        <div id="database-page" className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>База кодексів</h1>

            <form onSubmit={onSubmitUnified} className="mt-6 rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', backdropFilter: 'saturate(1.1) blur(2px)' }}>
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Режим пошуку</span>
                        <RadioCards.Root
                            value={mode}
                            onValueChange={(val) => {
                                if (!val) return
                                if (autoAll && val === 'article') return
                                setMode(val)
                            }}
                            columns={{ initial: '1', sm: '2' }}
                        >
                            <RadioCards.Item disabled={autoAll} value="article" style={{ color: 'white' }}>
                                <div className="text-sm font-medium">Стаття</div>
                            </RadioCards.Item>
                            <RadioCards.Item value="keyword" style={{ color: 'white' }}>
                                <div className="text-sm font-medium">Ключові слова</div>
                            </RadioCards.Item>
                        </RadioCards.Root>
                    </div>
                    <div className="flex items-center gap-3 justify-end mt-4" style={{ alignSelf: 'center' }}>
                        <Switch.Root
                            checked={autoAll}
                            onCheckedChange={setAutoAll}
                            aria-label="Автоматичний пошук по всіх кодексах"
                            className="group relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-200 outline-none transition-colors data-[state=checked]:bg-[var(--accent)]"
                        >
                            <Switch.Thumb className="pointer-events-none block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform will-change-transform group-data-[state=checked]:translate-x-[22px]" />
                        </Switch.Root>
                        <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Автоматично</span>
                    </div>
                </div>

                {!autoAll && (
                    <div className="mt-4">
                        <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Кодекс</label>
                        <div className="mt-1">
                            <Select.Root value={selectedName} onValueChange={setSelectedName}>
                                <Select.Trigger className="w-full" />
                                <Select.Content>
                                    {names.map((n) => (
                                        <Select.Item key={n} value={n}>{n}</Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>
                        </div>
                    </div>
                )}

                <div className="mt-4">
                    <label className="block text-sm font-semibold" style={{ color: 'var(--ink)' }}>{mode === 'article' ? 'Номер статті' : 'Ключові слова'}
                        <input type="text" value={queryValue} onChange={e => setQueryValue(e.target.value)} placeholder={mode === 'article' ? 'напр., 130 або 130-1 або 130а' : 'напр., неустойка, аліменти, 625'} className="mt-1 w-full rounded-md px-3 py-2 text-sm focus:outline-none" style={{ background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--border)', boxShadow: 'none', outline: '2px solid transparent' }} onFocus={(e) => { e.currentTarget.style.outline = `2px solid var(--ring)`; e.currentTarget.style.outlineOffset = '2px' }} onBlur={(e) => { e.currentTarget.style.outline = '2px solid transparent' }} />
                    </label>
                </div>

                <button className="mt-4 rounded-md px-4 py-2 text-sm font-medium hover:opacity-95" style={{ background: 'var(--accentBg)', color: 'var(--btnText)' }} type="submit">Пошук</button>
            </form>

            {loading && <p className="mt-4 text-sm" style={{ color: 'var(--muted)' }}>Завантаження…</p>}
            {error && <p className="mt-4 text-sm" style={{ color: '#ef4444' }}>{error}</p>}

            {(articleContent || (keywordResults && keywordResults.length > 0)) && (
                <div className="mt-6">
                    <DatabaseResults mode={articleContent ? 'article' : 'keyword'} code={autoAll ? 'Усі кодекси' : selectedName} query={articleContent ? queryValue : queryValue} content={articleContent} results={keywordResults} primaryUrl={primaryUrl} />
                </div>
            )}
        </div>
    )
}


