import { useMemo, useRef, useState } from 'react'
import { assetPath } from './utils.js'
import { Logo, ClockIcon, ShieldIcon, BadgeIcon } from './icons.jsx'
import { useAuth } from '../../lib/authContext.jsx'

export function PrimaryButton({ children, onClick }) {
    return (
        <button onClick={onClick} className="group inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium shadow-sm transition-all" style={{ background: 'var(--accentBg)', color: 'var(--btnText)' }}>
            <span className="transition-transform duration-150">{children}</span>
            <svg className="h-4 w-4 opacity-90 transition-transform duration-150 group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M12.293 3.293a1 1 0 011.414 0l4.999 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L15.586 11H2a1 1 0 110-2h13.586l-3.293-3.293a1 1 0 010-1.414z" />
            </svg>
        </button>
    )
}

export function AdvCard({ icon, title, text }) {
    return (
        <div className="theme-card rounded-lg border p-6 h-full flex flex-col">
            <div className="mb-4">{icon}</div>
            <div className="text-base font-semibold" style={{ color: 'var(--text)' }}>{title}</div>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>{text}</p>
        </div>
    )
}

export function FeatureCard({ href, img, title, text }) {
    return (
        <a href={href} className="theme-card group flex h-full flex-col rounded-2xl border p-6 transition-transform hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-4">
                <span className="theme-card inline-flex h-12 w-12 items-center justify-center rounded-lg border overflow-hidden shadow-[inset_0_0_0_1px_rgba(30,58,138,0.06)]">
                    <img src={img} alt="" className="h-full w-full object-contain p-1.5" />
                </span>
                <span className="text-base font-semibold" style={{ color: 'var(--text)' }}>{title}</span>
            </div>
            <p className="mt-3 text-sm leading-6" style={{ color: 'var(--muted)' }}>{text}</p>
            <span className="mt-4 inline-flex items-center text-sm" style={{ color: 'var(--accent)' }}>
                Перейти
                <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M12.293 3.293a1 1 0 011.414 0l4.999 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L15.586 11H2a1 1 0 110-2h13.586l-3.293-3.293a1 1 0 010-1.414z" />
                </svg>
            </span>
        </a>
    )
}

export function FeaturesCarousel() {
    const items = useMemo(() => ([
        { href: '/ai', title: 'Юридичний ШІ', text: 'Відповіді з посиланнями на закон. Пошук по базі та РАГ.', img: assetPath('lawai.jpeg') },
        { href: '/templates', title: 'Генератор документів', text: 'Позови, заяви, договори на основі форм.', img: assetPath('document generation.jpeg') },
        { href: '/calculators', title: 'Калькулятори', text: 'Судовий збір, 3% річних, пеня, ЄСВ.', img: assetPath('calculator.jpeg') },
        { href: '/database', title: 'Законодавча база', text: 'Пошук по статтях і ключових словах.', img: assetPath('legaldatabase.jpeg') },
        { href: '/dictionary', title: 'Юридичний словник', text: 'Визначення термінів простими словами.', img: assetPath('dictionary.jpeg') },
        { href: '/trainer', title: 'Тренажер', text: 'Квіз на 10 питань для самотесту.', img: assetPath('trainer.jpeg') },
        { href: '/generated', title: 'Згенеровані документи', text: 'Останні файли, створені у веб‑боті.', img: assetPath('generated documents.jpeg') },
    ]), [])

    const listRef = useRef(null)
    const scrollByAmount = (dir) => {
        const el = listRef.current
        if (!el) return
        const delta = Math.round(el.clientWidth * 0.9) * (dir === 'next' ? 1 : -1)
        el.scrollBy({ left: delta, behavior: 'smooth' })
    }

    return (
        <div className="theme-card rounded-2xl border p-4 sm:p-6 sr-reveal">
            <div className="relative">
                <div className="flex items-center justify-center gap-3">
                    <button onClick={() => scrollByAmount('prev')} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50" aria-label="Назад">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" /></svg>
                    </button>
                    <div ref={listRef} className="flex max-w-6xl overflow-x-auto scroll-smooth snap-x snap-mandatory gap-5 px-1 py-2 mx-auto sr-stagger" style={{ scrollbarWidth: 'none' }}>
                        {items.map((it, idx) => (
                            <div key={idx} className="snap-start min-w-[300px] sm:min-w-[420px] md:min-w-[520px]">
                                <FeatureCard href={it.href} img={it.img} title={it.title} text={it.text} />
                            </div>
                        ))}
                    </div>
                    <button onClick={() => scrollByAmount('next')} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50" aria-label="Вперед">
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L11.586 11 7.293 6.707a1 1 0 010-1.414z" /></svg>
                    </button>
                </div>
                <div className="mt-3 text-center text-xs" style={{ color: '#4B5563' }}>Прокручуйте або використовуйте стрілки</div>
            </div>
        </div>
    )
}

export function Header() {
    const { isAuthenticated } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)

    const navItems = [
        { href: '/ai', label: 'ШІ' },
        { href: '/templates', label: 'Генератор' },
        { href: '/calculators', label: 'Калькулятори' },
        { href: '/database', label: 'База' },
        { href: '/dictionary', label: 'Словник' },
        { href: '/trainer', label: 'Тренажер' },
        { href: '/generated', label: 'Файли' },
    ]

    const closeMenu = () => setMenuOpen(false)

    return (
        <header className="border-b border-gray-200" data-menu-open={menuOpen ? 'true' : 'false'}>
            <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                <a href="/" className="flex items-center gap-2" onClick={closeMenu} aria-label="На головну">
                    <Logo color="#1E3A8A" />
                    <span className="text-lg sm:text-xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>Юридичний помічник</span>
                </a>

                <nav className="hidden md:flex items-center gap-5">
                    {navItems.map((item) => (
                        <a key={item.href} href={item.href} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">{item.label}</a>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <button id="themeBtn" className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all" style={{ background: 'var(--cardBg)', borderColor: 'var(--cardBorder)', color: 'var(--text)' }} type="button" aria-label="Переключити тему">
                        <span id="themeIcon" className="text-base">🌙</span>
                        <span id="themeLabel" className="font-semibold">Dark</span>
                    </button>
                    <div className="hidden md:block">
                        {isAuthenticated ? (
                            <a href="/account" className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors" aria-label="Акаунт">Акаунт</a>
                        ) : (
                            <a href="/auth/login" className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors" aria-label="Увійти">Увійти</a>
                        )}
                    </div>
                    <button type="button" className="md:hidden inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-700 hover:bg-gray-50" aria-label="Меню" aria-expanded={menuOpen ? 'true' : 'false'} onClick={() => setMenuOpen((v) => !v)}>
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                            {menuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                            ) : (
                                <>
                                    <path d="M4 7h16" strokeLinecap="round" />
                                    <path d="M4 12h16" strokeLinecap="round" />
                                    <path d="M4 17h16" strokeLinecap="round" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            <div className="mobile-nav md:hidden border-t border-gray-200">
                <div className="mx-auto max-w-7xl px-6 py-3 grid gap-2">
                    {navItems.map((item) => (
                        <a key={item.href} href={item.href} onClick={closeMenu} className="rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100">{item.label}</a>
                    ))}
                    <div className="pt-1">
                        {isAuthenticated ? (
                            <a href="/account" onClick={closeMenu} className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100">Акаунт</a>
                        ) : (
                            <a href="/auth/login" onClick={closeMenu} className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100">Увійти</a>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export function Footer() {
    return (
        <footer className="mt-20 border-t border-gray-200">
            <div className="mx-auto max-w-7xl px-6 py-10 grid gap-3 sm:flex sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600">© {new Date().getFullYear()} Юридичний помічник</div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <a href="mailto:legal@example.com" className="text-gray-600 hover:text-gray-800 transition-colors">legal@example.com</a>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <a href="#privacy" className="text-gray-600 hover:text-gray-800 transition-colors">Політика конфіденційності</a>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <a href="#contacts" className="text-gray-600 hover:text-gray-800 transition-colors">Контакти</a>
                </div>
            </div>
        </footer>
    )
}

export function HeroStacked({ onStart }) {
    return (
        <div className="py-12 sm:py-16">
            <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Юридичний помічник</h1>
                <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--muted)' }}>Швидкі та надійні рішення для вашого бізнесу та життя</p>
                <div className="mt-8 flex items-center justify-center gap-3">
                    <PrimaryButton onClick={onStart}>Почати чат</PrimaryButton>
                </div>
            </div>
        </div>
    )
}

export function HeroInline({ onStart }) {
    return (
        <div className="py-12 sm:py-16">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="max-w-3xl">
                        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Юридичний помічник</h1>
                        <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--muted)' }}>Швидкі та надійні рішення для вашого бізнесу та життя</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                        <PrimaryButton onClick={onStart}>Почати чат</PrimaryButton>
                    </div>
                </div>
            </div>
        </div>
    )
}


