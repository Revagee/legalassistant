import { useEffect, useState } from 'react'
import { classNames } from './utils.js'
import { Footer, LiquidGlassGrid, HeroFullscreen, InteractiveContent } from './components.jsx'
import { ClockIcon, ShieldIcon, BadgeIcon } from './icons.jsx'
import { FileText, Users, BookOpen, GraduationCap } from 'lucide-react'

function FeaturesStyleTag() {
    useEffect(() => {
        const ID = 'features-styles'
        if (document.getElementById(ID)) return
        const style = document.createElement('style')
        style.id = ID
    }, [])
    return null
}

function GlassAdvantages() {
    return (
        <>
            <div className="glass-number-card">
                <div className="glass-number">1</div>
                <div className="glass-card-content">
                    <div className="glass-card-icon">
                        <ClockIcon />
                    </div>
                    <div className="text-lg font-semibold mb-3" style={{ color: 'var(--text)' }}>Швидко</div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>Миттєвий старт і швидкі відповіді. Оптимізована архітектура забезпечує блискавичну роботу.</p>
                </div>
            </div>
            <div className="glass-number-card">
                <div className="glass-number">2</div>
                <div className="glass-card-content">
                    <div className="glass-card-icon">
                        <ShieldIcon />
                    </div>
                    <div className="text-lg font-semibold mb-3" style={{ color: 'var(--text)' }}>Надійно</div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>Стабільна робота і збереження даних. Багаторівневий захист вашої інформації.</p>
                </div>
            </div>
            <div className="glass-number-card">
                <div className="glass-number">3</div>
                <div className="glass-card-content">
                    <div className="glass-card-icon">
                        <BadgeIcon />
                    </div>
                    <div className="text-lg font-semibold mb-3" style={{ color: 'var(--text)' }}>Просто</div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>Зручний інтерфейс і чіткі кроки. Інтуїтивний досвід користування.</p>
                </div>
            </div>
        </>
    )
}

export default function Landing() {
    const [mounted, setMounted] = useState(false)
    const [theme, setTheme] = useState('light')
    const [activeCard, setActiveCard] = useState(null)
    const [slideshowActive, setSlideshowActive] = useState(true)
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

    // Default cards data for slideshow
    const defaultCards = [
        {
            id: 'templates',
            href: '/templates',
            title: 'Генератор документів',
            fullText: 'Автоматизована генерація юридичних документів з використанням готових шаблонів. Створюйте позови, заяви, договори та інші документи швидко та професійно.',
            icon: FileText,
            features: ['Готові шаблони', 'Автозаповнення', 'Експорт у DOCX']
        },
        {
            id: 'documents',
            href: '/documents',
            title: 'Готові документи',
            fullText: 'Великий каталог готових юридичних документів для різних сфер права. Завантажуйте зразки, редагуйте під ваші потреби та використовуйте у практиці.',
            icon: Users,
            features: ['1000+ зразків', 'Регулярне оновлення', 'Різні галузі права']
        },
        {
            id: 'database',
            href: '/database',
            title: 'Законодавча база',
            fullText: 'Повна база українського законодавства з потужним пошуком. Знаходьте потрібні норми права за ключовими словами, номерами статей або тематикою.',
            icon: BookOpen,
            features: ['Актуальні кодекси', 'Швидкий пошук', 'Закладки та нотатки']
        },
        {
            id: 'trainer',
            href: '/trainer',
            title: 'Тренажери',
            fullText: 'Інтерактивні тренажери для перевірки знань з різних галузей українського права. Тестуйте себе, навчайтеся та підвищуйте кваліфікацію.',
            icon: GraduationCap,
            features: ['Різні галузі права', '10+ питань', 'Детальні пояснення']
        }
    ]

    // Slideshow logic
    useEffect(() => {
        if (!slideshowActive || activeCard) return

        const interval = setInterval(() => {
            setCurrentSlideIndex((prev) => (prev + 1) % defaultCards.length)
        }, 5500) // 5.5 seconds per slide

        return () => clearInterval(interval)
    }, [slideshowActive, activeCard, defaultCards.length])

    // Card hover handlers
    const handleCardHover = (card) => {
        setSlideshowActive(false)
        setActiveCard(card)
        // Update slideshow index to current hovered card
        const cardIndex = defaultCards.findIndex(c => c.id === card.id)
        if (cardIndex !== -1) {
            setCurrentSlideIndex(cardIndex)
        }
    }

    const handleCardLeave = () => {
        setActiveCard(null)
        setTimeout(() => {
            setSlideshowActive(true)
        }, 2000) // Resume slideshow after 2 seconds
    }

    useEffect(() => { const t = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(t) }, [])

    useEffect(() => {
        try {
            const STYLE_ID = 'theme-vars'
            if (!document.getElementById(STYLE_ID)) {
                const style = document.createElement('style')
                style.id = STYLE_ID
                style.textContent = `
          :root{--pageBg:#ffffff;--text:#0f172a;--muted:#4B5563;--accent:#1E3A8A;--accentBg:#1E3A8A;--btnText:#ffffff;--cardBg:#ffffff;--cardBorder:#e5e7eb}
          [data-theme="dark"]{--pageBg:#0b0f14;--text:#e6edf7;--muted:#a5b0c2;--accent:#e6edf7;--accentBg:#e6edf7;--btnText:#0b0f14;--cardBg:#0f1622;--cardBorder:#1f2937}
          .theme-card{background:var(--cardBg) !important; border-color:var(--cardBorder) !important}
        `
                document.head.appendChild(style)
            }
            const initial = window.ThemeManager ? window.ThemeManager.getCurrentTheme() : 'light'
            setTheme(initial)
            const handleThemeChange = (e) => setTheme(e.detail.theme)
            window.addEventListener('themeChanged', handleThemeChange)
            return () => window.removeEventListener('themeChanged', handleThemeChange)
        } catch {
            // noop
        }
    }, [])

    useEffect(() => {
        try {
            const icon = document.getElementById('themeIcon')
            const label = document.getElementById('themeLabel')
            const isLight = theme === 'light'
            const labelText = isLight ? 'Dark' : 'Light'
            if (icon && window.setThemeIcon) window.setThemeIcon(icon, theme)
            if (label) label.textContent = labelText
            setTimeout(() => { if (window.ThemeManager) window.ThemeManager.setupEventListeners() }, 10)
        } catch {
            // noop
        }
    }, [theme])

    useEffect(() => {
        try {
            const STYLE_ID = 'sr-styles'
            if (!document.getElementById(STYLE_ID)) {
                const style = document.createElement('style')
                style.id = STYLE_ID
                style.textContent = `
          .sr-reveal{opacity:0;transform:translateY(20px);filter:blur(4px)}
          .sr-reveal.in-view{opacity:1;transform:none;filter:none;transition:opacity .9s ease-in-out,transform .9s cubic-bezier(.22,1,.36,1),filter .6s ease-in-out}
          .sr-stagger > *{opacity:0;transform:translateY(14px);transition:opacity .75s ease-in-out,transform .75s cubic-bezier(.22,1,.36,1)}
          .sr-stagger.in-view > *{opacity:1;transform:none}
          .sr-stagger.in-view > *:nth-child(1){transition-delay:.05s}
          .sr-stagger.in-view > *:nth-child(2){transition-delay:.15s}
          .sr-stagger.in-view > *:nth-child(3){transition-delay:.25s}
          .sr-stagger.in-view > *:nth-child(4){transition-delay:.35s}
          .sr-stagger.in-view > *:nth-child(5){transition-delay:.45s}
          .sr-stagger.in-view > *:nth-child(6){transition-delay:.55s}
          @media (prefers-reduced-motion: reduce){.sr-reveal,.sr-stagger > *{opacity:1 !important;transform:none !important;filter:none !important}}
        `
                document.head.appendChild(style)
            }
            const io = new IntersectionObserver((entries, observer) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target) }
                }
            }, { threshold: 0.15 })
            document.querySelectorAll('.sr-reveal, .sr-stagger').forEach(el => io.observe(el))
            return () => io.disconnect()
        } catch {
            // noop
        }
    }, [])

    const onStartChat = () => { window.location.href = '/ai' }

    // Добавляем обработчик прокрутки для индикатора
    useEffect(() => {
        const updateScrollProgress = () => {
            const scrolled = window.scrollY
            const maxHeight = document.documentElement.scrollHeight - window.innerHeight
            const progress = (scrolled / maxHeight) * 100
            const progressBar = document.querySelector('.scroll-progress')
            if (progressBar) {
                progressBar.style.width = `${Math.min(progress, 100)}%`
            }
        }

        window.addEventListener('scroll', updateScrollProgress)
        return () => window.removeEventListener('scroll', updateScrollProgress)
    }, [])

    return (
        <div className={classNames('transition-opacity duration-700 ease-out modern-bg', mounted ? 'opacity-100' : 'opacity-0')} style={{ fontFamily: 'Inter, Roboto, ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial', color: 'var(--text)', minHeight: '100vh' }}>
            {/* Scroll progress indicator */}
            <div className="scroll-indicator">
                <div className="scroll-progress" style={{ width: '0%' }}></div>
            </div>

            <FeaturesStyleTag />

            {/* Fullscreen Hero Section */}
            <HeroFullscreen onStart={onStartChat} />

            {/* Smooth transition from hero */}
            <div className="content-transition">
                <section id="services" className="w-full px-6 sr-reveal">
                    <div className="flex flex-col lg:flex-row w-full">
                        {/* Left side - Glass Grid (50% width) */}
                        <div className="w-full lg:w-1/2 flex justify-center lg:justify-start px-4 lg:px-8 order-2 lg:order-1">
                            <LiquidGlassGrid
                                onCardHover={handleCardHover}
                                onCardLeave={handleCardLeave}
                                activeCard={activeCard}
                                defaultCard={defaultCards[currentSlideIndex]}
                            />
                        </div>

                        {/* Right side - Interactive Content (50% width) */}
                        <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-start px-4 lg:px-8 order-1 lg:order-2">
                            <InteractiveContent
                                activeCard={activeCard}
                                defaultCard={defaultCards[currentSlideIndex]}
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* Section Divider */}
            <div className="section-divider"></div>

            {/* Advantages section with gradient background */}
            <section id="advantages" className="advantages-section px-6 pt-24 pb-24 sr-reveal">
                {/* Floating particles */}
                <div className="floating-particles">
                    <div className="floating-particle" style={{ left: '10%', animationDelay: '0s', '--drift-x': '20px' }}></div>
                    <div className="floating-particle" style={{ left: '25%', animationDelay: '2s', '--drift-x': '-15px' }}></div>
                    <div className="floating-particle" style={{ left: '40%', animationDelay: '4s', '--drift-x': '30px' }}></div>
                    <div className="floating-particle" style={{ left: '60%', animationDelay: '1s', '--drift-x': '-10px' }}></div>
                    <div className="floating-particle" style={{ left: '75%', animationDelay: '3s', '--drift-x': '25px' }}></div>
                    <div className="floating-particle" style={{ left: '90%', animationDelay: '5s', '--drift-x': '-20px' }}></div>
                    <div className="floating-particle" style={{ left: '15%', animationDelay: '6s', '--drift-x': '10px' }}></div>
                    <div className="floating-particle" style={{ left: '85%', animationDelay: '7s', '--drift-x': '-25px' }}></div>
                </div>

                <div className="mx-auto max-w-[1200px] relative z-10">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: 'var(--accent)' }}>
                            Чому обирають нас
                        </h2>
                        <p className="text-lg sm:text-xl max-w-3xl mx-auto" style={{ color: 'var(--muted)' }}>
                            Унікальні переваги, що роблять роботу з юридичними питаннями простішою
                        </p>
                    </div>
                    <div className="advantages-flex-grid max-w-6xl mx-auto sr-stagger">
                        <GlassAdvantages />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
