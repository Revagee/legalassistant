import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useAuth } from '../lib/authContext.jsx'
import { ChatAPI, getBaseUrl, getStoredToken } from '../lib/api.js'
import { Trash2, Pencil } from 'lucide-react'

export default function AIChat() {
    const bodyRef = useRef(null)
    const inputRef = useRef(null)
    const esRef = useRef(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const { isAuthenticated, loading } = useAuth()

    const [threads, setThreads] = useState([])
    const [activeId, setActiveId] = useState(null)
    const [messages, setMessages] = useState([])
    const [isStreaming, setIsStreaming] = useState(false)
    const [toolCallText, setToolCallText] = useState('')

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

    async function fetchThreads() {
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
        const data = await ChatAPI.getThreadMessages(threadId)
        // Expecting array of { type: 'human'|'ai', content: string }
        const normalized = Array.isArray(data) ? data.map((m) => ({
            type: (m.type === 'human' || m.type === 'user') ? 'human' : 'ai',
            content: String(m.content || '')
        })) : []
        setMessages(normalized)
        return normalized
    }

    function closeStream() {
        try { if (esRef.current) esRef.current.close() } catch { /* ignore */ }
        esRef.current = null
        setSendDisabled(false)
        setToolCallText('')
    }

    function openStream(threadId) {
        closeStream()
        if (!threadId) return
        const base = getBaseUrl()
        const token = getStoredToken()
        const url = new URL((base.startsWith('http') ? base : window.location.origin + base) + '/chat/stream')
        url.searchParams.set('thread_id', threadId)
        if (token) url.searchParams.set('access_token', token)
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
            if ((ev.data || '').trim() === 'end') {
                closeStream()
                fetchThreads().catch(() => { })
            }
        })
        es.addEventListener('tool_call', (ev) => {
            const text = String(ev.data || '').trim()
            setToolCallText(text)
        })
        es.onerror = () => {
            // close silently if server returned 204/no stream
            closeStream()
        }
    }

    async function selectThread(threadId) {
        if (!threadId) return
        setActiveId(threadId)
        setMessages([])
        closeStream()
        await fetchThreadMessages(threadId)
        openStream(threadId)
    }

    async function handleDeleteThread(threadId) {
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

    async function handleRenameThread(threadId, currentName) {
        setRenameTarget({ id: threadId, name: currentName || '' })
        setRenameName(currentName || '')
        setRenameOpen(true)
    }

    async function submitRename(e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault()
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
    }

    function handleNewChat() {
        closeStream()
        setActiveId(null)
        setMessages([])
    }

    async function handleSubmit(e) {
        e.preventDefault()
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
        let mounted = true
            ; (async function init() {
                try {
                    const list = await fetchThreads()
                    if (mounted && list && list.length) {
                        await selectThread(list[0].id)
                    }
                } catch { /* ignore */ }
            })()
        return () => {
            mounted = false
            closeStream()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="px-6 sm:px-8 py-6 sm:py-8 h-[100dvh]">
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
                    <div className="grid gap-1.5">
                        {threads && threads.length > 0 ? (
                            threads.map((t) => (
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

            <div className="mx-auto flex h-full max-w-[100%] px-6 relative">
                <aside className="hidden md:block md:w-1/4 md:pr-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 mt-6">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Останні запити</div>
                            <button type="button" onClick={handleNewChat} className="text-xs font-medium hover:underline" style={{ color: 'var(--accent)' }}>Новий чат</button>
                        </div>
                        <div className="">
                            {threads && threads.length > 0 ? (
                                threads.map((t) => (
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
                                ))
                            ) : (
                                <div className="text-xs" style={{ color: '#9CA3AF' }}>Поки що порожньо</div>
                            )}
                        </div>
                    </div>
                </aside>

                <section className="flex h-full min-h-0 flex-1 flex-col">
                    <div className="mb-2 flex items-center justify-between">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight pt-2" style={{ color: 'var(--accent)' }}>Юридичний ШІ</h1>
                        <button type="button" className="md:hidden inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm" onClick={() => setDrawerOpen(true)} aria-label="Відкрити меню тредів">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" style={{ color: 'var(--accent)' }}>
                                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span className="text-[13px]" style={{ color: 'var(--accent)' }}>Чати</span>
                        </button>
                    </div>
                    <div ref={bodyRef} id="chatBody" className="mt-2 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 sm:p-6 space-y-4">
                        {messages && messages.length > 0 ? (
                            messages.map((m, idx) => (
                                <div key={idx}>
                                    {m.type === 'human' ? (
                                        <div className="flex justify-end">
                                            <div className="chat-bubble chat-bubble--user">{m.content}</div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-start">
                                            <div className="chat-bubble chat-bubble--ai">
                                                <div className="md-answer whitespace-pre-wrap" data-md="1">{m.content}</div>
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
                    <form id="chatForm" onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                        <textarea ref={inputRef} onInput={autoGrowTextarea} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) } }} id="chatInput" name="q" rows={1} placeholder="Опишіть питання… (Shift+Enter — новий рядок)" className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" style={{ overflowY: 'hidden' }}></textarea>
                        <button id="sendBtn" disabled={isStreaming} aria-disabled={isStreaming ? 'true' : 'false'} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white hover:opacity-95 ${isStreaming ? 'opacity-60 cursor-not-allowed' : ''}`} style={{ background: 'var(--accent)' }} type="submit">
                            <span>Надіслати</span>
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
            </div>
        </div>
    )
}


