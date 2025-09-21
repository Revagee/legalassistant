import { useEffect, useMemo, useRef, useState } from 'react'
import { Eye, Download, Filter, X } from 'lucide-react'

function DocxPreview({ url }) {
    const containerRef = useRef(null)
    const viewportRef = useRef(null)
    const outerRef = useRef(null)

    useEffect(() => {
        let canceled = false

        const resizeToFit = () => {
            const viewportEl = viewportRef.current
            const contentEl = containerRef.current
            const outerEl = outerRef.current
            if (!viewportEl || !contentEl || !outerEl) return

            // Рассчитываем A4-вьюпорт, центрируем и ограничиваем внутри доступной области
            const a4Ratio = 1.41421356237 // высота / ширина
            const outerW = outerEl.clientWidth
            const outerH = outerEl.clientHeight

            // Сбрасываем масштаб перед измерением
            contentEl.style.transform = 'scale(1)'

            // Берем первую страницу как эталон
            const pageEl = Array.from(contentEl.children).find((el) => el.clientWidth && el.clientHeight) || contentEl.firstElementChild
            const pageW = (pageEl?.clientWidth || contentEl.clientWidth || 1)
            const _PAGE_H = (pageEl?.clientHeight || contentEl.clientHeight || 1) // keep to satisfy linter when needed

            // Ширина вьюпорта определяется как максимум, который поместится с учётом A4-отношения
            const maxViewportW = Math.min(outerW, outerH / a4Ratio)
            const viewportW = Math.floor(maxViewportW)
            const viewportH = Math.floor(viewportW * a4Ratio)
            viewportEl.style.width = `${viewportW}px`
            viewportEl.style.height = `${viewportH}px`

            // Масштаб по ширине: страница занимает 100% ширины A4-вьюпорта
            const scale = viewportW / pageW
            contentEl.style.transform = `scale(${scale})`
            contentEl.style.transformOrigin = 'top center'

            // Включаем постраничную прокрутку
            viewportEl.style.overflow = 'auto'
            viewportEl.style.scrollSnapType = 'y mandatory'
            Array.from(contentEl.children).forEach((el) => {
                el.style.scrollSnapAlign = 'start'
                el.style.marginLeft = 'auto'
                el.style.marginRight = 'auto'
            })

            // Подсчет количества страниц и высоты одной страницы
            const pages = Array.from(contentEl.children).filter((el) => el.clientHeight && el.clientWidth)
            const pagesCount = pages.length
            if (pagesCount > 0) {
                const totalHeight = pages.reduce((acc, el) => acc + el.clientHeight, 0)
                const pageHeightOriginal = totalHeight / pagesCount
                const pageHeightScaled = pageHeightOriginal * scale
                // Быстрый доступ при необходимости
                viewportEl.dataset.pagesCount = String(pagesCount)
                viewportEl.dataset.pageHeight = String(Math.round(pageHeightOriginal))
                viewportEl.dataset.pageHeightScaled = String(Math.round(pageHeightScaled))
                viewportEl.dataset.pagePercent = String(100 / pagesCount)
                // Для отладки/проверки
                // console.debug('DOCX preview pages:', { pagesCount, pageHeightOriginal, pageHeightScaled })
            }
        }

        async function render() {
            try {
                const res = await fetch(url)
                const buf = await res.arrayBuffer()
                const { renderAsync } = await import('docx-preview')
                if (!canceled && containerRef.current) {
                    containerRef.current.innerHTML = ''
                    await renderAsync(buf, containerRef.current, undefined, { inWrapper: true })
                    // Вертикальный стек страниц по центру
                    containerRef.current.style.display = 'flex'
                    containerRef.current.style.flexDirection = 'column'
                    containerRef.current.style.alignItems = 'center'
                    containerRef.current.style.rowGap = '12px'
                    requestAnimationFrame(resizeToFit)
                }
            } catch (e) {
                console.error('DOCX preview failed', e)
            }
        }
        render()

        const onResize = () => requestAnimationFrame(resizeToFit)
        window.addEventListener('resize', onResize)
        return () => { canceled = true; window.removeEventListener('resize', onResize) }
    }, [url])

    return (
        <div ref={outerRef} className="h-full w-full flex items-center justify-center overflow-hidden">
            {/* Вьюпорт с соотношением сторон A4 */}
            <div
                ref={viewportRef}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    overflow: 'auto'
                }}
            >
                <div ref={containerRef} className="px-3" />
            </div>
        </div>
    )
}

export default function Documents() {
    const [manifest, setManifest] = useState(null)
    const [query, setQuery] = useState('')
    const [extFilter, setExtFilter] = useState('') // '', 'docx', 'doc', 'rtf'
    const [selected, setSelected] = useState(null)
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [categoryFilter, setCategoryFilter] = useState([]) // array of category keys
    const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200))

    useEffect(() => {
        fetch('/files/manifest.json', { cache: 'no-store' })
            .then((r) => r.json())
            .then(setManifest)
            .catch((e) => console.error('Failed to load manifest', e))
    }, [])

    useEffect(() => {
        const onResize = () => setViewportWidth(window.innerWidth)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    // Блокируем скролл страницы при открытом попапе фильтров
    useEffect(() => {
        try {
            const body = document.body
            const prevOverflow = body.style.overflow
            const prevTouch = body.style.touchAction
            const prevOverscroll = body.style.overscrollBehavior
            if (filtersOpen) {
                body.style.overflow = 'hidden'
                body.style.touchAction = 'none'
                body.style.overscrollBehavior = 'contain'
            }
            return () => {
                body.style.overflow = prevOverflow
                body.style.touchAction = prevTouch
                body.style.overscrollBehavior = prevOverscroll
            }
        } catch {
            // noop
        }
    }, [filtersOpen])

    const flatFiles = useMemo(() => {
        if (!manifest) return []
        const categories = manifest.categories || []
        const list = []
        for (const cat of categories) {
            for (const f of (cat.files || [])) {
                list.push({ ...f, categoryKey: cat.key, categoryLabel: cat.label })
            }
        }
        return list
    }, [manifest])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return flatFiles.filter((f) => {
            if (extFilter && f.ext !== extFilter) return false
            if (Array.isArray(categoryFilter) && categoryFilter.length > 0 && !categoryFilter.includes(f.categoryKey)) return false
            if (!q) return true
            return (
                String(f.name || '').toLowerCase().includes(q) ||
                String(f.filename || '').toLowerCase().includes(q) ||
                String(f.categoryLabel || '').toLowerCase().includes(q)
            )
        })
    }, [flatFiles, query, extFilter, categoryFilter])

    const totalFiles = useMemo(() => {
        if (!manifest) return 0
        return (manifest.categories || []).reduce((acc, c) => acc + (c.files?.length || 0), 0)
    }, [manifest])

    const previewExternalUrl = useMemo(() => {
        if (!selected) return ''
        const abs = new URL(selected.path, window.location.origin).href
        if (selected.ext === 'doc') {
            return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(abs)}`
        }
        if (selected.ext === 'rtf') {
            return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(abs)}`
        }
        return ''
    }, [selected])

    const allCategories = useMemo(() => (manifest?.categories || []).map((c) => ({ key: c.key, label: c.label })), [manifest])

    const isDesktop = viewportWidth >= 1024
    const cardsColumns = (() => {
        if (viewportWidth >= 1024) return 3
        if (viewportWidth >= 640) return 2
        return 1
    })()

    return (
        <div className={`mx-auto max-w-7xl px-6 py-8`} style={{ overflow: filtersOpen ? 'hidden' : 'auto', height: filtersOpen ? '100vh' : 'auto' }}>
            {!selected && (
                <>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Документи</h1>
                    <p className="mt-2 text-sm" style={{ color: '#4B5563' }}>Швидкий перегляд і завантаження документів з каталогу файлів ({totalFiles}).</p>
                </>
            )}

            {!selected && (
                <div className="mt-4" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Пошук по назві або імені файлу…"
                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]"
                    />
                    <button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Filter size={16} /> Фільтри
                    </button>
                </div>
            )}

            {!manifest && (
                <div className="mt-6 text-sm" style={{ color: '#6b7280' }}>Завантаження…</div>
            )}

            {manifest && filtered.length === 0 && (
                <div className="mt-6 text-sm" style={{ color: '#6b7280' }}>Нічого не знайдено.</div>
            )}

            {/* Режим без предпросмотра: 3 колонки на всю ширину */}
            {!selected && (
                <div className="mt-6">
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cardsColumns}, minmax(0, 1fr))`, gap: 16 }}>
                        {filtered.map((f) => (
                            <div key={f.path} className="group rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setSelected(f)}>
                                <div className="flex items-start justify-between gap-3">
                                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-gray-600" title={f.categoryLabel}>{f.categoryLabel}</span>
                                    <div className="inline-flex items-center gap-1">
                                        <button type="button" aria-label="Переглянути" onClick={(e) => { e.stopPropagation(); setSelected(f) }} className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
                                            <Eye size={14} />
                                        </button>
                                        <a aria-label="Завантажити" href={f.path} download onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-[var(--accent)] text-white hover:opacity-90">
                                            <Download size={14} />
                                        </a>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm font-medium text-gray-900 break-words">{f.name}</div>
                                <div className="mt-1 text-xs text-gray-500 break-all">{f.filename} · {f.ext.toUpperCase()} · {(f.size / 1024).toFixed(1)} KB</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Режим с предпросмотром: правая колонка (66%) со sticky preview и левая (34%) со списком */}
            {selected && (
                <div
                    className="mt-6"
                    style={{
                        display: isDesktop ? 'grid' : 'flex',
                        gridTemplateColumns: isDesktop ? '1fr 2fr' : undefined,
                        flexDirection: isDesktop ? undefined : 'column',
                        gap: 24,
                        alignItems: 'flex-start',
                        justifyContent: 'center'
                    }}
                >
                    {/* Левая колонка 33% */}
                    <div style={{ order: isDesktop ? 1 : 2, height: isDesktop ? 'calc(100vh - 120px)' : undefined, display: 'flex', flexDirection: 'column', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
                        {/* Заголовок и описание перенесены сюда в режиме превью */}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Документи</h1>
                            <p className="mt-2 text-sm" style={{ color: '#4B5563' }}>Швидкий перегляд і завантаження документів з каталогу файлів ({totalFiles}).</p>
                        </div>
                        {/* Поисковик и кнопка фильтров */}
                        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Пошук по назві або імені файлу…"
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]"
                                />
                                <button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    <Filter size={16} /> Фільтри
                                </button>
                            </div>
                        </div>
                        {/* Листинг файлов занимает оставшуюся высоту на десктопе, на мобилке — обычный поток */}
                        <div className="mt-3 rounded-xl border border-gray-200 bg-white" style={{ flex: isDesktop ? 1 : undefined, minHeight: isDesktop ? 0 : undefined }}>
                            <div className={isDesktop ? 'h-full overflow-auto p-3' : 'p-3'}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {filtered.map((f) => (
                                        <button key={f.path} type="button" onClick={() => setSelected(f)} className="text-left rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-gray-600" title={f.categoryLabel}>{f.categoryLabel}</span>
                                                <span className="text-[11px] text-gray-500">{f.ext.toUpperCase()}</span>
                                            </div>
                                            <div className="mt-1 text-sm font-medium text-gray-900 break-words">{f.name}</div>
                                            <div className="mt-0.5 text-xs text-gray-500 break-all">{f.filename}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Правая колонка 66% с превью */}
                    <aside style={{ order: isDesktop ? 2 : 1, width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
                        <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-4" style={{ height: isDesktop ? 'calc(100vh - 120px)' : undefined }}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 break-words">{selected.name}</div>
                                    <div className="text-xs text-gray-500 break-all">{selected.filename}</div>
                                </div>
                                <div className="shrink-0 inline-flex items-center gap-2">
                                    <button type="button" onClick={() => { window.open(selected.path, 'thiswindow') }} className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"><Download size={14} /></button>
                                    <button type="button" onClick={() => setSelected(null)} className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"><X size={14} /></button>
                                </div>
                            </div>
                            <div className="mt-3 rounded-md border border-gray-100 overflow-hidden" style={{ height: isDesktop ? 'calc(100% - 48px)' : '60vh', width: '100%', maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
                                {selected.ext === 'docx' ? (
                                    <DocxPreview url={selected.path} />
                                ) : previewExternalUrl ? (
                                    <iframe title="preview" src={previewExternalUrl} className="w-full h-full" />
                                ) : (
                                    <div className="p-4 text-xs" style={{ color: '#6b7280' }}>Попередній перегляд недоступний для цього формату. Скористайтеся кнопкою «Завантажити».</div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {/* Модальное окно фильтров */}
            {filtersOpen && (
                <div className="fixed inset-0 z-50">
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} onClick={() => setFiltersOpen(false)} />
                    <div className="rounded-xl border border-gray-200 bg-[var(--surface-solid)] p-5 shadow-lg" style={{ position: 'absolute', left: 0, right: 0, top: 56, margin: '0 auto', width: '90%', maxWidth: 640 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 className="text-base font-semibold text-gray-900">Фільтри</h3>
                            <button type="button" onClick={() => setFiltersOpen(false)} className="text-sm text-gray-600 hover:text-gray-800"><X size={14} /></button>
                        </div>
                        <div style={{ marginTop: 16, display: 'grid', rowGap: 20 }}>
                            <div>
                                <div className="text-sm font-medium text-gray-900">Категорії</div>
                                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {allCategories.map((c) => {
                                        const active = categoryFilter.includes(c.key)
                                        return (
                                            <button key={c.key} type="button" onClick={() => setCategoryFilter((prev) => active ? prev.filter((k) => k !== c.key) : [...prev, c.key])} className={`inline-flex items-center rounded-full px-3 py-1 text-xs border ${active ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                                                {c.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">Формат</div>
                                <div className="text-sm" style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {['', 'docx', 'doc', 'rtf'].map((ext) => (
                                        <label key={ext || 'any'} className="inline-flex items-center gap-1 text-gray-700">
                                            <input type="radio" name="extFilter" value={ext} checked={extFilter === ext} onChange={(e) => setExtFilter(e.target.value)} />
                                            {ext ? ext.toUpperCase() : 'Будь-який'}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <button type="button" onClick={() => { setCategoryFilter([]); setExtFilter('') }} className="text-sm text-gray-600 hover:text-gray-800">Очистити</button>
                                <button type="button" onClick={() => setFiltersOpen(false)} className="inline-flex items-center rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">Готово</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


