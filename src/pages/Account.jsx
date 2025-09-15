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
        } catch (_) { }
    }, [])

    function switchTab(key) {
        setActive(key)
        try { localStorage.setItem('account_active_tab', key) } catch (_) { }
    }

    function onAvatarChange(ev) {
        const file = ev.target?.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = function () {
            const dataUrl = String(reader.result || '')
            setAvatar(dataUrl)
            try { localStorage.setItem('account_avatar_dataurl', dataUrl) } catch (_) { }
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
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>Акаунт</h1>

            <div className="mt-6 grid gap-6 md:grid-cols-[220px,1fr]">
                <aside className="rounded-xl border border-gray-200 bg-white p-4 h-max">
                    <nav className="flex flex-col gap-2" aria-label="Меню акаунту">
                        <button type="button" onClick={() => switchTab('home')} className={`account-tab inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${active === 'home' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <span>Головна</span>
                        </button>
                        <button type="button" onClick={() => switchTab('profile')} className={`account-tab inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${active === 'profile' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <span>Профіль</span>
                        </button>
                        <button type="button" onClick={() => switchTab('settings')} className={`account-tab inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${active === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <span>Налаштування</span>
                        </button>
                        <button type="button" onClick={async () => { await logout(); navigate('/'); }} className={`account-tab inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50`}>
                            <span>Вийти</span>
                        </button>
                    </nav>
                </aside>

                <section className="flex flex-col gap-6">
                    {active === 'home' && (
                        <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <div className="flex items-center gap-5">
                                <div className="relative group">
                                    <img src={avatar} alt="avatar" className="h-20 w-20 rounded-full border border-gray-200 object-cover" />
                                    <label htmlFor="avatarInput" className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white opacity-90 transition group-hover:opacity-100">Змінити</label>
                                    <input id="avatarInput" type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-gray-900">{user?.name || 'Користувач'}</div>
                                    <div className="text-sm text-gray-600">{user?.email || ''}</div>
                                    {createdLabel && <div className="mt-1 text-xs text-gray-500">Акаунт створено: {createdLabel}</div>}
                                    <button type="button" className="mt-3 inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">Редагувати профіль</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {active === 'profile' && (
                        <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <div className="grid gap-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900">Ім'я</span>
                                    <span className="text-gray-900">{user?.name || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900">Email</span>
                                    <span className="text-gray-900">{user?.email || ''}</span>
                                </div>
                                {createdLabel && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-gray-900">Створено</span>
                                        <span className="text-gray-900">{createdLabel}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {active === 'settings' && (
                        <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <div className="text-sm font-semibold text-gray-900">Налаштування</div>
                            <p className="mt-2 text-sm text-gray-600">Скоро тут з’являться персональні налаштування.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}


