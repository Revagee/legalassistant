import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default function AIChat({ history = [], threads = [], activeId = null }) {
    const bodyRef = useRef(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    useEffect(() => {
        if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }, [history])

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
    }, [history])

    return (
        <div className="px-6 sm:px-8 py-6 sm:py-8 h-[100dvh]">
            {/* Mobile drawer for threads */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform bg-white shadow-xl transition-transform duration-200 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
                <div className="border-b p-4 flex items-center justify-between">
                    <div className="text-sm font-semibold" style={{ color: '#111827' }}>Останні запити</div>
                    <button onClick={() => setDrawerOpen(false)} className="text-xs font-medium hover:underline" style={{ color: '#1E3A8A' }}>Закрити</button>
                </div>
                <div className="p-3">
                    <div className="mb-3 flex items-center justify-between">
                        <form method="post">
                            <input type="hidden" name="action" value="clear" />
                            <button type="submit" className="text-xs font-medium hover:underline" style={{ color: '#1E3A8A' }}>Новий чат</button>
                        </form>
                    </div>
                    <div className="grid gap-1.5">
                        {threads && threads.length > 0 ? (
                            threads.map(([tid, title]) => (
                                <form key={tid} method="post" onSubmit={() => setDrawerOpen(false)}>
                                    <input type="hidden" name="action" value="open" />
                                    <input type="hidden" name="thread_id" value={tid} />
                                    <button type="submit" className={`w-full truncate rounded-md px-2 py-1.5 text-left text-xs transition-colors ${activeId === tid ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`} style={{ color: '#4B5563' }}>{title}</button>
                                </form>
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

            <div className="mx-auto flex h-full max-w-[100%] px-6">
                <aside className="hidden md:block md:w-1/4 md:pr-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-sm font-semibold" style={{ color: '#111827' }}>Останні запити</div>
                            <form method="post">
                                <input type="hidden" name="action" value="clear" />
                                <button type="submit" className="text-xs font-medium hover:underline" style={{ color: '#1E3A8A' }}>Новий чат</button>
                            </form>
                        </div>
                        <div className="grid gap-1.5">
                            {threads && threads.length > 0 ? (
                                threads.map(([tid, title]) => (
                                    <form key={tid} method="post">
                                        <input type="hidden" name="action" value="open" />
                                        <input type="hidden" name="thread_id" value={tid} />
                                        <button type="submit" className={`w-full truncate rounded-md px-2 py-1.5 text-left text-xs transition-colors ${activeId === tid ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`} style={{ color: '#4B5563' }}>{title}</button>
                                    </form>
                                ))
                            ) : (
                                <div className="text-xs" style={{ color: '#9CA3AF' }}>Поки що порожньо</div>
                            )}
                        </div>
                    </div>
                </aside>

                <section className="flex h-full min-h-0 flex-1 flex-col">
                    <div className="mb-2 flex items-center justify-between">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>Юридичний ШІ</h1>
                        <button type="button" className="md:hidden inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm" onClick={() => setDrawerOpen(true)} aria-label="Відкрити меню тредів">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" style={{ color: '#1E3A8A' }}>
                                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span className="text-[13px]" style={{ color: '#1E3A8A' }}>Чати</span>
                        </button>
                    </div>
                    <div ref={bodyRef} id="chatBody" className="mt-2 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 sm:p-6 space-y-4">
                        {history && history.length > 0 ? (
                            history.map((h, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-end">
                                        <div className="max-w-[85%] rounded-2xl bg-[#1E3A8A] px-4 py-3 text-sm text-white whitespace-pre-wrap break-words">{h.user}</div>
                                    </div>
                                    <div className="flex justify-start">
                                        <div className="max-w-[85%] rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-900 break-words md-answer" data-md="1">{h.answer}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm" style={{ color: '#6B7280' }}>
                                Опишіть вашу ситуацію або поставте юридичне питання — і отримаєте відповідь з посиланнями на закони.
                            </div>
                        )}
                    </div>
                    <form id="chatForm" method="post" className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                        <textarea id="chatInput" name="q" rows={1} placeholder="Опишіть питання… (Shift+Enter — новий рядок)" className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)] overflow-y-auto"></textarea>
                        <button id="sendBtn" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1E3A8A] px-5 py-3 text-sm font-medium text-white hover:opacity-95" type="submit">
                            <span>Надіслати</span>
                        </button>
                    </form>
                </section>
            </div>
        </div>
    )
}


