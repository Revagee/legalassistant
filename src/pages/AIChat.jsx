import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import MarkdownRenderer from '../components/MarkdownRenderer.jsx'
import DocumentSidebar from '../components/DocumentSidebar.jsx'
import { useAuth } from '../lib/authContext.jsx'
import { ChatAPI, getStreamBaseUrl } from '../lib/api.js'
import { Trash2, Pencil, Send, ThumbsUp, ThumbsDown, Copy, Check, Share2, FileText, Mail, MessageCircle, MessageSquare, Square, PanelLeftClose, PanelLeft, Plus, ArrowUp, CornerDownRight, CornerDownLeft, CheckCircle2, X } from 'lucide-react'

// Компонент для отображения текста с подсвеченными цитатами
function HighlightedText({ content, highlights, messageId }) {
    if (!highlights || !highlights.length) {
        return <MarkdownRenderer>{content}</MarkdownRenderer>
    }

    // Фильтруем выделения для текущего сообщения
    const messageHighlights = highlights.filter(h => h.messageId === messageId)

    if (!messageHighlights.length) {
        return <MarkdownRenderer>{content}</MarkdownRenderer>
    }

    // Для простоты пока рендерим обычный Markdown, но добавляем к нему визуальные индикаторы
    // В будущем можно реализовать более сложную логику для точного позиционирования выделений
    return (
        <div className="relative">
            <MarkdownRenderer>{content}</MarkdownRenderer>
            {messageHighlights.length > 0 && (
                <div className="citation-indicators">
                    {messageHighlights.map(highlight => (
                        <span
                            key={highlight.id}
                            className="citation-marker"
                            title={`Цитата: "${highlight.text}"`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}


export default function AIChat() {
    const bodyRef = useRef(null)
    const inputRef = useRef(null)
    const formRef = useRef(null)
    const esRef = useRef(null)
    const copyToastTimerRef = useRef(null)
    const hasProcessedQueryRef = useRef(false)
    const initialHasQRef = useRef(!!(new URLSearchParams(window.location.search || '').get('q')))
    const [drawerOpen, setDrawerOpen] = useState(false)
    const { isAuthenticated, loading } = useAuth()

    const [threads, setThreads] = useState([])
    const [activeId, setActiveId] = useState(null)
    const [messages, setMessages] = useState([])
    const [isStreaming, setIsStreaming] = useState(false)
    const [activeTools, setActiveTools] = useState([])
    const [currentSources, setCurrentSources] = useState([])
    const [copiedIdx, setCopiedIdx] = useState(null)
    const [shareOpen, setShareOpen] = useState(false)
    const [shareContent, setShareContent] = useState('')
    const [threadReaction, setThreadReaction] = useState(null) // 1 like, 0 dislike, null none
    const [copyToastVisible, setCopyToastVisible] = useState(false)
    const [copyToastProgress, setCopyToastProgress] = useState(0)

    // Document sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [currentDocument, setCurrentDocument] = useState(null)

    // Chat sidebar state
    const [chatSidebarOpen, setChatSidebarOpen] = useState(true)

    // Rename modal state
    const [renameOpen, setRenameOpen] = useState(false)
    const [renameBusy, setRenameBusy] = useState(false)
    const [renameTarget, setRenameTarget] = useState({ id: null, name: '' })
    const [renameName, setRenameName] = useState('')
    const [currentStatus, setCurrentStatus] = useState('not working')

    // Context menu state
    const [contextMenuOpen, setContextMenuOpen] = useState(false)
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
    const [selectedText, setSelectedText] = useState('')
    const [_sourceMessageId, setSourceMessageId] = useState(null)
    const [sourceDocument, setSourceDocument] = useState(null)

    // Quote state
    const [quoteText, setQuoteText] = useState('')
    const [quoteFromDocument, setQuoteFromDocument] = useState(null)
    const [persistentHighlights, setPersistentHighlights] = useState([])
    const [quoteSourceMessageId, setQuoteSourceMessageId] = useState(null)

    function normalizeMarkdownText(input) {
        const text = String(input ?? '')
        return text
            .replace(/\r\n/g, '\n')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
    }

    function getToolLabel(name) {
        const n = String(name || '').trim()
        if (!n) return ''
        if (n === 'LegalCorpusSearch') return 'Шукаю у законодавчій базі'
        if (n === 'SearchInCodes') return 'Шукаю інформацію у кодексах'
        if (n === 'SearchInConstitution') return 'Шукаю інформацію у конституції'
        return 'Шукаю в Інтернеті'
    }


    function SelectionAskPopup({ containerRef }) {
        const [open, setOpen] = useState(false)
        const [pos, setPos] = useState({ x: 0, y: 0 })
        const [selText, setSelText] = useState('')
        const savedRangeRef = useRef(null)
        const pointerDownRef = useRef(false)

        const positionFromRange = (range) => {
            if (!range || typeof range.getBoundingClientRect !== 'function') return
            const rect = range.getBoundingClientRect()
            const menuW = 180
            const menuH = 40
            let x = rect.left + rect.width / 2 - menuW / 2
            let y = rect.top - menuH - 8
            if (y < 8) y = rect.bottom + 8
            const minX = 8
            const maxX = window.innerWidth - menuW - 8
            x = Math.min(Math.max(x, minX), maxX)
            setPos({ x, y })
        }

        useEffect(() => {
            const isInsideAiBubble = (node) => {
                const container = containerRef?.current
                if (!container || !node) return false
                let el = node.nodeType === 3 ? node.parentNode : node
                while (el) {
                    if (el.classList && el.classList.contains('chat-bubble--ai')) return true
                    if (el === container) break
                    el = el.parentNode
                }
                return false
            }

            const onPointerDown = () => { pointerDownRef.current = true }
            const onPointerUp = () => {
                pointerDownRef.current = false
                const sel = window.getSelection()
                const text = String(sel?.toString() || '').trim()
                if (!text) { setOpen(false); return }
                if (!isInsideAiBubble(sel.anchorNode) && !isInsideAiBubble(sel.focusNode)) { setOpen(false); return }
                try { savedRangeRef.current = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null } catch { savedRangeRef.current = null }
                setSelText(text)
                if (savedRangeRef.current) {
                    positionFromRange(savedRangeRef.current)
                    setOpen(true)
                }
            }

            document.addEventListener('pointerdown', onPointerDown, true)
            document.addEventListener('pointerup', onPointerUp, true)
            return () => {
                document.removeEventListener('pointerdown', onPointerDown, true)
                document.removeEventListener('pointerup', onPointerUp, true)
            }
        }, [containerRef])

        useLayoutEffect(() => {
            if (!open) return
            const onScrollOrResize = () => {
                if (!savedRangeRef.current) return
                positionFromRange(savedRangeRef.current)
            }
            window.addEventListener('scroll', onScrollOrResize, true)
            window.addEventListener('resize', onScrollOrResize, true)
            return () => {
                window.removeEventListener('scroll', onScrollOrResize, true)
                window.removeEventListener('resize', onScrollOrResize, true)
            }
        }, [open])

        useEffect(() => {
            if (!open) return
            const onDocClick = (e) => {
                const target = e.target
                if (target.closest && target.closest('.ask-popup')) return
                setOpen(false)
            }
            setTimeout(() => {
                document.addEventListener('click', onDocClick, true)
                document.addEventListener('contextmenu', onDocClick, true)
            }, 0)
            return () => {
                document.removeEventListener('click', onDocClick, true)
                document.removeEventListener('contextmenu', onDocClick, true)
            }
        }, [open])

        if (!open) return null

        return createPortal(
            <div
                className="ask-popup fixed z-[9999] rounded-full border px-3 py-2 text-xs shadow-lg flex items-center gap-2 hover:bg-surface hover:border-accent hover:cursor-pointer"
                style={{
                    left: pos.x,
                    top: pos.y,
                    background: 'var(--surface-solid)',
                    borderColor: 'var(--border)',
                    color: 'var(--ink)'
                }}
                onClick={() => {
                    setQuoteText(selText)
                    setQuoteFromDocument(null)
                    setOpen(false)
                }}
                onMouseDown={(e) => e.preventDefault()}
            >
                <Send size={14} />
                <span>Спитати у ШІ</span>
            </div>,
            document.body
        )
    }

    function threadTimestamp(thread) {
        return thread?.last_activity_time || new Date().toISOString()
    }

    function groupThreadsByDate(threads) {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const groups = {
            today: { label: 'Сьогодні', threads: [] },
            yesterday: { label: 'Вчора', threads: [] },
            thisMonth: { label: 'Цього місяця', threads: [] },
            earlier: { label: 'Раніше', threads: [] }
        }

        threads.forEach(thread => {
            const threadDate = new Date(threadTimestamp(thread))
            const threadDay = new Date(threadDate.getFullYear(), threadDate.getMonth(), threadDate.getDate())

            if (threadDay.getTime() === today.getTime()) {
                groups.today.threads.push(thread)
            } else if (threadDay.getTime() === yesterday.getTime()) {
                groups.yesterday.threads.push(thread)
            } else if (threadDate >= thisMonthStart) {
                groups.thisMonth.threads.push(thread)
            } else {
                groups.earlier.threads.push(thread)
            }
        })

        // Return only groups that have threads
        return Object.values(groups).filter(group => group.threads.length > 0)
    }

    async function fetchThreads() {
        if (!isAuthenticated) {
            setThreads([])
            return []
        }
        const list = await ChatAPI.getThreads()
        const sorted = Array.isArray(list) ? [...list].sort((a, b) => {
            const ta = Date.parse(threadTimestamp(a)) || 0
            const tb = Date.parse(threadTimestamp(b)) || 0
            return tb - ta
        }) : []
        setThreads(sorted)
        return sorted
    }

    async function fetchThreadMessages(threadId) {
        if (!isAuthenticated || !threadId) {
            setMessages([])
            return []
        }
        const data = await ChatAPI.getThreadMessages(threadId)
        // Expecting array of { type: 'human'|'ai', content: string, sources?: string[] }
        setThreadReaction(data.reaction)
        const normalized = Array.isArray(data.messages)
            ? data.messages.map((m) => (m && m.type === 'ai' ? { ...m, finished: true } : m))
            : []
        setMessages(normalized)
        return normalized
    }

    function closeStream() {
        try { if (esRef.current) esRef.current.close() } catch { /* ignore */ }
        esRef.current = null
        setIsStreaming(false)
        setActiveTools([])
        setCurrentSources([])
    }

    async function abortStream() {
        // Явно останавливаем текущий SSE
        try {
            if (isAuthenticated && activeId) {
                try { await ChatAPI.abort(activeId) } catch { /* ignore */ }
            }
        } catch { /* ignore */ }
    }

    function openStream(threadId, options = {}) {
        console.log('[AIChat][openStream]', threadId, options)
        const { showLoadingPlaceholder = false } = options
        if (!threadId || !isAuthenticated) return
        // Для стрима используем отдельный base URL, чтобы обойти CDN/буферизацию
        const base = getStreamBaseUrl()
        const originBase = base.startsWith('http') ? base : window.location.origin + base
        const url = new URL(originBase + '/chat/stream')
        url.searchParams.set('thread_id', threadId)
        // предотвращаем кеш и даём подсказку прокси не буферизовать
        url.searchParams.set('_', Date.now().toString())
        // EventSource не позволяет явно задать заголовки, но query + серверные заголовки помогут
        const es = new EventSource(url.toString())
        esRef.current = es;
        setIsStreaming(true)
        let started = false
        let activeEventType = null // 'message' | 'chunk'
        let sourcesBuffer = []

        // Показываем «три точки» до появления первого чанка, только при отправке нового сообщения
        if (showLoadingPlaceholder) {
            setMessages((prev) => {
                const next = [...prev]
                // избегаем дублей если вдруг уже есть такой плейсхолдер
                if (!next.length || next[next.length - 1].type !== 'ai_loading') {
                    next.push({ type: 'ai_loading' })
                }
                return next
            })
        }

        const appendAiChunk = (chunk) => {
            setMessages((prev) => {
                const next = [...prev]
                const contentStr = String(chunk || '')
                console.log('[AIChat][SSE chunk]', contentStr)
                // если последний элемент — плейсхолдер, заменяем его первым чанкoм
                if (next.length && next[next.length - 1].type === 'ai_loading') {
                    next[next.length - 1] = { type: 'ai', content: contentStr, finished: false }
                } else if (!started || next.length === 0 || next[next.length - 1].type !== 'ai') {
                    next.push({ type: 'ai', content: contentStr, finished: false })
                } else {
                    next[next.length - 1] = { ...next[next.length - 1], content: next[next.length - 1].content + contentStr }
                }
                return next
            })
            started = true
            // keep activeTools shown even when chunks start coming
            if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
        }
        const onChunk = (ev) => {
            if (activeEventType && activeEventType !== 'chunk') return
            if (!activeEventType) {
                activeEventType = 'chunk'
                es.onmessage = null
            }
            if (typeof ev.data === 'string' && ev.data.length) {
                console.log('[AIChat][Chunk message]', ev.data)
                appendAiChunk(ev.data)
                // Как только пришёл контент — убираем плашку инструмента и прикрепим источники
                // keep activeTools until system:end or error
                // Прикрепим уже накопленные источники к текущему сообщению
                if (sourcesBuffer.length) {
                    setMessages((prev) => {
                        const next = [...prev]
                        if (next.length && next[next.length - 1].type === 'ai') {
                            const uniq = Array.from(new Set(sourcesBuffer))
                            next[next.length - 1] = { ...next[next.length - 1], sources: uniq }
                        }
                        return next
                    })
                }
            }
        }

        es.addEventListener('chunk', onChunk);
        setCurrentStatus('writing')
        console.log('[AIChat][Status]', currentStatus)
        const persistSourcesToLastMessage = () => {
            if (!sourcesBuffer || sourcesBuffer.length === 0) return
            setMessages((prev) => {
                const next = [...prev]
                if (next.length && next[next.length - 1].type === 'ai') {
                    const uniq = Array.from(new Set(sourcesBuffer))
                    next[next.length - 1] = { ...next[next.length - 1], sources: uniq }
                }
                return next
            })
        }

        es.addEventListener('system', (ev) => {
            const raw = (ev.data || '').trim()
            const parseErrorMessage = (payload) => {
                if (!payload) return ''
                // Try JSON first
                try {
                    const obj = JSON.parse(payload)
                    return String(obj.message || obj.error || obj.detail || '')
                } catch { /* not json */ }
                // Support "error: message" or "tool_error: message"
                const m = payload.match(/^\s*(?:error|tool_error|exception)\s*:\s*(.+)$/i)
                if (m && m[1]) return m[1].trim()
                return ''
            }

            if (raw === 'end') {
                // Сохраняем источники в последнее AI-сообщение
                setCurrentStatus('not working')
                setActiveTools([])
                console.log('[AIChat][Status]', currentStatus)
                persistSourcesToLastMessage()
                // Помечаем последнее AI-сообщение как завершённое
                setMessages((prev) => {
                    const next = [...prev]
                    if (next.length && next[next.length - 1].type === 'ai') {
                        next[next.length - 1] = { ...next[next.length - 1], finished: true }
                    }
                    return next
                })
                closeStream()
                // Если генерация так и не началась — удаляем плейсхолдер
                if (!started) {
                    setMessages((prev) => {
                        if (prev.length && prev[prev.length - 1].type === 'ai_loading') {
                            const copy = prev.slice(0, -1)
                            return copy
                        }
                        return prev
                    })
                }
                fetchThreads().catch(() => { })
                return
            }

            if (raw === 'error' || /^\s*(?:error|tool_error|exception)\s*[:{]/i.test(raw)) {
                console.log('[AIChat][SSE error]', raw)
                const details = parseErrorMessage(raw)
                const messageText = details
                    ? `Помилка інструмента: ${details}`
                    : 'Помилка генерації відповіді'
                // Если был плейсхолдер и не началось — заменим его на ошибку
                setMessages((prev) => {
                    const next = [...prev]
                    if (next.length && next[next.length - 1].type === 'ai_loading') {
                        next[next.length - 1] = { type: 'ai_error', content: messageText }
                        return next
                    }
                    if (started) return [...prev, { type: 'ai_error', content: messageText }]
                    return prev
                })
                if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
                closeStream()
            }

            if (raw === 'message_ended') {
                setCurrentStatus('message_ended')
                console.log('[AIChat][Status]', currentStatus)
                setMessages((prev) => {
                    const next = [...prev]
                    if (next.length && next[next.length - 1].type === 'ai') {
                        next[next.length - 1] = { ...next[next.length - 1], finished: true, content: next[next.length - 1].content + '\n\n' }
                    }
                    return next
                })
            }
        })
        es.addEventListener('tool_call', (ev) => {
            setCurrentStatus('using tool')
            console.log('[AIChat][Status]', currentStatus)
            console.log('[AIChat][SSE tool_call]', ev.data)
            const text = String(ev.data || '').trim()
            if (!text) return
            setActiveTools((prev) => (prev.includes(text) ? prev : [...prev, text]))
        })
        es.addEventListener('source', (ev) => {
            console.log('[AIChat][Source incoming]', ev.data)
            const name = String(ev.data || '').trim()
            if (!name) return
            // копим во временный буфер и отображаем онлайн
            if (!sourcesBuffer.includes(name)) sourcesBuffer.push(name)
            setCurrentSources((prev) => (prev.includes(name) ? prev : [...prev, name]))
        })

        es.onerror = () => {
            // Показываем ошибку только если поток реально начался.
            // При первичном подключении SSE часто эмитит onerror (reconnect),
            // что не является ошибкой генерации и не должно пугать пользователя.
            console.log('[AIChat][SSE error]')
            if (started) {
                setMessages((prev) => {
                    if (prev.length && prev[prev.length - 1].type === 'ai_error') return prev
                    return [...prev, { type: 'ai_error', content: 'Помилка генерації відповіді' }]
                })
                if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
            }
            closeStream()
        }
    }

    async function selectThread(threadId) {
        if (!threadId || !isAuthenticated) return
        setActiveId(threadId)
        setMessages([])
        closeStream()
        await fetchThreadMessages(threadId)
        openStream(threadId)
    }

    async function handleDeleteThread(threadId) {
        if (!isAuthenticated) return
        try { await ChatAPI.deleteThread(threadId) } catch { /* ignore */ }
        setThreads((prev) => prev.filter((t) => t.id !== threadId))
        if (activeId === threadId) {
            setActiveId(null)
            setMessages([])
            const list = await fetchThreads().catch(() => [])
            if (list && list.length) {
                selectThread(list[0].id).catch(() => { })
            }
        } else {
            fetchThreads().catch(() => { })
        }
    }

    async function handleThreadReaction(reactionType) {
        if (!isAuthenticated || !activeId) return
        try {
            await ChatAPI.reactThread(activeId, reactionType)
            // null - нет реакции
            // 0 - диз
            // 1 - лайк
            if (reactionType !== threadReaction) {
                setThreadReaction(reactionType) // Устанавливаем новую реакцию
            }
            else {
                setThreadReaction(null) // Убираем реакцию при повторном клике
            }
        } catch { /* ignore */ }
    }

    async function copyMessage(text, index) {
        try {
            await navigator.clipboard.writeText(String(text || ''))
            setCopiedIdx(index)
            setTimeout(() => setCopiedIdx(null), 2000)
            showCopyToast()
        } catch { /* ignore */ }
    }

    function openShare(text) {
        setShareContent(String(text || ''))
        setShareOpen(true)
    }

    function openDocumentInSidebar(document) {
        setCurrentDocument(document)
        setSidebarOpen(true)
    }

    function closeSidebar() {
        setSidebarOpen(false)
        setCurrentDocument(null)
    }

    function toggleChatSidebar() {
        setChatSidebarOpen(!chatSidebarOpen)
    }

    function clearQuote() {
        setQuoteText('')
        setQuoteFromDocument(null)
        setQuoteSourceMessageId(null)
        try { console.log('[Quote][clear]') } catch { /* ignore */ }
    }

    function handleContextMenu(e, messageIndex, documentId) {
        try { e.preventDefault() } catch { /* ignore */ }
        const sel = window.getSelection && window.getSelection()
        const text = String(sel && sel.toString ? sel.toString() : '').trim()
        if (!text) return
        setSelectedText(text)
        setSourceDocument(documentId || null)
        setSourceMessageId(messageIndex != null ? messageIndex : null)
        setContextMenuPosition({ x: e.clientX || 0, y: e.clientY || 0 })
        setContextMenuOpen(true)
    }

    function handleQuoteSelected() {
        if (!selectedText) { setContextMenuOpen(false); return }
        setQuoteText(selectedText)
        setQuoteFromDocument(sourceDocument || null)
        setContextMenuOpen(false)
    }



    async function handleRenameThread(threadId, currentName) {
        if (!isAuthenticated) return
        setRenameTarget({ id: threadId, name: currentName || '' })
        setRenameName(currentName || '')
        setRenameOpen(true)
    }

    async function submitRename(e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault()
        if (!isAuthenticated) { setRenameOpen(false); return }
        const id = renameTarget?.id
        const name = (renameName || '').trim()
        if (!id || !name) { setRenameOpen(false); return }
        try {
            setRenameBusy(true)
            await ChatAPI.renameThread(id, name)
            await fetchThreads()
        } catch { /* ignore */ }
        finally {
            setRenameBusy(false)
            setRenameOpen(false)
        }
    }

    function autoGrowTextarea() {
        const el = inputRef.current
        if (!el) return
        const maxH = 160
        el.style.height = 'auto'
        const newH = Math.min(el.scrollHeight, maxH)
        el.style.height = newH + 'px'
        el.style.overflowY = (el.scrollHeight > maxH) ? 'auto' : 'hidden'
        // После изменения высоты инпута обновляем нижний отступ области сообщений
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(updateChatBottomPadding)
        else updateChatBottomPadding()
    }

    function updateChatBottomPadding() {
        const bodyEl = bodyRef.current
        const formEl = formRef.current
        if (!bodyEl) return
        const formH = formEl ? formEl.offsetHeight : 0
        const buffer = 12 // небольшой запас
        bodyEl.style.paddingBottom = (formH + buffer) + 'px'
    }

    function handleNewChat() {
        closeStream()
        setActiveId(null)
        setMessages([])
    }

    async function handleSubmit(e, options = {}) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault()
        if (!isAuthenticated) return
        const { forceNewThread = false, initialContent } = options
        const el = inputRef.current
        if (!el && !initialContent) return
        const valueRaw = initialContent != null ? String(initialContent) : String(el.value || '')
        const value = valueRaw.trim()
        if (!value) return

        // If no thread yet OR forced new thread, create a client-side UUID and optimistic sidebar item
        let threadId = activeId
        if (forceNewThread || !threadId) {
            const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
                ? crypto.randomUUID()
                : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
            threadId = newId
            setActiveId(newId)
            setThreads((prev) => [{ id: newId, chat_name: 'New Chat', last_activity_time: new Date().toISOString() }, ...prev])
        }

        // Append user message immediately, вместе с локальной цитатой для UI
        setMessages((prev) => [...prev, { type: 'human', content: value, quote: quoteText || null, quote_message_id: quoteSourceMessageId || null }])
        if (el) {
            el.value = ''
            autoGrowTextarea()
        }

        // Подготавливаем данные для отправки с возможным цитированием
        const messageData = {
            message: value,
            quote: quoteText || null,
            from_document: quoteFromDocument || null
        }
        try { console.log('[Quote][sendMessage] payload', messageData) } catch { /* ignore */ }

        await ChatAPI.sendMessage(threadId, messageData).catch(() => { })

        // Очищаем цитирование после отправки
        clearQuote()

        // Открываем стрим и показываем плейсхолдер до первого чанка
        openStream(threadId, { showLoadingPlaceholder: true })
    }

    useEffect(() => {
        if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }, [messages])

    // Гарантируем, что нижний отступ и скролл обновляются при изменении высоты формы (в т.ч. при появлении цитаты)
    useLayoutEffect(() => {
        const bodyEl = bodyRef.current
        const formEl = formRef.current
        if (!bodyEl) return

        const apply = () => {
            updateChatBottomPadding()
            bodyEl.scrollTop = bodyEl.scrollHeight
        }

        // Первый запуск после монтирования
        try { requestAnimationFrame(apply) } catch { setTimeout(apply, 0) }

        let ro = null
        if (typeof ResizeObserver !== 'undefined' && formEl) {
            try {
                ro = new ResizeObserver(() => apply())
                ro.observe(formEl)
            } catch { /* ignore */ }
        } else {
            window.addEventListener('resize', apply)
        }

        return () => {
            if (ro) {
                try { ro.disconnect() } catch { /* ignore */ }
            } else {
                window.removeEventListener('resize', apply)
            }
        }
    }, [])

    // Показ меню при выделении (desktop/mobile) с задержкой и сохранением выделения

    function showCopyToast() {
        try { if (copyToastTimerRef.current) clearInterval(copyToastTimerRef.current) } catch { /* ignore */ }
        setCopyToastVisible(true)
        setCopyToastProgress(100)
        const startedAt = Date.now()
        const duration = 2000
        copyToastTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - startedAt
            const pct = Math.max(0, 100 - Math.round(elapsed / duration * 100))
            setCopyToastProgress(pct)
            if (elapsed >= duration) {
                try { clearInterval(copyToastTimerRef.current) } catch { /* ignore */ }
                copyToastTimerRef.current = null
                setCopyToastVisible(false)
            }
        }, 50)
    }
    useEffect(() => {
        let mounted = true
            ; (async function init() {
                try {
                    if (!loading && isAuthenticated) {
                        const list = await fetchThreads()
                        // Если q присутствовал при первом заходе — не выбираем первый тред автоматически
                        const hasQ = initialHasQRef.current && !hasProcessedQueryRef.current
                        if (mounted && list && list.length && !hasQ) {
                            await selectThread(list[0].id)
                        }
                    } else {
                        // если не авторизован — очищаем локальное состояние и закрываем стримы
                        closeStream()
                        setThreads([])
                        setMessages([])
                        setActiveId(null)
                    }
                } catch { /* ignore */ }
            })()
        return () => {
            mounted = false
            closeStream()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, loading])

    // Обработка query-параметра q: при входе на страницу и наличии авторизации — отправляем как новое сообщение
    useEffect(() => {
        if (loading || !isAuthenticated || hasProcessedQueryRef.current) return
        try {
            const params = new URLSearchParams(window.location.search || '')
            const q = (params.get('q') || '').trim()
            if (!q) return
            hasProcessedQueryRef.current = true
            // Отправляем q в новый тред без привязки к текущему активному
            handleSubmit({ preventDefault: function () { /* no-op */ } }, { forceNewThread: true, initialContent: q })
            // Очищаем q из URL, чтобы не переотправлять при навигации
            try {
                const url = new URL(window.location.href)
                url.searchParams.delete('q')
                window.history.replaceState({}, '', url.toString())
            } catch { /* ignore */ }
        } catch { /* ignore */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, loading])

    // Очистка старых выделений (старше 5 минут)
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            const now = Date.now()
            const maxAge = 5 * 60 * 1000 // 5 минут

            setPersistentHighlights(prev =>
                prev.filter(highlight => now - highlight.timestamp < maxAge)
            )
        }, 60000) // Проверяем каждую минуту

        return () => clearInterval(cleanupInterval)
    }, [])

    return (
        <div className="h-full min-h-0 flex flex-col">
            {/* Mobile drawer for threads */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform shadow-xl transition-transform duration-200 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`} style={{ background: 'var(--surface-solid)' }}>
                <div className="border-b p-4 flex items-center justify-between">
                    <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Останні запити</div>
                    <button onClick={() => setDrawerOpen(false)} className="text-xs font-medium hover:underline" style={{ color: 'var(--accent)' }}>Закрити</button>
                </div>
                <div className="p-3">
                    <div className="mb-3 flex items-center justify-between">
                        <button type="button" onClick={handleNewChat} className="text-xs font-medium hover:underline" style={{ color: 'var(--accent)' }}>Новий чат</button>
                    </div>
                    <div className="space-y-3">
                        {threads && threads.length > 0 ? (
                            groupThreadsByDate(threads).map((group, groupIdx) => (
                                <div key={groupIdx} className="space-y-1.5">
                                    <div className="text-xs font-medium px-2 py-1" style={{ color: '#6B7280' }}>
                                        {group.label}
                                    </div>
                                    {group.threads.map((t) => (
                                        <div key={t.id} className="thread-item">
                                            <button type="button" onClick={() => { setDrawerOpen(false); selectThread(t.id) }} className={`thread-item__title ${activeId === t.id ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`} style={{ color: '#4B5563' }}>
                                                {t.chat_name || 'New Chat'}
                                            </button>
                                            <button type="button" onClick={() => handleRenameThread(t.id, t.chat_name)} title="Перейменувати" className="thread-item__icon" aria-label="Перейменувати">
                                                <Pencil size={16} />
                                            </button>
                                            <button type="button" onClick={() => handleDeleteThread(t.id)} title="Видалити" className="thread-item__icon" aria-label="Видалити">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <div className="text-xs" style={{ color: '#9CA3AF' }}>Поки що порожньо</div>
                        )}
                    </div>
                </div>
            </div>
            {drawerOpen && (
                <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setDrawerOpen(false)} />
            )}

            <div className="flex h-full max-w-[100%] relative min-h-0" style={{ padding: '0' }}>
                <aside
                    className={`hidden md:block transition-all duration-300 ease-in-out ${chatSidebarOpen ? 'md:w-72 lg:w-80' : 'w-0'
                        } shrink-0 overflow-hidden`}
                    style={{ borderRight: '1px solid var(--border)' }}
                >
                    <div className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Останні запити</div>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={handleNewChat} className="text-xs font-medium hover:underline" style={{ color: 'var(--accent)' }}>
                                    <Plus size={16} style={{ color: 'var(--muted)' }} />
                                </button>
                                <button
                                    type="button"
                                    onClick={toggleChatSidebar}
                                    className="p-1 rounded-md hover:bg-surface transition-colors"
                                    aria-label="Сховати чати"
                                >
                                    <PanelLeftClose size={16} style={{ color: 'var(--muted)' }} />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {threads && threads.length > 0 ? (
                                groupThreadsByDate(threads).map((group, groupIdx) => (
                                    <div key={groupIdx} className="space-y-1.5">
                                        <div className="text-xs font-medium px-2 py-1 border-b border-gray-100" style={{ color: '#6B7280' }}>
                                            {group.label}
                                        </div>
                                        {group.threads.map((t) => (
                                            <div key={t.id} className={`thread-item rounded-md max-w-[100%] ${activeId === t.id ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}>
                                                <button type="button" onClick={() => selectThread(t.id)} className={`thread-item__title`} style={{ color: '#4B5563' }}>
                                                    {t.chat_name || 'New Chat'}
                                                </button>
                                                <div className="thread-button-group">
                                                    <button type="button" onClick={() => handleRenameThread(t.id, t.chat_name)} title="Перейменувати" className="thread-item__icon" aria-label="Перейменувати">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button type="button" onClick={() => handleDeleteThread(t.id)} title="Видалити" className="thread-item__delete-icon" aria-label="Видалити">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs" style={{ color: '#9CA3AF' }}>Поки що порожньо</div>
                            )}
                        </div>
                    </div>
                </aside>

                <section className="relative flex h-full min-h-0 flex-1 flex-col">
                    <div className="mb-2 flex items-center justify-between px-4 pt-2">
                        <div className="flex items-center gap-3">
                            {!chatSidebarOpen && (
                                <button
                                    type="button"
                                    onClick={toggleChatSidebar}
                                    className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium"
                                    aria-label="Показати чати"
                                >
                                    <PanelLeft size={16} style={{ color: 'var(--accent)' }} />
                                    <span style={{ color: 'var(--accent)' }}>Чати</span>
                                </button>
                            )}
                            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight pt-2" style={{ color: 'var(--accent)' }}>Юридичний ШІ</h1>
                            {isAuthenticated && activeId ? (
                                <div className="flex items-center gap-2 ml-2">
                                    <button type="button" aria-label="Like thread" className={`inline-flex items-center justify-center h-8 w-8 rounded-full border ${threadReaction === 1 ? 'bg-green-50 border-green-300' : 'border-gray-200'}`} onClick={() => handleThreadReaction(1)}>
                                        <ThumbsUp size={16} color={threadReaction === 1 ? '#16a34a' : 'currentColor'} />
                                    </button>
                                    <button type="button" aria-label="Dislike thread" className={`inline-flex items-center justify-center h-8 w-8 rounded-full border ${threadReaction === 0 ? 'bg-red-50 border-red-300' : 'border-gray-200'}`} onClick={() => handleThreadReaction(0)}>
                                        <ThumbsDown size={16} color={threadReaction === 0 ? '#dc2626' : 'currentColor'} />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Тест сайдбара"
                                        className="inline-flex items-center justify-center h-8 px-3 rounded-md border border-gray-200 hover:bg-gray-50 text-xs font-medium"
                                        onClick={() => {
                                            const testLaw = {
                                                "id": "009557fd-d8e8-416a-841c-a736e14b0de9",
                                                "title": "Про внесення змін до Закону України \"Про використання ядерної енергії та радіаційну безпеку\"",
                                                "code": "2762-IX",
                                                "edition": 1,
                                                "date": "2022-11-16",
                                                "in_force": true,
                                                "text_html": "<div id=\"article\" class=\"valid\" data-goto=\"Text\">\n<div style=\"width:660px;max-width:100%;margin:0 auto\">\n<link rel=\"stylesheet\" type=\"text/css\" href=\"https://zakon.rada.gov.ua/laws/file/util/0/u_text.css\" async />\n<div class=\"rvts0\"><div class=rvps8><a name=\"n2\" data-tree=\"ty_1\" class=clear></a>\n<table width=\"100%\" border=0 cellpadding=0 cellspacing=0>\n<tr valign=top>\n<td>\n<p class=rvps7><img alt=\"\" hspace=1 vspace=1 src=\"https://zakonst.rada.gov.ua/images/gerb.gif\" title=\"Герб України\"></p>\n</td>\n</tr>\n<tr valign=top>\n<td>\n<p class=rvps17><span class=rvts78>ЗАКОН УКРАЇНИ</span></p>\n</td>\n</tr>\n</table>\n</div>\n<p class=rvps6><a name=\"n3\" data-tree=\"nz_1\"></a>\n<span class=rvts23>Про внесення змін до Закону України \"Про використання ядерної енергії та радіаційну безпеку\"</span></p>\n<em><p class=rvps7><a name=\"n42\" data-tree=\"cm_1:nz_1\"></a>\n<span class=rvts44>(Відомості Верховної Ради (ВВР), 2023, № 52, ст.150)</span></p>\n</em><p class=rvps2><a name=\"n4\" data-tree=\"rz_1\"></a>\nВерховна Рада України <span class=rvts52>постановляє:</span></p>\n<p class=rvps2><a name=\"n5\" data-tree=\"rz1\"></a>\nI. Внести до <a class=rvts96 href=\"https://zakon.rada.gov.ua/laws/show/39/95-%D0%B2%D1%80\" target=_blank>Закону України</a> \"Про використання ядерної енергії та радіаційну безпеку\" (Відомості Верховної Ради України, 1995 р., № 12, ст. 81 із наступними змінами) такі зміни:</p>\n<p class=rvps2><a name=\"n6\" data-tree=\"pu1:rz1\"></a>\n1. У <a class=rvts96 href=\"https://zakon.rada.gov.ua/laws/show/39/95-%D0%B2%D1%80#n15\" target=_blank>частині першій</a> статті 1:</p>\n<p class=rvps2><a name=\"n7\" data-tree=\"ch_1:pu1:rz1\"></a>\nвизначення терміна \"радіоактивні матеріали\" викласти в такій редакції:</p>\n<p class=rvps2><a name=\"n8\" data-tree=\"ch_2:pu1:rz1\"></a>\n\"радіоактивний матеріал - матеріал, до складу якого входять радіоактивні речовини. До радіоактивних матеріалів належать: радіонуклідні джерела іонізуючого випромінювання, ядерні матеріали та радіоактивні відходи\";</p>\n</div></div>\n</div>"
                                            }
                                            openDocumentInSidebar(testLaw)
                                        }}
                                    >
                                        <FileText size={14} />
                                        <span className="ml-1">Тест</span>
                                    </button>
                                </div>
                            ) : null}
                        </div>
                        <button type="button" className="md:hidden inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm" onClick={() => setDrawerOpen(true)} aria-label="Відкрити меню тредів">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" style={{ color: 'var(--accent)' }}>
                                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span className="text-[13px]" style={{ color: 'var(--accent)' }}>Чати</span>
                        </button>
                    </div>
                    <div ref={bodyRef} id="chatBody" className="mt-2 flex-1 overflow-y-auto bg-white p-2 sm:p-6 space-y-4" style={{ border: 'none', borderRadius: 0 }}>
                        {messages && messages.length > 0 ? (
                            messages.map((m, idx) => (
                                <div key={idx}>
                                    {m.type === 'human' ? (
                                        <div className="flex justify-end">
                                            <div
                                                className="chat-bubble chat-bubble--user"
                                                style={{ userSelect: 'text' }}
                                            >
                                                {m.quote ? (
                                                    <div className="quote-preview mb-2 text-xs px-3 py-2 rounded-md border opacity-80" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
                                                        <div className="flex items-center gap-2 mb-1"><CornerDownRight size={14} /> <span>цитата:</span></div>
                                                        <div className="whitespace-pre-wrap break-words">{m.quote}</div>
                                                    </div>
                                                ) : null}
                                                {m.content}
                                            </div>
                                        </div>
                                    ) : m.type === 'ai_error' ? (
                                        <div className="flex justify-start">
                                            <div className="chat-bubble chat-bubble--ai chat-bubble--error">
                                                <div className="md-answer whitespace-pre-wrap">{m.content}</div>
                                            </div>
                                        </div>
                                    ) : m.type === 'ai_loading' ? (
                                        <div className="flex justify-start">
                                            <div className="chat-bubble chat-bubble--ai">
                                                <div className="flex items-center gap-2">
                                                    <div className="typing" aria-label="Завантаження">
                                                        <span></span>
                                                        <span></span>
                                                        <span></span>
                                                    </div>
                                                    {idx === messages.length - 1 && activeTools.length > 0 ? (
                                                        <div className="tool-call-ui">
                                                            <span className="tool-call-spinner" />
                                                            <span className="tool-call-text">{activeTools.map(getToolLabel).join(' • ')}</span>
                                                        </div>
                                                    ) : null}
                                                </div>
                                                {idx === messages.length - 1 && currentSources && currentSources.length > 0 ? (
                                                    <div className="source-chips mt-2">
                                                        {currentSources.map((s, i) => (
                                                            <button
                                                                key={i}
                                                                className="source-chip hover:bg-surface hover:border-blue-300 cursor-pointer transition-colors"
                                                                onClick={() => openDocumentInSidebar({ title: s, content: 'Завантаження документа...', name: s })}
                                                            >
                                                                <FileText size={14} />{s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-start">
                                            <div
                                                className="chat-bubble chat-bubble--ai"
                                                data-message-id={m.id ?? idx}
                                                onContextMenu={(e) => handleContextMenu(e, idx, null)}
                                                style={{ userSelect: 'text' }}
                                            >
                                                <div
                                                    className="md-answer"
                                                    onContextMenu={(e) => handleContextMenu(e, idx, null)}
                                                >
                                                    {m.quote ? (
                                                        <div className="quote-preview mb-2 text-xs px-3 py-2 rounded-md border opacity-80" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
                                                            <div className="flex items-center gap-2 mb-1"><CornerDownRight size={14} /> <span>цитата:</span></div>
                                                            <div className="whitespace-pre-wrap break-words">{m.quote}</div>
                                                        </div>
                                                    ) : null}
                                                    <HighlightedText
                                                        content={normalizeMarkdownText(m.content)}
                                                        highlights={persistentHighlights}
                                                        messageId={m.id ?? idx}
                                                    />
                                                </div>

                                                {idx === messages.length - 1 && activeTools.length > 0 && currentStatus === 'using tool' ? (
                                                    <div className="tool-call-ui">
                                                        <span className="tool-call-spinner" />
                                                        <span className="tool-call-text">{activeTools.map(getToolLabel).join(' • ')}</span>
                                                    </div>
                                                ) : null}
                                                {/* Источники: онлайн для текущего ответа или из сохранённых в сообщении */}
                                                {idx === messages.length - 1 && currentSources && currentSources.length > 0 ? (
                                                    <div className="source-chips">
                                                        {currentSources.map((s, i) => (
                                                            <button
                                                                key={i}
                                                                className="source-chip hover:bg-surface hover:border-blue-300 cursor-pointer transition-colors"
                                                                onClick={() => openDocumentInSidebar({ title: s, content: 'Завантаження документа...', name: s })}
                                                            >
                                                                <FileText size={14} />{s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (Array.isArray(m.sources) && m.sources.length > 0 ? (
                                                    <div className="source-chips">
                                                        {m.sources.map((s, i) => (
                                                            <button
                                                                key={i}
                                                                className="source-chip hover:bg-surface hover:border-blue-300 cursor-pointer transition-colors"
                                                                onClick={() => openDocumentInSidebar({ title: s, content: 'Завантаження документа...', name: s })}
                                                            >
                                                                <FileText size={14} />{s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : null)}
                                                {m.finished && (idx !== messages.length - 1 || !isStreaming) && (
                                                    <div className="mt-2 flex items-center gap-2 opacity-80">
                                                        <button type="button" title="Копіювати" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50" onClick={() => copyMessage(m.content, idx)}>
                                                            {copiedIdx === idx ? <Check size={14} /> : <Copy size={14} />}
                                                            <span>{copiedIdx === idx ? 'Скопійовано' : 'Копіювати'}</span>
                                                        </button>
                                                        <button type="button" title="Поділитися" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50" onClick={() => openShare(m.content)}>
                                                            <Share2 size={14} />
                                                            <span>Поділитися</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm" style={{ color: '#6B7280' }}>
                                Опишіть вашу ситуацію або поставте юридичне питання — і отримаєте відповідь з посиланнями на закони.
                            </div>
                        )}
                    </div>
                    <SelectionAskPopup
                        containerRef={bodyRef}
                        onAsk={(text) => {
                            setQuoteText(text)
                            setQuoteFromDocument(null)
                            setQuoteSourceMessageId(null)
                        }}
                    />
                    <form id="chatForm" ref={formRef} onSubmit={handleSubmit} className="absolute bottom-0 left-0 right-0 flex-col items-end gap-3 px-4 py-3 sm:py-4 border-t" style={{ background: 'var(--surface-solid)', borderColor: 'var(--border)' }}>
                        {quoteText && (
                            <div className="px-4">
                                <div className="quote-input-container">
                                    <div className="flex items-center gap-2 w-full">
                                        <div className="quote-badge flex items-start gap-2 px-3 py-2 rounded-lg text-sm border mb-2" title={`"${quoteText}"`}>
                                            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                                                <CornerDownRight size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0 whitespace-pre-wrap break-words">"{quoteText}"</div>
                                            <button type="button" onClick={clearQuote} className="p-1 rounded-full hover:bg-surface transition-colors" style={{ color: 'var(--muted)' }} aria-label="Скасувати цитування">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <textarea ref={inputRef} onInput={autoGrowTextarea} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) } }} id="chatInput" name="q" rows={1} placeholder="Опишіть питання… (Shift+Enter — новий рядок)" className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" style={{ overflowY: 'hidden' }}></textarea>
                            {isStreaming ? (
                                <button id="stopBtn" type="button" onClick={abortStream} className={`shrink-0 inline-flex items-center justify-center rounded-full h-11 w-11 text-white hover:opacity-95 ${!isAuthenticated ? 'opacity-60 cursor-not-allowed' : ''}`} style={{ background: 'var(--accent)' }} aria-label="Зупинити генерацію" disabled={!isAuthenticated} aria-disabled={!isAuthenticated ? 'true' : 'false'}>
                                    <Square size={18} />
                                </button>
                            ) : (
                                <button id="sendBtn" disabled={!isAuthenticated} aria-disabled={!isAuthenticated ? 'true' : 'false'} className={`shrink-0 inline-flex items-center justify-center rounded-full h-11 w-11 text-white hover:opacity-95 ${!isAuthenticated ? 'opacity-60 cursor-not-allowed' : ''}`} style={{ background: 'var(--accent)' }} type="submit" aria-label="Надіслати">
                                    <Send size={18} />
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                {/* Desktop Document Sidebar */}
                <aside
                    className={`hidden md:block transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-96 lg:w-[28rem]' : 'w-0'
                        } overflow-hidden border-l border-gray-200`}
                    style={{ background: 'var(--surface-solid)' }}
                >
                    <DocumentSidebar
                        isOpen={sidebarOpen}
                        document={currentDocument}
                        onClose={closeSidebar}
                        isDesktop={true}
                        onQuote={(text, documentId) => {
                            setQuoteText(text)
                            setQuoteFromDocument(documentId)
                        }}
                    />
                </aside>

                {(!loading && !isAuthenticated) && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(131, 131, 131, 0.1)', WebkitBackdropFilter: 'blur(6px)', backdropFilter: 'blur(6px)', boxShadow: '0px 0px 20px 20px rgba(131, 131, 131, 0.1)', width: '101%', height: '104%' }}>
                        <div className="max-w-md w-[92%] sm:w-auto rounded-2xl border p-6 text-center shadow-sm"
                            style={{ background: 'var(--surface-solid)', color: 'var(--ink)', borderColor: 'var(--border)' }}>
                            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--accent)' }}>Доступ до чату</h2>
                            <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Використання чату доступне лише зареєстрованим користувачам.</p>
                            <div className="flex items-center justify-center gap-2">
                                <a href="/auth/login" className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border" style={{ background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}>Увійти</a>
                                <a href="/auth/register" className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border" style={{ background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}>Зареєструватися</a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rename chat modal (portal to body to avoid stacking issues on mobile) */}
                {renameOpen && createPortal(
                    <div className="fixed inset-0 flex items-center justify-center" aria-modal="true" role="dialog" style={{ zIndex: 1000 }}>
                        <div className="absolute inset-0 bg-black/40" onClick={() => !renameBusy && setRenameOpen(false)} />
                        <form onSubmit={submitRename} className="relative z-10 w-[92%] sm:w-[420px] rounded-2xl border p-5 shadow-sm" style={{ background: 'var(--surface-solid)', color: 'var(--ink)', borderColor: 'var(--border)' }}>
                            <div className="text-lg font-semibold mb-2" style={{ color: 'var(--accent)' }}>Перейменувати чат</div>
                            <div className="text-xs mb-3" style={{ color: '#6B7280' }}>Введіть нову назву для цього чату.</div>
                            <input autoFocus disabled={renameBusy} value={renameName} onChange={(e) => setRenameName(e.target.value)} placeholder="Назва чату" className="w-full rounded-md border px-3 py-2 text-sm" style={{ background: 'var(--surface)', color: 'var(--ink)', borderColor: 'var(--border)' }} />
                            <div className="mt-4 flex items-center justify-end gap-2">
                                <button type="button" disabled={renameBusy} onClick={() => setRenameOpen(false)} className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm border" style={{ background: 'transparent', color: 'var(--ink)', borderColor: 'var(--border)' }}>Скасувати</button>
                                <button type="submit" disabled={renameBusy || !renameName.trim()} className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-white" style={{ background: 'var(--accent)', opacity: (renameBusy || !renameName.trim()) ? .6 : 1 }}>Зберегти</button>
                            </div>
                        </form>
                    </div>, document.body
                )}

                {/* Share modal */}
                {shareOpen && createPortal(
                    <div className="fixed inset-0 flex items-center justify-center" aria-modal="true" role="dialog" style={{ zIndex: 1000 }}>
                        <div className="absolute inset-0 bg-black/40" onClick={() => setShareOpen(false)} />
                        <div className="relative z-10 w-[92%] sm:w-[520px] rounded-2xl border p-5 shadow-sm" style={{ background: 'var(--surface-solid)', color: 'var(--ink)', borderColor: 'var(--border)' }}>
                            <div className="text-lg font-semibold mb-2" style={{ color: 'var(--accent)' }}>Поділитися відповіддю</div>
                            <div className="text-xs mb-3" style={{ color: '#6B7280' }}>Оберіть дію для поточного повідомлення.</div>
                            <div className="grid grid-cols-2 gap-2">
                                <a href={`mailto:?subject=${encodeURIComponent('Відповідь ШІ')}&body=${encodeURIComponent(shareContent)}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50">
                                    <Mail size={16} /> Надіслати e-mail
                                </a>
                                <button type="button" className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50" onClick={async () => {
                                    try {
                                        const file = await (await import('../lib/docxGen.js')).generateDocxFile({ title: 'AI Answer', bodyText: shareContent, fileName: 'answer.docx' })
                                        const url = URL.createObjectURL(file)
                                        const a = document.createElement('a')
                                        a.href = url
                                        a.download = file.name
                                        document.body.appendChild(a)
                                        a.click()
                                        a.remove()
                                        URL.revokeObjectURL(url)
                                    } catch { /* ignore */ }
                                }}>
                                    <FileText size={16} /> Експорт у Word
                                </button>
                                <a href={`https://t.me/share/url?url=${encodeURIComponent('')}&text=${encodeURIComponent(shareContent)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50">
                                    <MessageCircle size={16} /> Поділитися у Telegram
                                </a>
                                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareContent)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50">
                                    <MessageCircle size={16} /> Поділитися у WhatsApp
                                </a>
                                <button type="button" className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50" onClick={async () => {
                                    try {
                                        if (navigator.share) {
                                            await navigator.share({ text: shareContent })
                                        } else {
                                            await navigator.clipboard.writeText(shareContent)
                                        }
                                        setShareOpen(false)
                                    } catch { /* ignore */ }
                                }}>
                                    <MessageSquare size={16} /> Поділитися через системне меню
                                </button>
                            </div>
                            <div className="mt-4 flex items-center justify-end gap-2">
                                <button type="button" className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm border" style={{ background: 'transparent', color: 'var(--ink)', borderColor: 'var(--border)' }} onClick={() => setShareOpen(false)}>Закрити</button>
                            </div>
                        </div>
                    </div>, document.body
                )}

                {/* Context Menu */}
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
                        {/* Убираем копирование по требованию — оставляем только цитирование */}
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
                    document.body
                )}

                {copyToastVisible && (
                    <div className="absolute right-3 top-3 z-40">
                        <div className="copy-toast rounded-lg shadow-sm px-3 py-2 text-sm flex items-center gap-2 transition-opacity duration-200" style={{ color: 'var(--ink)' }}>
                            <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
                            <span>Текст скопійовано</span>
                        </div>
                        <div className="h-1 mt-1 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
                            <div className="h-full" style={{ width: copyToastProgress + '%', background: 'var(--accent)', transition: 'width 50ms linear' }} />
                        </div>
                    </div>
                )}

                {/* Mobile Document Sidebar */}
                <DocumentSidebar
                    isOpen={sidebarOpen}
                    document={currentDocument}
                    onClose={closeSidebar}
                    isDesktop={false}
                    onQuote={(text, documentId) => {
                        setQuoteText(text)
                        setQuoteFromDocument(documentId)
                    }}
                />
            </div>
        </div>
    )
}


