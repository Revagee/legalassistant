import { X, FileText, Calendar, Hash, Eye, MessageSquare, Copy } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const DocumentSidebar = ({ isOpen, document, onClose, isDesktop = false, onQuote }) => {
    const [contextMenuOpen, setContextMenuOpen] = useState(false)
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
    const [selectedText, setSelectedText] = useState('')
    const contentRef = useRef(null)
    const selectionRangeRef = useRef(null)
    const isPointerDownRef = useRef(false)
    const menuOpenTimeoutRef = useRef(null)

    const handleContextMenu = (e) => {
        e.preventDefault()
        const selection = window.getSelection()
        const selectedText = selection.toString().trim()

        if (selectedText && onQuote) {
            setSelectedText(selectedText)
            try { selectionRangeRef.current = selection.rangeCount ? selection.getRangeAt(0).cloneRange() : null } catch { selectionRangeRef.current = null }

            // Определяем позицию меню с учетом границ окна
            const menuWidth = 160
            const menuHeight = 80
            let x = e.clientX
            let y = e.clientY

            // Корректируем позицию если меню выходит за границы
            if (x + menuWidth > window.innerWidth) {
                x = window.innerWidth - menuWidth - 10
            }
            if (y + menuHeight > window.innerHeight) {
                y = e.clientY - menuHeight - 10
            }

            setContextMenuPosition({ x, y })
            setContextMenuOpen(true)
        }
    }

    const closeContextMenu = () => {
        setContextMenuOpen(false)
        setSelectedText('')
    }

    // const handleCopySelected = () => { /* removed */ }

    const handleQuoteSelected = () => {
        if (selectedText && onQuote && document?.id) {
            onQuote(selectedText, document.id)
            closeContextMenu()
        }
    }

    // Показ контекстного меню при выделении с задержкой и проверкой ЛКМ (desktop/mobile)
    useEffect(() => {
        function isInsideContent(node) {
            const container = contentRef.current
            if (!container || !node) return false
            let n = node.nodeType === 3 ? node.parentNode : node
            while (n) {
                if (n === container) return true
                n = n.parentNode
            }
            return false
        }

        function scheduleOpenMenu() {
            try { if (menuOpenTimeoutRef.current) clearTimeout(menuOpenTimeoutRef.current) } catch { /* ignore */ }
            menuOpenTimeoutRef.current = setTimeout(() => {
                openMenuForSelection()
            }, 150)
        }

        function openMenuForSelection() {
            if (isPointerDownRef.current) return
            if (contextMenuOpen) return
            const sel = window.getSelection()
            if (!sel) return
            const text = String(sel.toString() || '').trim()
            if (!text) return
            const anchorOk = isInsideContent(sel.anchorNode)
            const focusOk = isInsideContent(sel.focusNode)
            if (!anchorOk && !focusOk) return
            if (!onQuote) return
            try { selectionRangeRef.current = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null } catch { selectionRangeRef.current = null }
            const range = selectionRangeRef.current
            let x = 0, y = 0
            if (range && typeof range.getBoundingClientRect === 'function') {
                const rect = range.getBoundingClientRect()
                const menuWidth = 160
                const menuHeight = 80
                x = Math.min(Math.max(rect.left + rect.width / 2 - menuWidth / 2, 10), window.innerWidth - menuWidth - 10)
                y = rect.top - menuHeight - 8
                if (y < 10) y = rect.bottom + 8
            } else {
                x = 16; y = 16
            }
            setSelectedText(text)
            setContextMenuPosition({ x, y })
            setContextMenuOpen(true)
        }

        function onSelectionChange() {
            const sel = window.getSelection()
            const hasText = !!(sel && String(sel.toString() || '').trim())
            if (isPointerDownRef.current) return
            if (!hasText) {
                if (contextMenuOpen) setContextMenuOpen(false)
                return
            }
            scheduleOpenMenu()
        }

        function onMouseDown(e) { if (e && e.button !== 0) return; isPointerDownRef.current = true; const t = e && e.target; if (t && t.closest && t.closest('.context-menu')) return; if (contextMenuOpen) setContextMenuOpen(false) }
        function onMouseUp(e) { if (e && e.button !== 0) return; isPointerDownRef.current = false; const t = e && e.target; if (t && t.closest && t.closest('.context-menu')) return; scheduleOpenMenu() }
        function onTouchStart(e) { isPointerDownRef.current = true; const t = e && e.target; if (t && t.closest && t.closest('.context-menu')) return; if (contextMenuOpen) setContextMenuOpen(false) }
        function onTouchEnd(e) { isPointerDownRef.current = false; const t = e && e.target; if (t && t.closest && t.closest('.context-menu')) return; scheduleOpenMenu() }

        window.document.addEventListener('selectionchange', onSelectionChange)
        window.document.addEventListener('mousedown', onMouseDown, true)
        window.document.addEventListener('mouseup', onMouseUp, true)
        window.document.addEventListener('touchstart', onTouchStart, true)
        window.document.addEventListener('touchend', onTouchEnd, true)
        return () => {
            window.document.removeEventListener('selectionchange', onSelectionChange)
            window.document.removeEventListener('mousedown', onMouseDown, true)
            window.document.removeEventListener('mouseup', onMouseUp, true)
            window.document.removeEventListener('touchstart', onTouchStart, true)
            window.document.removeEventListener('touchend', onTouchEnd, true)
            try { if (menuOpenTimeoutRef.current) clearTimeout(menuOpenTimeoutRef.current) } catch { /* ignore */ }
        }
    }, [contextMenuOpen, onQuote])

    // Обработчик кликов вне контекстного меню
    useEffect(() => {
        function handleClickOutside() {
            if (contextMenuOpen) {
                closeContextMenu()
            }
        }

        if (contextMenuOpen) {
            window.document.addEventListener('click', handleClickOutside)
            window.document.addEventListener('contextmenu', handleClickOutside)
        }

        return () => {
            window.document.removeEventListener('click', handleClickOutside)
            window.document.removeEventListener('contextmenu', handleClickOutside)
        }
    }, [contextMenuOpen])
    // For desktop mode, always render but with different styling
    // For mobile mode, don't render if not open
    if (!isDesktop && !isOpen) return null

    const renderLawPreview = (law) => {
        return (
            <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                        {law.title}
                    </h2>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Hash size={16} />
                            <span>Код: {law.code}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={16} />
                            <span>Дата: {law.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Eye size={16} />
                            <span>Редакція: {law.edition}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${law.in_force
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {law.in_force ? 'Діє' : 'Не діє'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Зміст закону</h3>
                    <div
                        className="document-content prose prose-sm max-w-none p-4 rounded-lg border border-gray-200
                                   prose-p:text-sm prose-p:leading-relaxed 
                                   prose-headings:font-medium
                                   prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                                   prose-table:text-xs prose-td:p-2 prose-th:p-2"
                        dangerouslySetInnerHTML={{ __html: law.text_html }}
                        onContextMenu={handleContextMenu}
                        ref={contentRef}
                        onClick={(e) => {
                            if (e.detail === 2 || e.detail === 3) { // двойной или тройной клик
                                const selection = window.getSelection()
                                const selectedText = selection.toString().trim()
                                if (selectedText && onQuote) {
                                    setSelectedText(selectedText)

                                    // Определяем позицию меню с учетом границ окна
                                    const menuWidth = 160
                                    const menuHeight = 80
                                    let x = e.clientX
                                    let y = e.clientY

                                    // Корректируем позицию если меню выходит за границы
                                    if (x + menuWidth > window.innerWidth) {
                                        x = window.innerWidth - menuWidth - 10
                                    }
                                    if (y + menuHeight > window.innerHeight) {
                                        y = e.clientY - menuHeight - 10
                                    }

                                    setContextMenuPosition({ x, y })
                                    setContextMenuOpen(true)
                                }
                            }
                        }}
                        style={{ userSelect: 'text' }}
                    />
                </div>
            </div>
        )
    }

    const renderGenericDocument = (doc) => {
        return (
            <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                        {doc.title || doc.name || 'Документ'}
                    </h2>
                    {doc.description && (
                        <p className="text-sm text-gray-600">{doc.description}</p>
                    )}
                </div>

                <div className="flex-1">
                    {doc.content ? (
                        <div ref={contentRef} className="document-content prose prose-sm max-w-none p-4 rounded-lg border border-gray-200">
                            {typeof doc.content === 'string' ? (
                                <div dangerouslySetInnerHTML={{ __html: doc.content }} />
                            ) : (
                                <pre className="whitespace-pre-wrap text-sm">
                                    {JSON.stringify(doc.content, null, 2)}
                                </pre>
                            )}
                        </div>
                    ) : (
                        <div className="document-content text-center py-8 text-gray-500 rounded-lg border border-gray-200">
                            <FileText size={48} className="mx-auto mb-4 opacity-30" />
                            <p>Завантаження документа...</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (isDesktop) {
        // Desktop mode - embedded in layout, no overlay
        return (
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>
                        Перегляд документа
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-surface transition-colors"
                        aria-label="Закрити"
                    >
                        <X size={20} style={{ color: 'var(--ink)' }} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {document ? (
                        // Если у документа есть text_html - это закон
                        document.text_html ?
                            renderLawPreview(document) :
                            renderGenericDocument(document)
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <FileText size={48} className="mx-auto mb-4 opacity-30" />
                                <p>Оберіть документ для перегляду</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Mobile mode - overlay
    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside
                className={`fixed top-0 right-0 h-full w-full z-50 transform transition-transform duration-200 md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    } flex flex-col shadow-2xl border-l border-gray-200`}
                style={{ background: 'var(--surface-solid)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>
                        Перегляд документа
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-surface transition-colors"
                        aria-label="Закрити"
                    >
                        <X size={20} style={{ color: 'var(--ink)' }} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {document ? (
                        // Если у документа есть text_html - это закон
                        document.text_html ?
                            renderLawPreview(document) :
                            renderGenericDocument(document)
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <FileText size={48} className="mx-auto mb-4 opacity-30" />
                                <p>Оберіть документ для перегляду</p>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Context Menu for Document Text */}
            {contextMenuOpen && createPortal(
                <div
                    className="context-menu fixed z-50 rounded-lg shadow-lg border py-1 min-w-[160px] transition-all duration-200 ease-in-out"
                    style={{
                        left: contextMenuPosition.x,
                        top: contextMenuPosition.y,
                        background: 'var(--surface-solid)',
                        borderColor: 'var(--border)',
                        color: 'var(--ink)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Убираем копирование — оставляем только цитирование */}
                    <button
                        type="button"
                        className="w-full px-4 py-2 text-left text-sm hover:bg-surface transition-colors flex items-center gap-2"
                        onClick={handleQuoteSelected}
                        style={{ color: 'var(--ink)' }}
                    >
                        <MessageSquare size={14} />
                        Цитувати
                    </button>
                </div>,
                window.document.body
            )}
        </>
    )
}

export default DocumentSidebar
