import { useEffect, useMemo, useRef, useState } from 'react'
import * as Switch from '@radix-ui/react-switch'
import { RadioCards, Select } from '@radix-ui/themes'
import { generateDocxFile } from '../lib/docxGen.js'

// Офіційні назви і ідентифікатори (як у вашому списку)
const LEGAL_CODES = {
    "Бюджетний кодекс України": {
        "id": "Бюджетний_кодекс_України_Кодекс_України_№_2456_VI_від_08_07_2010"
    },
    "Виборчий кодекс України": {
        "id": "Виборчий_кодекс_України_Кодекс_України_№_396_IX_від_19_12_2019_d491286"
    },
    "Водний кодекс України": {
        "id": "Водний_кодекс_України_Кодекс_України_№_213_95_ВР_від_06_06_1995"
    },
    "Господарський процесуальний кодекс України": {
        "id": "Господарський_процесуальний_кодекс_України_Кодекс_України_№_1798"
    },
    "Житловий Кодекс України": {
        "id": "Житловий_Кодекс_України_Кодекс_України_№_5464_X_від_30_06_1983_d23508"
    },
    "Земельний кодекс України": {
        "id": "Земельний_кодекс_України_Кодекс_України_№_2768_III_від_25_10_2001"
    },
    "Кодекс України з процедур банкрутства": {
        "id": "Кодекс_України_з_процедур_банкрутства_Кодекс_України_№_2597_VIII"
    },
    "Кодекс України про адміністративні правопорушення (статті 1-212)": {
        "id": "Кодекс_України_про_адміністративні_правопорушення_статті…_Кодекс"
    },
    "Кодекс України про адміністративні правопорушення (статті 213-330)": {
        "id": "Кодекс_України_про_адміністративні_правопорушення_статті…_Кодекс (2)"
    },
    "Кодекс адміністративного судочинства України": {
        "id": "Кодекс_адміністративного_судочинства_України_Кодекс_України_№_2747"
    },
    "Кодекс законів про працю України": {
        "id": "Кодекс_законів_про_працю_України_Кодекс_України_№_322_VIII_від_10"
    },
    "Кодекс торговельного мореплавства України": {
        "id": "Кодекс_торговельного_мореплавства_України_Кодекс_України_№_176_95"
    },
    "Кодекс цивільного захисту України": {
        "id": "Кодекс_цивільного_захисту_України_Кодекс_України_№_5403_VI_від_02"
    },
    "Кримінальний кодекс України": {
        "id": "Кримінальний_кодекс_України_Кодекс_України_№_2341_III_від_05_04"
    },
    "Кримінальний процесуальний кодекс України": {
        "id": "Кримінальний_процесуальний_кодекс_України_Кодекс_України_№_4651"
    },
    "Кримінально виконавчий кодекс України": {
        "id": "Кримінально_виконавчий_кодекс_України_Кодекс_України_№_1129_IV_від"
    },
    "Лісовий кодекс України": {
        "id": "Лісовий_кодекс_України_Кодекс_України_№_3852_XII_від_21_01_1994"
    },
    "Митний кодекс України": {
        "id": "Митний_кодекс_України_Кодекс_України_№_4495_VI_від_13_03_2012_d377274"
    },
    "Повітряний кодекс України": {
        "id": "Повітряний_кодекс_України_Кодекс_України_№_3393_VI_від_19_05_2011"
    },
    "Податковий кодекс України": {
        "id": "Податковий_кодекс_України_Кодекс_України_№_2755_VI_від_02_12_2010"
    },
    "Про надра Кодекс України": {
        "id": "Про_надра_Кодекс_України_№_132_94_ВР_від_27_07_1994_d18971_20250117"
    },
    "Сімейний кодекс України": {
        "id": "Сімейний_кодекс_України_Кодекс_України_№_2947_III_від_10_01_2002"
    },
    "Цивільний кодекс України": {
        "id": "Цивільний_кодекс_України_Кодекс_України_№_435_IV_від_16_01_2003"
    },
    "Цивільний процесуальний кодекс України": {
        "id": "Цивільний_процесуальний_кодекс_України_Кодекс_України_№_1618_IV"
    }
}

function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function idToLocalFilename(id) {
    // Нормализуем в NFC, чтобы пути совпадали на Linux (Vercel)
    return String(id).normalize('NFC').replace(/\//g, '_')
}

function buildCodesUrl(codeId, ext) {
    const base = encodeURIComponent(idToLocalFilename(codeId))
    return `/codes/${base}.${ext}`
}

async function fetchCodeHtml(codeId) {
    // Пробуем .htm, затем .html
    let res = await fetch(buildCodesUrl(codeId, 'htm'))
    if (!res.ok) {
        res = await fetch(buildCodesUrl(codeId, 'html'))
    }
    if (!res.ok) throw new Error('Не вдалося завантажити документ')
    return await res.text()
}

async function fetchCodeJson(codeId) {
    const res = await fetch(buildCodesUrl(codeId, 'json'))
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
    const [keywordResults, setKeywordResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Новый state для превью документов
    const [selectedCodeId, setSelectedCodeId] = useState('')
    const [selectedCodeName, setSelectedCodeName] = useState('')
    const [previewHtml, setPreviewHtml] = useState('')
    const [previewLoading, setPreviewLoading] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [searchPerformed, setSearchPerformed] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const previewRef = useRef(null)

    // Проверка мобильного устройства
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        // При увімкненому Автоматично — тільки пошук за ключовими словами
        if (autoAll && mode === 'article') {
            setMode('keyword')
        }
    }, [autoAll, mode])

    // Загрузка превью документа
    async function loadDocumentPreview(codeId, codeName) {
        if (selectedCodeId === codeId && previewHtml) return // уже загружен

        setPreviewLoading(true)
        try {
            // Пробуем .htm, затем .html
            let res = await fetch(buildCodesUrl(codeId, 'htm'))
            if (!res.ok) {
                res = await fetch(buildCodesUrl(codeId, 'html'))
            }
            if (!res.ok) throw new Error('Не вдалося завантажити документ')
            const html = await res.text()
            setPreviewHtml(html)
            setSelectedCodeId(codeId)
            setSelectedCodeName(codeName)
        } catch (err) {
            setError(err.message || 'Помилка завантаження документа')
        } finally {
            setPreviewLoading(false)
        }
    }

    // Закрыть превью
    function closePreview() {
        setSelectedCodeId('')
        setSelectedCodeName('')
        setPreviewHtml('')
        setIsFullscreen(false)
    }

    // Скачать документ как DOCX
    async function downloadDocument() {
        if (!previewHtml || !selectedCodeName) return

        try {
            // Извлекаем текст из HTML
            const dom = new DOMParser().parseFromString(previewHtml, 'text/html')
            const container = dom.getElementById('article') || dom.body
            const textContent = (container?.textContent || '').replace(/\r\n/g, '\n')

            // Генерируем DOCX файл
            const file = await generateDocxFile({
                title: selectedCodeName,
                bodyText: textContent,
                fileName: `${selectedCodeName.replace(/[^\w\s-]/g, '_')}.docx`
            })

            // Скачиваем файл
            const url = URL.createObjectURL(file)
            const a = document.createElement('a')
            a.href = url
            a.download = file.name
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Помилка при генерації DOCX:', err)
            setError('Помилка при створенні документа для скачування')
        }
    }

    // Прокрутка к нужной статье в превью (поддержка div и iframe)
    function scrollToArticleInPreview(articleNum) {
        if (!previewRef.current) return
        setTimeout(() => {
            try {
                const headingText = `Стаття ${articleNum}.`
                let doc
                if (previewRef.current.tagName === 'IFRAME') {
                    doc = previewRef.current.contentDocument || previewRef.current.contentWindow?.document
                } else {
                    doc = previewRef.current
                }
                if (!doc) return
                const root = doc.body || doc
                const candidates = root.querySelectorAll('*')
                let target = null
                for (const el of candidates) {
                    const txt = (el.textContent || '').trim()
                    if (txt.startsWith(headingText)) { target = el; break }
                }
                if (target && typeof target.scrollIntoView === 'function') {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
            } catch { /* ignore */ }
        }, 150)
    }

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
        setSearchPerformed(true)
        if (!selectedName) { setError('Оберіть документ'); return }
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
        setSearchPerformed(true)
        if (!selectedName) { setError('Оберіть документ'); return }
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
                    results.push({
                        num: a.num,
                        snippet,
                        codeId: codeId,
                        codeName: selectedName,
                        link: `/database/read?code=${encodeURIComponent(codeId)}&article=${encodeURIComponent(a.num)}`
                    })
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
        setSearchPerformed(true)
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
                        results.push({
                            codeName: name,
                            num: a.num,
                            snippet,
                            codeId: codeId,
                            link: `/database/read?code=${encodeURIComponent(codeId)}&article=${encodeURIComponent(a.num)}`
                        })
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
        <div id="database-page" className="flex flex-col" style={{ height: '85vh' }}>
            <div className="flex-1 flex overflow-hidden">
                {/* Левая колонка - поиск и результаты */}
                {!isFullscreen && (
                    <div className={`${isMobile ? 'w-full' : 'w-1/3'} border-r flex flex-col`} style={{ borderColor: 'var(--border)' }}>
                        {/* Заголовок и форма поиска */}
                        <div className="p-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4" style={{ color: 'var(--accent)' }}>Законодавча база</h1>
                            <form onSubmit={onSubmitUnified}>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Режим пошуку</span>
                                        <RadioCards.Root
                                            value={mode}
                                            onValueChange={(val) => {
                                                if (!val) return
                                                if (autoAll && val === 'article') return
                                                setMode(val)
                                            }}
                                            columns={{ initial: '2' }}
                                            className="mt-2"
                                        >
                                            <RadioCards.Item disabled={autoAll} value="article" style={{ color: 'white' }}>
                                                <div className="text-sm font-medium">Стаття</div>
                                            </RadioCards.Item>
                                            <RadioCards.Item value="keyword" style={{ color: 'white' }}>
                                                <div className="text-sm font-medium">Ключові слова</div>
                                            </RadioCards.Item>
                                        </RadioCards.Root>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Switch.Root
                                            checked={autoAll}
                                            onCheckedChange={setAutoAll}
                                            aria-label="Автоматичний пошук по всіх документах"
                                            className="group relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-200 outline-none transition-colors data-[state=checked]:bg-[var(--accent)]"
                                        >
                                            <Switch.Thumb className="pointer-events-none block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform will-change-transform group-data-[state=checked]:translate-x-[22px]" />
                                        </Switch.Root>
                                        <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Автоматично</span>
                                    </div>

                                    {!autoAll && (
                                        <div>
                                            <label className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Документ</label>
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

                                    <div>
                                        <label className="block text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                                            {mode === 'article' ? 'Номер статті' : 'Ключові слова'}
                                        </label>
                                        <input
                                            type="text"
                                            value={queryValue}
                                            onChange={e => setQueryValue(e.target.value)}
                                            placeholder={mode === 'article' ? 'напр., 130 або 130-1 або 130а' : 'напр., неустойка, аліменти, 625'}
                                            className="mt-1 w-full rounded-md px-3 py-2 text-sm focus:outline-none"
                                            style={{
                                                background: 'var(--surface)',
                                                color: 'var(--ink)',
                                                border: '1px solid var(--border)',
                                                boxShadow: 'none',
                                                outline: '2px solid transparent'
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.outline = `2px solid var(--ring)`
                                                e.currentTarget.style.outlineOffset = '2px'
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.outline = '2px solid transparent'
                                            }}
                                        />
                                    </div>

                                    <button
                                        className="w-full rounded-md px-4 py-2 text-sm font-medium hover:opacity-95"
                                        style={{ background: 'var(--accentBg)', color: 'var(--btnText)' }}
                                        type="submit"
                                    >
                                        Пошук
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Результаты поиска или заглушка */}
                        <div className="flex-1 overflow-auto p-4">
                            {loading && <p className="text-sm text-center" style={{ color: 'var(--muted)' }}>Завантаження…</p>}
                            {error && <p className="text-sm text-center" style={{ color: '#ef4444' }}>{error}</p>}

                            {!loading && !error && !searchPerformed && (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-sm italic text-center" style={{ color: 'var(--muted)' }}>
                                        Тут відобразяться результати пошуку
                                    </p>
                                </div>
                            )}

                            {searchPerformed && !loading && (
                                <SearchResults
                                    articleContent={articleContent}
                                    keywordResults={keywordResults}
                                    query={queryValue}
                                    selectedName={autoAll ? 'Усі документи' : selectedName}
                                    onOpenPreview={loadDocumentPreview}
                                    onScrollToArticle={scrollToArticleInPreview}
                                    isMobile={isMobile}
                                    setIsFullscreen={setIsFullscreen}
                                    legalCodes={LEGAL_CODES}
                                />
                            )}

                            {/* Мобильная версия: список всех кодексов под результатами поиска */}
                            {isMobile && (
                                <div className="mt-6">
                                    {searchPerformed && (keywordResults.length > 0 || articleContent) && (
                                        <hr className="my-4" style={{ borderColor: 'var(--border)' }} />
                                    )}
                                    <MobileCodesGrid
                                        codes={LEGAL_CODES}
                                        onSelectCode={(codeId, codeName) => {
                                            loadDocumentPreview(codeId, codeName)
                                            setIsFullscreen(true)
                                        }}
                                        showTitle={!searchPerformed || !(keywordResults.length > 0 || articleContent)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Правая часть - список кодексов или превью */}
                {(!isMobile || isFullscreen) && (
                    <div className="flex-1 flex flex-col">
                        {selectedCodeId ? (
                            <DocumentPreview
                                codeName={selectedCodeName}
                                html={previewHtml}
                                loading={previewLoading}
                                onClose={isFullscreen ? () => setIsFullscreen(false) : closePreview}
                                onDownload={downloadDocument}
                                onFullscreen={() => setIsFullscreen(true)}
                                previewRef={previewRef}
                                isFullscreen={isFullscreen}
                            />
                        ) : (
                            <CodesTable
                                codes={LEGAL_CODES}
                                onSelectCode={loadDocumentPreview}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// Компонент для отображения результатов поиска
function SearchResults({ articleContent, keywordResults, query, selectedName, onOpenPreview, onScrollToArticle, isMobile, setIsFullscreen, legalCodes }) {
    if (articleContent) {
        // Извлекаем номер статьи из контента
        const articleMatch = articleContent.match(/Стаття\s+([^.]+)\./i)
        const articleNum = articleMatch ? articleMatch[1].trim() : ''

        return (
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                        Результат пошуку статті
                    </h3>
                    <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
                        Документ: {selectedName}. Запит: {query}
                    </p>
                    <pre className="text-xs overflow-auto p-3 rounded border mb-3" style={{
                        whiteSpace: 'pre-wrap',
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--ink)'
                    }}>
                        {articleContent}
                    </pre>
                    {articleNum && (
                        <button
                            onClick={() => {
                                // Находим ID кодекса по его названию
                                const codeEntry = Object.entries(legalCodes).find(([name]) => name === selectedName)
                                if (codeEntry) {
                                    const [codeName, meta] = codeEntry
                                    onOpenPreview(meta.id, codeName)
                                    if (isMobile) {
                                        setIsFullscreen(true)
                                    }
                                    setTimeout(() => onScrollToArticle(articleNum), 500)
                                }
                            }}
                            className="text-xs px-2 py-1 rounded hover:opacity-80"
                            style={{ background: 'var(--accentBg)', color: 'var(--btnText)' }}
                        >
                            Переглянути в документі
                        </button>
                    )}
                </div>
            </div>
        )
    }

    if (keywordResults && keywordResults.length > 0) {
        return (
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                        Результати пошуку: {keywordResults.length}
                    </h3>
                    <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
                        Запит: {query}
                    </p>
                </div>
                <div className="space-y-3">
                    {keywordResults.map((result, idx) => (
                        <div key={idx} className="p-3 rounded border" style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)'
                        }}>
                            <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>
                                {result.codeName ? `${result.codeName}: ` : ''}Стаття {result.num}
                            </div>
                            <div className="text-xs mb-2" style={{ color: 'var(--ink)' }}>
                                {result.snippet}
                            </div>
                            <button
                                onClick={() => {
                                    const codeId = result.codeId
                                    const codeName = result.codeName || selectedName
                                    onOpenPreview(codeId, codeName)
                                    if (isMobile) {
                                        setIsFullscreen(true)
                                    }
                                    setTimeout(() => onScrollToArticle(result.num), 500)
                                }}
                                className="text-xs px-2 py-1 rounded hover:opacity-80"
                                style={{ background: 'var(--accentBg)', color: 'var(--btnText)' }}
                            >
                                Переглянути в документі
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="text-center text-sm" style={{ color: 'var(--muted)' }}>
            Нічого не знайдено
        </div>
    )
}

// Компонент для превью документа
function DocumentPreview({ codeName, html, loading, onClose, onDownload, onFullscreen, previewRef, isFullscreen }) {
    // Изолируем стили документа через iframe и задаем адаптивность
    const injectedStyles = `
        <style>
          html, body { margin: 0; padding: 0; }
          body, #article { max-width: 100% !important; }
          img, table, iframe { max-width: 100% !important; height: auto; }
          * { box-sizing: border-box; }
        </style>
        <base target="_blank" />
    `
    const srcDoc = `${injectedStyles}${html}`
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--accent)' }}>{codeName}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onDownload}
                        className="px-3 py-1 text-sm rounded hover:opacity-80"
                        style={{ background: 'var(--accentBg)', color: 'var(--btnText)' }}
                        title="Скачати документ"
                    >
                        Скачати
                    </button>
                    {!isFullscreen && (
                        <button
                            onClick={onFullscreen}
                            className="px-3 py-1 text-sm rounded hover:opacity-80"
                            style={{ background: 'var(--accentBg)', color: 'var(--btnText)' }}
                            title="Повноекранний режим"
                        >
                            Повний екран
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-sm rounded hover:opacity-80"
                        style={{ background: '#ef4444', color: 'white' }}
                        title={isFullscreen ? "Вихід з повноекранного режиму" : "Закрити превью"}
                    >
                        {isFullscreen ? "Вихід" : "✕"}
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden p-4">
                {loading ? (
                    <p className="text-center" style={{ color: 'var(--muted)' }}>Завантаження документа...</p>
                ) : (
                    <iframe ref={previewRef} title="document-preview" srcDoc={srcDoc} className="w-full h-full border-0" />
                )}
            </div>
        </div>
    )
}

// Компонент для таблицы кодексов
function CodesTable({ codes, onSelectCode }) {
    const codeEntries = Object.entries(codes)

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--accent)' }}>Офіційні документи ({codeEntries.length})</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Натисніть на документ для перегляду</p>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="w-full">
                    <thead className="sticky top-0" style={{ background: 'var(--surface-solid)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                                Назва документа
                            </th>
                            <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                                Дії
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {codeEntries.map(([name, meta]) => (
                            <tr
                                key={meta.id}
                                className="border-b hover:bg-gray-50 cursor-pointer"
                                style={{ borderColor: 'var(--border)' }}
                                onClick={() => onSelectCode(meta.id, name)}
                            >
                                <td className="p-4">
                                    <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{name}</div>
                                    {/* <div className="text-xs" style={{ color: 'var(--muted)' }}>ID: {meta.id}</div> */}
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onSelectCode(meta.id, name)
                                        }}
                                        className="text-xs px-2 py-1 rounded hover:opacity-80"
                                        style={{ background: 'var(--accentBg)', color: 'var(--btnText)' }}
                                    >
                                        Переглянути
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// Компонент для мобильной сетки кодексов
function MobileCodesGrid({ codes, onSelectCode, showTitle = true }) {
    const codeEntries = Object.entries(codes)

    return (
        <div className="space-y-4">
            {showTitle && (
                <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                        Офіційні документи ({codeEntries.length})
                    </h3>
                </div>
            )}
            {!showTitle && (
                <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                        Офіційні документи ({codeEntries.length})
                    </h3>
                </div>
            )}
            <div className="space-y-3">
                {codeEntries.map(([name, meta]) => (
                    <div
                        key={meta.id}
                        className="p-4 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)'
                        }}
                        onClick={() => onSelectCode(meta.id, name)}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <div className="text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>
                                    {name}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                                    ID: {meta.id}
                                </div>
                            </div>
                            <div className="ml-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onSelectCode(meta.id, name)
                                    }}
                                    className="text-xs px-3 py-1 rounded hover:opacity-80"
                                    style={{ background: 'var(--accentBg)', color: 'var(--btnText)' }}
                                >
                                    Переглянути
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}


