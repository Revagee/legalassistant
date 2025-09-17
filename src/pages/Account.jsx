import { useEffect, useState } from 'react'
import { useAuth } from '../lib/authContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function Account({ avatarUrl = '/static/img/Ellipse 3.png' }) {
    const { user, loading, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const [active, setActive] = useState('home')
    const [avatar, setAvatar] = useState(avatarUrl)
    useEffect(() => {
        try {
            const savedTab = localStorage.getItem('account_active_tab') || 'home'
            setActive(savedTab)
            const savedAvatar = localStorage.getItem('account_avatar_dataurl')
            if (savedAvatar) setAvatar(savedAvatar)
        } catch {
            // ignore localStorage errors
        }
    }, [])

    function switchTab(key) {
        setActive(key)
        try {
            localStorage.setItem('account_active_tab', key)
        } catch {
            // ignore localStorage errors
        }
    }

    function onAvatarChange(ev) {
        const file = ev.target?.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = function () {
            const dataUrl = String(reader.result || '')
            setAvatar(dataUrl)
            try {
                localStorage.setItem('account_avatar_dataurl', dataUrl)
            } catch {
                // ignore localStorage errors
            }
        }
        reader.readAsDataURL(file)
    }

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/auth/login?next=' + encodeURIComponent('/account'))
        }
    }, [loading, isAuthenticated, navigate])

    if (!isAuthenticated) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="text-sm text-gray-600">Завантаження…</div>
            </div>
        )
    }

    const createdAt = user?.created_at ? new Date(user.created_at) : null
    const createdLabel = createdAt ? createdAt.toLocaleDateString() + ' ' + createdAt.toLocaleTimeString() : null

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Акаунт</h1>

            <div className="mt-6 grid gap-6 md:grid-cols-[250px,1fr]">
                <aside className="rounded-xl border p-4 h-max" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                    <nav className="flex flex-col gap-2" aria-label="Меню акаунту">
                        <button
                            type="button"
                            onClick={() => switchTab('home')}
                            className="account-tab inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                            style={{
                                background: active === 'home' ? 'var(--accent)' : 'transparent',
                                color: active === 'home' ? '#ffffff' : 'var(--ink)'
                            }}
                        >
                            <span>Головна</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => switchTab('profile')}
                            className="account-tab inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
                            style={{
                                background: active === 'profile' ? 'var(--accent)' : 'transparent',
                                color: active === 'profile' ? '#ffffff' : 'var(--ink)'
                            }}
                        >
                            <span>Профіль</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => switchTab('subscription')}
                            className="account-tab inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
                            style={{
                                background: active === 'subscription' ? 'var(--accent)' : 'transparent',
                                color: active === 'subscription' ? '#ffffff' : 'var(--ink)'
                            }}
                        >
                            <span>Підписка</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => switchTab('settings')}
                            className="account-tab inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
                            style={{
                                background: active === 'settings' ? 'var(--accent)' : 'transparent',
                                color: active === 'settings' ? '#ffffff' : 'var(--ink)'
                            }}
                        >
                            <span>Налаштування</span>
                        </button>
                        <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                            <button
                                type="button"
                                onClick={async () => { await logout(); navigate('/'); }}
                                className="account-tab inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium w-full transition-all duration-300 hover:bg-red-500"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    color: 'var(--ink)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#ef4444'
                                    e.target.style.color = '#ffffff'
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.2)'
                                    e.target.style.color = 'var(--ink)'
                                }}
                            >
                                <span>Вийти</span>
                            </button>
                        </div>
                    </nav>
                </aside>

                <section className="flex flex-col gap-6">
                    {active === 'home' && (
                        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                            <div className="flex items-center gap-5">
                                <div className="relative group">
                                    <img src={avatar} alt="avatar" className="h-20 w-20 rounded-full border object-cover" style={{ borderColor: 'var(--border)' }} />
                                    <label htmlFor="avatarInput" className="absolute -bottom-1 -right-1 cursor-pointer rounded-full px-2 py-1 text-[11px] font-semibold opacity-90 transition group-hover:opacity-100" style={{ background: 'var(--accent)', color: '#ffffff' }}>Змінити</label>
                                    <input id="avatarInput" type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
                                </div>
                                <div>
                                    <div className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>{user?.name || 'Користувач'}</div>
                                    <div className="text-sm" style={{ color: 'var(--muted)' }}>{user?.email || ''}</div>
                                    {createdLabel && <div className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>Акаунт створено: {createdLabel}</div>}
                                    <button type="button" className="mt-3 inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors" style={{ background: 'var(--accent)', color: '#ffffff' }}>Редагувати профіль</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {active === 'profile' && (
                        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                            <div className="grid gap-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold" style={{ color: 'var(--ink)' }}>Ім'я</span>
                                    <span style={{ color: 'var(--ink)' }}>{user?.name || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold" style={{ color: 'var(--ink)' }}>Email</span>
                                    <span style={{ color: 'var(--ink)' }}>{user?.email || ''}</span>
                                </div>
                                {createdLabel && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold" style={{ color: 'var(--ink)' }}>Створено</span>
                                        <span style={{ color: 'var(--ink)' }}>{createdLabel}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {active === 'subscription' && (
                        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                            <div className="text-lg font-semibold mb-4" style={{ color: 'var(--ink)' }}>Управління підпискою</div>
                            {user?.subscription ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'color-mix(in oklab, var(--accent) 10%, transparent)' }}>
                                        <div>
                                            <div className="font-semibold" style={{ color: 'var(--ink)' }}>Активна підписка</div>
                                            <div className="text-sm" style={{ color: 'var(--muted)' }}>Преміум план</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Активна</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Переваги:</div>
                                        <ul className="text-sm space-y-1" style={{ color: 'var(--muted)' }}>
                                            <li>• Необмежені токени для Юридичного ШІ</li>
                                            <li>• Безлімітні генерації документів</li>
                                            <li>• Розширений правовий пошук</li>
                                            <li>• Історія чатів і закладки</li>
                                        </ul>
                                    </div>
                                    <button className="mt-4 px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ background: '#ef4444', color: '#ffffff' }}>
                                        Скасувати підписку
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg" style={{ background: 'color-mix(in oklab, var(--muted) 5%, transparent)' }}>
                                        <div className="font-semibold mb-2" style={{ color: 'var(--ink)' }}>Безкоштовний план</div>
                                        <div className="text-sm" style={{ color: 'var(--muted)' }}>Ви використовуєте базову версію з обмеженими можливостями.</div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/subscription')}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                                        style={{ background: 'var(--accent)', color: '#ffffff' }}
                                    >
                                        Оформити підписку
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {active === 'settings' && (
                        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                            <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Налаштування</div>
                            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Скоро тут з'являться персональні налаштування.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}


