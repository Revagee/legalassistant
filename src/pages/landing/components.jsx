import { useMemo, useRef, useState, useEffect } from 'react'
import { assetPath } from './utils.js'
import { Sun, Moon, FileText, Users, BookOpen, GraduationCap, ArrowRight } from 'lucide-react'
import { useAuth } from '../../lib/authContext.jsx'
import { merchant } from '../../lib/merchant.js'
import Logo from '../../assets/logo.jsx'

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
        <a href={href} className="feature-item group flex h-full flex-col justify-between transition-all hover:-translate-y-2">
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden" style={{
                        background: 'linear-gradient(135deg, color-mix(in oklab, var(--accent) 15%, transparent), color-mix(in oklab, #22d3ee 10%, transparent))',
                        border: '1px solid color-mix(in oklab, var(--accent) 20%, transparent)'
                    }}>
                        <img src={img} alt="" className="w-full h-full object-cover p-2" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
                        <div className="w-8 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, var(--accent), #22d3ee)' }}></div>
                    </div>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted)' }}>{text}</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200/20">
                <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>Дізнатися більше</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110" style={{
                    background: 'linear-gradient(135deg, var(--accent), #22d3ee)'
                }}>
                    <svg className="w-4 h-4 text-white transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </a>
    )
}

export function LiquidGlassGrid({ onCardHover, onCardLeave, activeCard, defaultCard }) {
    const gridRef = useRef(null)
    const activeIdRef = useRef(null)

    const featuredItems = useMemo(() => ([
        {
            id: 'templates',
            href: '/templates',
            title: 'Генератор документів',
            shortText: 'Позови, заяви, договори на основі форм.',
            fullText: 'Автоматизована генерація юридичних документів з використанням готових шаблонів. Створюйте позови, заяви, договори та інші документи швидко та професійно.',
            icon: FileText,
            features: ['Готові шаблони', 'Автозаповнення', 'Експорт у DOCX']
        },
        {
            id: 'documents',
            href: '/documents',
            title: 'Готові документи',
            shortText: 'Каталог з готовими зразками для швидкого використання.',
            fullText: 'Великий каталог готових юридичних документів для різних сфер права. Завантажуйте зразки, редагуйте під ваші потреби та використовуйте у практиці.',
            icon: Users,
            features: ['1000+ зразків', 'Регулярне оновлення', 'Різні галузі права']
        },
        {
            id: 'database',
            href: '/database',
            title: 'Законодавча база',
            shortText: 'Пошук по статтях і ключових словах.',
            fullText: 'Повна база українського законодавства з потужним пошуком. Знаходьте потрібні норми права за ключовими словами, номерами статей або тематикою.',
            icon: BookOpen,
            features: ['Актуальні кодекси', 'Швидкий пошук', 'Закладки та нотатки']
        },
        {
            id: 'trainer',
            href: '/trainer',
            title: 'Тренажери',
            shortText: 'Квіз на 10 питань для самотесту та навчання.',
            fullText: 'Інтерактивні тренажери для перевірки знань з різних галузей українського права. Тестуйте себе, навчайтеся та підвищуйте кваліфікацію.',
            icon: GraduationCap,
            features: ['Різні галузі права', '10+ питань', 'Детальні пояснення']
        }
    ]), [])

    // Вспомогательные функции для состояний карточки
    const applyNeutralState = (item) => {
        if (!item) return
        item.style.setProperty('--rotate-x', '0deg')
        item.style.setProperty('--rotate-y', '0deg')
        item.style.setProperty('--mouse-x', '50%')
        item.style.setProperty('--mouse-y', '50%')
        item.style.setProperty('--glow-x', '50%')
        item.style.setProperty('--glow-offset', '0px')
    }

    // "Замороженное" состояние как при наведении в правый верхний угол
    const applyFrozenActiveState = (item) => {
        if (!item) return
        item.style.setProperty('--rotate-x', '-8deg')
        item.style.setProperty('--rotate-y', '-8deg')
        item.style.setProperty('--mouse-x', '90%')
        item.style.setProperty('--mouse-y', '10%')
        item.style.setProperty('--glow-x', '90%')
        item.style.setProperty('--glow-offset', '20px')
    }

    useEffect(() => {
        const items = gridRef.current?.querySelectorAll('.liquid-glass-item')
        if (!items) return

        const handleMouseMove = (e, item, itemData) => {
            const rect = item.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            const centerX = rect.width / 2
            const centerY = rect.height / 2

            const rotateX = (y - centerY) / 10
            const rotateY = (centerX - x) / 10

            const mouseX = (x / rect.width) * 100
            const mouseY = (y / rect.height) * 100

            item.style.setProperty('--rotate-x', `${rotateX}deg`)
            item.style.setProperty('--rotate-y', `${rotateY}deg`)
            item.style.setProperty('--mouse-x', `${mouseX}%`)
            item.style.setProperty('--mouse-y', `${mouseY}%`)
            item.style.setProperty('--glow-x', `${mouseX}%`)
            item.style.setProperty('--glow-offset', `${(mouseX - 50) * 0.5}px`)

            onCardHover?.(itemData)
        }

        const handleMouseLeave = (item) => {
            // Если карточка активная — возвращаем её в "замороженное" активное состояние
            if (item?.dataset?.cardId && item.dataset.cardId === activeIdRef.current) {
                applyFrozenActiveState(item)
            } else {
                applyNeutralState(item)
            }

            onCardLeave?.()
        }

        const handlers = featuredItems.map((itemData) => {
            const handleItemMouseMove = (e) => handleMouseMove(e, e.currentTarget, itemData)
            const handleItemMouseLeave = (e) => handleMouseLeave(e.currentTarget)

            return { handleItemMouseMove, handleItemMouseLeave }
        })

        items.forEach((item, index) => {
            item.addEventListener('mousemove', handlers[index].handleItemMouseMove)
            item.addEventListener('mouseleave', handlers[index].handleItemMouseLeave)
        })

        return () => {
            items.forEach((item, index) => {
                item.removeEventListener('mousemove', handlers[index].handleItemMouseMove)
                item.removeEventListener('mouseleave', handlers[index].handleItemMouseLeave)
            })
        }
    }, [featuredItems, onCardHover, onCardLeave])

    // Отслеживаем смену активной карточки и обновляем визуальное состояние
    useEffect(() => {
        const combinedActiveId = activeCard?.id || defaultCard?.id || null
        activeIdRef.current = combinedActiveId

        const items = gridRef.current?.querySelectorAll('.liquid-glass-item')
        if (!items) return

        items.forEach((item) => {
            if (combinedActiveId && item.dataset.cardId === combinedActiveId) {
                // Устанавливаем "замороженное" активное состояние, если на карточку не навели мышкой
                applyFrozenActiveState(item)
            } else {
                // Все прочие карточки — в нейтральное
                applyNeutralState(item)
            }
        })
    }, [activeCard, defaultCard])

    return (
        <div className="liquid-glass-grid" ref={gridRef}>
            {featuredItems.map((item, index) => {
                const IconComponent = item.icon
                const isActive = (activeCard?.id || defaultCard?.id) === item.id

                return (
                    <a
                        key={index}
                        href={item.href}
                        className={`liquid-glass-item ${isActive ? 'active' : ''}`}
                        data-card-id={item.id}
                    >
                        <div className="glass-distortion"></div>
                        <div className="glass-reflection"></div>
                        <div className="glass-chromatic"></div>
                        <div className="glass-content">
                            <div className="glass-icon">
                                <IconComponent size={20} />
                            </div>
                            <div className="glass-title">{item.title}</div>
                            <div className="glass-description">{item.shortText}</div>
                        </div>
                    </a>
                )
            })}
        </div>
    )
}

export function InteractiveContent({ activeCard, defaultCard }) {
    const displayCard = activeCard || defaultCard

    if (!displayCard) return null

    return (
        <div key={displayCard.id} className="max-w-lg text-center lg:text-left interactive-content">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl" style={{
                    background: 'linear-gradient(135deg, color-mix(in oklab, var(--accent) 20%, transparent), color-mix(in oklab, #22d3ee 15%, transparent))'
                }}>
                    <displayCard.icon size={24} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                        {displayCard.title}
                    </h2>
                </div>
            </div>

            <p className="text-base sm:text-lg leading-relaxed mb-6" style={{ color: 'var(--muted)' }}>
                {displayCard.fullText}
            </p>

            <div className="space-y-3 mb-8">
                {displayCard.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 justify-center lg:justify-start">
                        <div className="w-2 h-2 rounded-full" style={{
                            background: `linear-gradient(90deg, var(--accent), #22d3ee)`
                        }}></div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                            {feature}
                        </span>
                    </div>
                ))}
            </div>

            <a
                href={displayCard.href}
                className="inline-flex items-center gap-2 px-6 py-3 mb-4 rounded-lg font-semibold transition-all hover:scale-105"
                style={{
                    background: 'var(--accent)',
                    color: 'white'
                }}
            >
                <span>Перейти до {displayCard.title.toLowerCase()}</span>
                <ArrowRight size={16} />
            </a>
        </div>
    )
}

export function FeaturesCarousel() {
    const items = useMemo(() => ([
        { href: '/ai', title: 'Юридичний ШІ', text: 'Відповіді з посиланнями на закон. Пошук по базі та РАГ.', img: assetPath('lawai.jpeg') },
        { href: '/templates', title: 'Генератор документів', text: 'Позови, заяви, договори на основі форм.', img: assetPath('document generation.jpeg') },
        { href: '/documents', title: 'Документи', text: 'Каталог з готовими зразками: перегляд і швидке завантаження.', img: assetPath('generated documents.jpeg') },
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
        <div className="relative">
            <div className="flex items-center justify-center gap-4 mb-6">
                <button
                    onClick={() => scrollByAmount('prev')}
                    className="w-12 h-12 rounded-2xl border border-gray-200/40 backdrop-filter backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg flex items-center justify-center"
                    style={{
                        background: 'color-mix(in oklab, var(--cardBg) 80%, transparent)',
                        color: 'var(--text)'
                    }}
                    aria-label="Назад"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div ref={listRef} className="flex max-w-5xl overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 px-2 py-4 mx-auto sr-stagger" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {items.map((it, idx) => (
                        <div key={idx} className="snap-start min-w-[320px] sm:min-w-[380px] md:min-w-[420px]">
                            <FeatureCard href={it.href} img={it.img} title={it.title} text={it.text} />
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => scrollByAmount('next')}
                    className="w-12 h-12 rounded-2xl border border-gray-200/40 backdrop-filter backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg flex items-center justify-center"
                    style={{
                        background: 'color-mix(in oklab, var(--cardBg) 80%, transparent)',
                        color: 'var(--text)'
                    }}
                    aria-label="Вперед"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="flex justify-center">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                    background: 'color-mix(in oklab, var(--cardBg) 60%, transparent)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid color-mix(in oklab, var(--cardBorder) 40%, transparent)'
                }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }}></div>
                    <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                        Прокручуйте або використовуйте стрілки
                    </span>
                </div>
            </div>
        </div>
    )
}

export function Header() {
    const { isAuthenticated, user } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const [documentsDropdownOpen, setDocumentsDropdownOpen] = useState(false)
    const [studentsDropdownOpen, setStudentsDropdownOpen] = useState(false)
    const docsTimerRef = useRef(null)
    const studentsTimerRef = useRef(null)

    const openDropdown = (label) => {
        if (label === 'Документи') {
            if (docsTimerRef.current) { clearTimeout(docsTimerRef.current) }
            setDocumentsDropdownOpen(true)
        }
        if (label === 'Для студентів') {
            if (studentsTimerRef.current) { clearTimeout(studentsTimerRef.current) }
            setStudentsDropdownOpen(true)
        }
    }

    const scheduleCloseDropdown = (label) => {
        if (label === 'Документи') {
            if (docsTimerRef.current) { clearTimeout(docsTimerRef.current) }
            docsTimerRef.current = setTimeout(() => setDocumentsDropdownOpen(false), 160)
        }
        if (label === 'Для студентів') {
            if (studentsTimerRef.current) { clearTimeout(studentsTimerRef.current) }
            studentsTimerRef.current = setTimeout(() => setStudentsDropdownOpen(false), 160)
        }
    }

    const baseNavItems = [
        { href: '/ai', label: 'ШІ' },
        { href: '/database', label: 'Законодавство' },
        {
            label: 'Документи',
            dropdown: true,
            items: [
                { href: '/documents', label: 'Шаблони' },
                { href: '/templates', label: 'Генератори' },
                { href: '/generated', label: 'Мої файли' },
            ]
        },
        {
            label: 'Для студентів',
            dropdown: true,
            items: [
                { href: '/dictionary', label: 'Словник' },
                { href: '/trainer', label: 'Тренажери' },
            ]
        },
    ]
    const shouldShowPlus = !user || user?.plan_id === 0
    const navItems = shouldShowPlus
        ? [...baseNavItems, { href: '/subscription', label: 'Помічник+', special: true }]
        : baseNavItems

    const closeMenu = () => {
        setMenuOpen(false)
        setDocumentsDropdownOpen(false)
        setStudentsDropdownOpen(false)
    }

    return (
        <header className="border-b border-gray-200" data-menu-open={menuOpen ? 'true' : 'false'}>
            <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                <a href="/" className="flex items-center gap-2" onClick={closeMenu} aria-label="На головну">
                    <Logo className="h-8 w-8" color="var(--accent)" />
                    <span className="text-lg sm:text-xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Юридичний помічник</span>
                </a>

                <nav className="hidden md:flex items-center gap-5">
                    {navItems.map((item, index) => (
                        item.special ? (
                            <a
                                key={item.href}
                                href={item.href}
                                className="text-sm font-semibold rounded-full px-3 py-1.5 transition-all"
                                style={{ background: 'var(--accentBg, var(--gold))', color: 'var(--btnText, var(--accent-ink))', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.15)' }}
                            >
                                {item.label}
                            </a>
                        ) : item.dropdown ? (
                            <div
                                key={index}
                                className="relative"
                                onMouseEnter={() => openDropdown(item.label)}
                                onMouseLeave={() => scheduleCloseDropdown(item.label)}
                            >
                                <button
                                    type="button"
                                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1"
                                >
                                    {item.label}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {((item.label === 'Документи' && documentsDropdownOpen) || (item.label === 'Для студентів' && studentsDropdownOpen)) && (
                                    <div
                                        className="absolute top-full left-0 mt-0 py-2 w-40 rounded-md shadow-lg z-50 border"
                                        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
                                    >
                                        {item.items.map((subItem) => (
                                            <a
                                                key={subItem.href}
                                                href={subItem.href}
                                                className="popup-item-desktop block px-4 py-2 text-sm text-gray-700 transition-colors hover:opacity-90 color-var(--ink)"
                                                style={{ color: 'var(--ink)' }}
                                            >
                                                {subItem.label}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <a key={item.href} href={item.href} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">{item.label}</a>
                        )
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <button id="themeBtn" className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all" style={{ background: 'var(--cardBg)', borderColor: 'var(--cardBorder)', color: 'var(--text)' }} type="button" aria-label="Переключити тему">
                        <span id="themeIcon" className="text-base" aria-hidden="true" data-theme-icon="light">
                            <span className="sun inline-flex pt-1"><Moon size={16} /></span>
                            <span className="moon hidden inline-flex pt-1"><Sun size={16} /></span>
                        </span>
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
                    {navItems.map((item, index) => (
                        item.special ? (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={closeMenu}
                                className="rounded-md text-center px-3 py-2 text-sm font-semibold"
                                style={{ background: 'var(--accentBg, var(--gold))', color: 'var(--btnText, var(--accent-ink))' }}
                            >
                                {item.label}
                            </a>
                        ) : item.dropdown ? (
                            <div key={index} className="space-y-1">
                                <button
                                    type="button"
                                    className="w-full text-left rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center justify-between"
                                    onClick={() => {
                                        if (item.label === 'Документи') setDocumentsDropdownOpen(!documentsDropdownOpen)
                                        if (item.label === 'Для студентів') setStudentsDropdownOpen(!studentsDropdownOpen)
                                    }}
                                >
                                    {item.label}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {((item.label === 'Документи' && documentsDropdownOpen) || (item.label === 'Для студентів' && studentsDropdownOpen)) && (
                                    <div className="ml-4 space-y-1">
                                        {item.items.map((subItem) => (
                                            <a
                                                key={subItem.href}
                                                href={subItem.href}
                                                onClick={closeMenu}
                                                className="block rounded-md px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                                            >
                                                {subItem.label}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <a key={item.href} href={item.href} onClick={closeMenu} className="rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100">{item.label}</a>
                        )
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
        <footer className="relative overflow-hidden" style={{
            background: `linear-gradient(180deg, 
                color-mix(in oklab, var(--cardBg) 95%, var(--cardBorder)) 0%, 
                color-mix(in oklab, var(--cardBg) 98%, var(--accent)) 100%)`,
            borderTop: '1px solid var(--cardBorder)'
        }}>
            <div className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-4">
                {/* Logo and description */}
                <div className="text-left mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Logo className="h-8 w-8" color="var(--accent)" />
                        <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{merchant.shopName}</h3>
                    </div>
                    <p className="max-w-lg" style={{ color: 'var(--muted)' }}>
                        Сучасна платформа для роботи з юридичними питаннями в Україні
                    </p>
                </div>

                {/* Links grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>Контакти</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" style={{ color: 'var(--muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href={`mailto:${merchant.email}`} className="text-sm hover:underline transition-colors" style={{ color: 'var(--muted)' }}>
                                    {merchant.email}
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" style={{ color: 'var(--muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href={`tel:${merchant.phone.replace(/\s/g, '')}`} className="text-sm hover:underline transition-colors" style={{ color: 'var(--muted)' }}>
                                    {merchant.phone}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Information */}
                    <div>
                        <h4 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>Інформація</h4>
                        <ul className="space-y-2">
                            <li><a href="/privacy" className="text-sm hover:underline transition-colors" style={{ color: 'var(--muted)' }}>Політика конфіденційності</a></li>
                            <li><a href="/terms" className="text-sm hover:underline transition-colors" style={{ color: 'var(--muted)' }}>Умови користування</a></li>
                            <li><a href="/pricing" className="text-sm hover:underline transition-colors" style={{ color: 'var(--muted)' }}>Ціни</a></li>
                            <li><a href="/refunds" className="text-sm hover:underline transition-colors" style={{ color: 'var(--muted)' }}>Повернення коштів</a></li>
                            <li><a href="/delivery" className="text-sm hover:underline transition-colors" style={{ color: 'var(--muted)' }}>Доставка та отримання</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>Компанія</h4>
                        <ul className="space-y-2">
                            <li><a href="/contacts" className="text-sm hover:underline transition-colors" style={{ color: 'var(--muted)' }}>Контакти</a></li>
                            <li><a href="/merchant" className="text-sm hover:underline transition-colors" style={{ color: 'var(--muted)' }}>Про власника</a></li>
                        </ul>
                    </div>

                    {/* Address */}
                    <div>
                        <h4 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>Адреса</h4>
                        <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 mt-0.5" style={{ color: 'var(--muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm" style={{ color: 'var(--muted)' }}>{merchant.address}</span>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex align-center" style={{ borderColor: 'var(--cardBorder)' }}>
                    <p className="text-sm my-auto" style={{ color: 'var(--muted)' }}>
                        © {new Date().getFullYear()} Всі права захищені
                    </p>
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

// Данные для демонстрации чата
const chatDemoData = [
    {
        question: "Як правильно розірвати трудовий договір?",
        answer: "Трудовий договір можна розірвати за згодою сторін, за ініціативою працівника або роботодавця. Працівник повинен подати заяву за 2 тижні до звільнення. Роботодавець зобов'язаний виплатити всі заборгованості з зарплати та компенсацію за невикористану відпустку."
    },
    {
        question: "Скільки днів відпустки мені належить?",
        answer: "Мінімальна тривалість щорічної основної відпустки становить 24 календарні дні. Деякі категорії працівників мають право на додаткову відпустку. Відпустка надається після відпрацювання 11 місяців, але за згодою сторін може бути надана раніше."
    },
    {
        question: "Чи можу я отримати аліменти на дитину?",
        answer: "Так, батьки зобов'язані утримувати своїх неповнолітніх дітей. Розмір аліментів становить: на одну дитину - 1/4, на двох дітей - 1/3, на трьох і більше - 1/2 доходу платника. Аліменти можна стягнути через суд або укласти добровільну угоду."
    },
    {
        question: "Як оформити спадщину після смерті родича?",
        answer: "Для оформлення спадщини потрібно звернутися до нотаріуса протягом 6 місяців з дня смерті спадкодавця. Необхідно подати заяву про прийняття спадщини та документи, що підтверджують родинні зв'язки. Спадщина приймається цілком без права відмови від частини."
    },
    {
        question: "Скільки коштує подача позову до суду?",
        answer: "Судовий збір залежить від ціни позову. Мінімальний розмір - 0,4 розміру прожиткового мінімуму для працездатної особи. Максимальний - 5% від ціни позову, але не більше 350 розмірів прожиткового мінімуму. У деяких справах передбачені пільги або звільнення від сплати."
    },
    {
        question: "Чи можна повернути товар неналежної якості?",
        answer: "Так, покупець має право повернути товар неналежної якості протягом гарантійного строку. Якщо гарантійний строк не встановлений - протягом 2 років. Продавець зобов'язаний замінити товар, усунути недоліки або повернути гроші на вибір покупця."
    },
    {
        question: "Як захистити авторські права на твір?",
        answer: "Авторське право виникає автоматично з моменту створення твору. Для додаткового захисту можна зареєструвати твір у відповідних органах, використовувати знак копірайту ©. У разі порушення прав можна звернутися до суду за захистом та відшкодуванням збитків."
    },
    {
        question: "Яка відповідальність за порушення ПДР?",
        answer: "За порушення ПДР передбачена адміністративна або кримінальна відповідальність. Штрафи варіюються від кількох сотень до кількох тисяч гривень. За повторні порушення можливе позбавлення права керування. При ДТП з потерпілими настає кримінальна відповідальність."
    },
    {
        question: "Як розділити майно при розлученні?",
        answer: "Майно подружжя ділиться порівну, якщо інше не передбачено шлюбним договором. Особисте майно кожного з подружжя розділу не підлягає. Борги також діляться пропорційно отриманому майну. Суд може відступити від принципу рівності в інтересах дітей."
    },
    {
        question: "Чи можна оскаржити рішення суду?",
        answer: "Так, рішення суду першої інстанції можна оскаржити в апеляційному порядку протягом 30 днів. Рішення апеляційного суду - в касаційному порядку протягом 60 днів. Також можливий перегляд справи за нововиявленими обставинами протягом 6 місяців."
    }
];

export function HeroFullscreen({ onStart }) {
    const [currentChatIndex, setCurrentChatIndex] = useState(0)
    const [showQuestion, setShowQuestion] = useState(false)
    const [showAnswer, setShowAnswer] = useState(false)
    const [typedAnswer, setTypedAnswer] = useState('')
    const [isTyping, setIsTyping] = useState(false)

    // Анимация чата
    useEffect(() => {
        const startChatAnimation = () => {
            // Сброс состояния
            setShowQuestion(false)
            setShowAnswer(false)
            setTypedAnswer('')
            setIsTyping(false)

            // Показать вопрос пользователя с анимацией снизу через 1 секунду
            setTimeout(() => {
                setShowQuestion(true)
            }, 1000)

            // Начать показ ответа через 500мс после появления вопроса (1500мс от начала)
            setTimeout(() => {
                setShowAnswer(true)
                setIsTyping(true)

                // Анимация печати ответа
                const answer = chatDemoData[currentChatIndex].answer
                let currentChar = 0

                const typeInterval = setInterval(() => {
                    if (currentChar < answer.length) {
                        setTypedAnswer(answer.slice(0, currentChar + 1))
                        currentChar++
                    } else {
                        setIsTyping(false)
                        clearInterval(typeInterval)

                        // Ждем 3 секунды, затем переключаем на следующий вопрос
                        setTimeout(() => {
                            setCurrentChatIndex((prev) => (prev + 1) % chatDemoData.length)
                        }, 3000)
                    }
                }, 30) // Скорость печати
            }, 1500) // 1000мс для вопроса + 500мс задержка
        }

        startChatAnimation()
    }, [currentChatIndex])


    return (
        <div className="hero-fullscreen">
            <div className="hero-container">
                {/* Левая часть с контентом */}
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            Юридичний помічник
                        </h1>
                        <p className="hero-description">
                            Швидкі та надійні рішення для вашого бізнесу та життя.
                            Штучний інтелект з глибоким знанням українського законодавства.
                        </p>
                        <div className="hero-actions">
                            <PrimaryButton onClick={onStart}>Почати чат</PrimaryButton>
                        </div>
                    </div>
                </div>

                {/* Правая часть с демо чатом */}
                <div className="hero-chat-container">
                    <div className="hero-chat-wrapper">
                        {/* Заголовок чата */}
                        <div className="chat-header">
                            <div className="chat-header-content">
                                <div className="chat-title">Юридичний ШІ</div>
                                <div className="chat-status">В мережі</div>
                            </div>
                        </div>

                        {/* Область чата */}
                        <div className="chat-messages">
                            {/* Пузырек вопроса пользователя */}
                            <div className={`user-message ${showQuestion ? 'show' : ''}`}>
                                <div className="message-bubble user-bubble">
                                    {chatDemoData[currentChatIndex]?.question}
                                </div>
                            </div>

                            {/* Пузырек ответа ИИ */}
                            {showAnswer && (
                                <div className="ai-message show">
                                    <div className="ai-avatar">ШІ</div>
                                    <div className="message-bubble ai-bubble">
                                        {typedAnswer}
                                        {isTyping && <span className="typing-cursor">|</span>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Поле ввода (статичное для демо) */}
                        <div className="chat-input-area">
                            <div className="chat-input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Введіть ваше запитання..."
                                    className="chat-input"
                                    disabled
                                />
                                <button className="send-button" disabled>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="hero-chat-gradient"></div>
                    </div>
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


