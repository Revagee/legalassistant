import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useAuth } from '../lib/authContext.jsx'
import { ChatAPI, getBaseUrl } from '../lib/api.js'
import { Trash2, Pencil, Send, ThumbsUp, ThumbsDown, Copy, Check, Share2, FileText, Mail, MessageCircle, MessageSquare } from 'lucide-react'

export default function AIChat() {
    const bodyRef = useRef(null)
    const inputRef = useRef(null)
    const formRef = useRef(null)
    const esRef = useRef(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const { isAuthenticated, loading } = useAuth()

    const [threads, setThreads] = useState([])
    const [activeId, setActiveId] = useState(null)
    const [messages, setMessages] = useState([])
    const [isStreaming, setIsStreaming] = useState(false)
    const [toolCallText, setToolCallText] = useState('')
    const [copiedIdx, setCopiedIdx] = useState(null)
    const [shareOpen, setShareOpen] = useState(false)
    const [shareContent, setShareContent] = useState('')
    const [threadReaction, setThreadReaction] = useState(null) // 1 like, 0 dislike, null none

    // Rename modal state
    const [renameOpen, setRenameOpen] = useState(false)
    const [renameBusy, setRenameBusy] = useState(false)
    const [renameTarget, setRenameTarget] = useState({ id: null, name: '' })
    const [renameName, setRenameName] = useState('')

    function setSendDisabled(disabled) {
        setIsStreaming(!!disabled)
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
        // Expecting array of { type: 'human'|'ai', content: string }
        setThreadReaction(data.reaction)
        setMessages(data.messages)
        return data.messages
    }

    function closeStream() {
        try { if (esRef.current) esRef.current.close() } catch { /* ignore */ }
        esRef.current = null
        setSendDisabled(false)
        setToolCallText('')
    }

    function openStream(threadId) {
        closeStream()
        if (!threadId || !isAuthenticated) return
        const base = getBaseUrl()
        const url = new URL((base.startsWith('http') ? base : window.location.origin + base) + '/chat/stream')
        url.searchParams.set('thread_id', threadId)
        const es = new EventSource(url.toString())
        esRef.current = es
        setSendDisabled(true)

        let started = false

        const appendAiChunk = (chunk) => {
            setMessages((prev) => {
                const next = [...prev]
                if (!started || next.length === 0 || next[next.length - 1].type !== 'ai') {
                    next.push({ type: 'ai', content: String(chunk || '') })
                } else {
                    next[next.length - 1] = { ...next[next.length - 1], content: next[next.length - 1].content + String(chunk || '') }
                }
                return next
            })
            started = true
            if (toolCallText) setToolCallText('')
            if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
        }

        es.onmessage = (ev) => {
            if (typeof ev.data === 'string' && ev.data.length) appendAiChunk(ev.data)
        }
        es.addEventListener('chunk', (ev) => {
            if (typeof ev.data === 'string' && ev.data.length) appendAiChunk(ev.data)
        })
        es.addEventListener('system', (ev) => {
            const text = (ev.data || '').trim()
            if (text === 'end') {
                closeStream()
                fetchThreads().catch(() => { })
            } else if (text === 'error') {
                // Сервер сообщил об ошибке генерации. Показываем только если поток начался.
                if (started) {
                    setMessages((prev) => ([
                        ...prev,
                        { type: 'ai_error', content: 'Помилка генерації відповіді' }
                    ]))
                    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
                }
                closeStream()
            }
        })
        es.addEventListener('tool_call', (ev) => {
            const text = String(ev.data || '').trim()
            setToolCallText(text)
        })
        es.onerror = () => {
            // Показываем ошибку только если поток реально начался.
            // При первичном подключении SSE часто эмитит onerror (reconnect),
            // что не является ошибкой генерации и не должно пугать пользователя.
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
        } catch { /* ignore */ }
    }

    function openShare(text) {
        setShareContent(String(text || ''))
        setShareOpen(true)
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

    async function handleSubmit(e) {
        e.preventDefault()
        if (!isAuthenticated) return
        const el = inputRef.current
        if (!el) return
        const value = (el.value || '').trim()
        if (!value) return

        // If no thread yet, create a client-side UUID and optimistic sidebar item
        let threadId = activeId
        if (!threadId) {
            const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
                ? crypto.randomUUID()
                : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
            threadId = newId
            setActiveId(newId)
            setThreads((prev) => [{ id: newId, chat_name: 'New Chat', last_activity_time: new Date().toISOString() }, ...prev])
        }

        // Append user message immediately
        setMessages((prev) => [...prev, { type: 'human', content: value }])
        el.value = ''
        autoGrowTextarea()

        await ChatAPI.sendMessage(threadId, value).catch(() => { })

        openStream(threadId)
    }

    useEffect(() => {
        if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }, [messages])

    useEffect(() => {
        const container = bodyRef.current
        if (!container) return
        const nodes = container.querySelectorAll('.md-answer[data-md="1"]')
        nodes.forEach((n) => {
            try {
                const raw = n.textContent || ''
                const html = DOMPurify.sanitize(marked.parse(raw, { gfm: true, breaks: true, headerIds: false, mangle: false }))
                n.innerHTML = html
                n.classList.remove('whitespace-pre-wrap')
            } catch {
                // ignore
            }
        })
    }, [messages])

    useEffect(() => {
        // Инициализируем динамический нижний отступ и обновляем при ресайзе
        function onResize() { updateChatBottomPadding() }
        updateChatBottomPadding()
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    useEffect(() => {
        let mounted = true
            ; (async function init() {
                try {
                    if (!loading && isAuthenticated) {
                        const list = await fetchThreads()
                        if (mounted && list && list.length) {
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
                <aside className="hidden md:block md:w-72 lg:w-80 shrink-0" style={{ borderRight: '1px solid var(--border)' }}>
                    <div className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Останні запити</div>
                            <button type="button" onClick={handleNewChat} className="text-xs font-medium hover:underline" style={{ color: 'var(--accent)' }}>Новий чат</button>
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
                            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight pt-2" style={{ color: 'var(--accent)' }}>Юридичний ШІ</h1>
                            {isAuthenticated && activeId ? (
                                <div className="flex items-center gap-2 ml-2">
                                    <button type="button" aria-label="Like thread" className={`inline-flex items-center justify-center h-8 w-8 rounded-full border ${threadReaction === 1 ? 'bg-green-50 border-green-300' : 'border-gray-200'}`} onClick={() => handleThreadReaction(1)}>
                                        <ThumbsUp size={16} color={threadReaction === 1 ? '#16a34a' : 'currentColor'} />
                                    </button>
                                    <button type="button" aria-label="Dislike thread" className={`inline-flex items-center justify-center h-8 w-8 rounded-full border ${threadReaction === 0 ? 'bg-red-50 border-red-300' : 'border-gray-200'}`} onClick={() => handleThreadReaction(0)}>
                                        <ThumbsDown size={16} color={threadReaction === 0 ? '#dc2626' : 'currentColor'} />
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
                                            <div className="chat-bubble chat-bubble--user">{m.content}</div>
                                        </div>
                                    ) : m.type === 'ai_error' ? (
                                        <div className="flex justify-start">
                                            <div className="chat-bubble chat-bubble--ai chat-bubble--error">
                                                <div className="md-answer whitespace-pre-wrap">{m.content}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-start">
                                            <div className="chat-bubble chat-bubble--ai">
                                                <div className="md-answer whitespace-pre-wrap" data-md="1">{m.content}</div>
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
                                                {idx === messages.length - 1 && toolCallText ? (
                                                    <div className="tool-call-ui">
                                                        <span className="tool-call-spinner" />
                                                        <span className="tool-call-text">{toolCallText}</span>
                                                    </div>
                                                ) : null}
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
                    <form id="chatForm" ref={formRef} onSubmit={handleSubmit} className="absolute bottom-0 left-0 right-0 flex items-end gap-3 px-4 py-3 sm:py-4 border-t" style={{ background: 'var(--surface-solid)', borderColor: 'var(--border)' }}>
                        <textarea ref={inputRef} onInput={autoGrowTextarea} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) } }} id="chatInput" name="q" rows={1} placeholder="Опишіть питання… (Shift+Enter — новий рядок)" className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" style={{ overflowY: 'hidden' }}></textarea>
                        <button id="sendBtn" disabled={!isAuthenticated || isStreaming} aria-disabled={!isAuthenticated || isStreaming ? 'true' : 'false'} className={`shrink-0 inline-flex items-center justify-center rounded-full h-11 w-11 text-white hover:opacity-95 ${(isStreaming || !isAuthenticated) ? 'opacity-60 cursor-not-allowed' : ''}`} style={{ background: 'var(--accent)' }} type="submit" aria-label="Надіслати">
                            <Send size={18} />
                        </button>
                    </form>
                </section>
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
            </div>
        </div>
    )
}


