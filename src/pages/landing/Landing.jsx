import { useEffect, useState } from 'react'
import { classNames, getHeroVariantFromQuery } from './utils.js'
import { Footer, FeaturesCarousel, HeroInline, HeroStacked } from './components.jsx'
import { ClockIcon, ShieldIcon, BadgeIcon } from './icons.jsx'

function FeaturesStyleTag() {
    useEffect(() => {
        const ID = 'features-styles'
        if (document.getElementById(ID)) return
        const style = document.createElement('style')
        style.id = ID
        style.textContent = `
.glass-btn{position:relative;overflow:hidden;border:0;padding:12px 18px;border-radius:14px;cursor:pointer;font-weight:600;letter-spacing:.2px;backdrop-filter:blur(8px) saturate(125%);background:linear-gradient(120deg,color-mix(in oklab,var(--accent) 35%,transparent),color-mix(in oklab,#22d3ee 35%,transparent));color:#fff;outline:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18),0 10px 20px rgba(0,0,0,.18)}
.glass-btn.secondary{background:linear-gradient(120deg,color-mix(in oklab,#64748b 30%,transparent),color-mix(in oklab,#94a3b8 30%,transparent))}
.glass-btn:active{transform:translateY(1px)}
.glass-btn .ripple{position:absolute;width:10px;height:10px;border-radius:999px;pointer-events:none;left:0;top:0;translate:-50% -50%;background:rgba(255,255,255,.7);animation:ripple 700ms ease-out forwards;filter:blur(.5px)}
@keyframes ripple{from{transform:scale(1);opacity:.65}to{transform:scale(40);opacity:0}}
.kbd-btn{background:transparent;border:1px solid var(--cardBorder);border-radius:12px;padding:10px 14px;color:var(--text);cursor:pointer}
.kbd-btn:focus-visible{outline:2px solid color-mix(in oklab,#22d3ee 60%,transparent);outline-offset:2px}
.palette-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(2px);z-index:60}
.palette{position:fixed;inset:10% auto auto 50%;translate:-50% 0;width:min(680px,92vw);background:var(--cardBg);border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.5);padding:10px;z-index:70;border:1px solid var(--cardBorder)}
.palette-input{width:100%;border:0;outline:none;padding:14px 12px;border-radius:12px;margin:4px 0 8px;color:var(--text);background:color-mix(in oklab,var(--cardBg) 70%,transparent);box-shadow:inset 0 0 0 1px var(--cardBorder)}
.palette-list{list-style:none;margin:0;padding:0;max-height:280px;overflow:auto}
.palette-list li{padding:10px 12px;border-radius:10px;cursor:pointer}
.palette-list li.active{background:linear-gradient(90deg,color-mix(in oklab,#22d3ee 20%,transparent),transparent)}
.palette-list li.empty{color:var(--muted);cursor:default}
.tilt{perspective:900px}
.tilt-inner{position:relative;transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform 120ms ease;border-radius:18px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,.3)}
.tilt-inner img{display:block;width:100%;height:auto}
.tilt-content{position:absolute;inset:auto 0 0 0;padding:14px;background:linear-gradient(to top,rgba(0,0,0,.45),transparent 50%);color:#fff}
.glare{position:absolute;inset:-30%;background:radial-gradient(circle at calc(var(--px,.5)*100%) calc(var(--py,.1)*100%),rgba(255,255,255,.35),transparent 40%);mix-blend-mode:screen;pointer-events:none}
.auth{display:grid;gap:14px;background:linear-gradient(180deg,color-mix(in oklab,var(--cardBg) 92%,transparent),color-mix(in oklab,var(--cardBg) 80%,transparent));padding:18px;border-radius:16px;border:1px solid var(--cardBorder)}
.field{position:relative}
.field input{width:100%;padding:18px 44px 14px 12px;border-radius:12px;border:0;color:var(--text);outline:none;background:color-mix(in oklab,var(--cardBg) 70%,transparent);box-shadow:inset 0 0 0 1px var(--cardBorder)}
.field label{position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--muted);transition:all .18s ease;background:transparent;padding:0 4px}
.field input:focus,.field input:not(:placeholder-shown){box-shadow:inset 0 0 0 2px color-mix(in oklab,var(--accent) 50%,transparent),0 0 0 4px color-mix(in oklab,var(--accent) 20%,transparent)}
.field input:focus+label,.field input:not(:placeholder-shown)+label{top:8px;transform:none;font-size:12px;color:color-mix(in oklab,var(--accent) 70%,var(--muted))}
.field .show{position:absolute;right:6px;top:50%;transform:translateY(-50%);background:transparent;border:0;font-size:16px;cursor:pointer}
.error{color:#ef4444;font-size:12px;margin-top:6px}
.auth .hint{color:var(--muted);margin:4px 2px 2px;font-size:12px}
.field input::placeholder{color:transparent}
.card-skeleton{background:var(--cardBg);border-radius:16px;overflow:hidden;padding:12px;border:1px solid var(--cardBorder)}
.shimmer{position:relative;overflow:hidden;background:linear-gradient(90deg,color-mix(in oklab,var(--text) 8%,transparent),color-mix(in oklab,var(--text) 12%,transparent),color-mix(in oklab,var(--text) 8%,transparent))}
.shimmer::after{content:"";position:absolute;inset:0;transform:translateX(-100%);animation:shimmer 1.5s infinite;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)}
@keyframes shimmer{100%{transform:translateX(100%)}}
.sk-image{height:160px;border-radius:12px}
.sk-lines{padding:12px 8px;display:grid;gap:10px}
.sk-line{height:12px;border-radius:8px}
.sk-line.short{width:60%}
.loaded-card{background:var(--cardBg);border:1px solid var(--cardBorder);border-radius:16px;padding:12px}
.loaded-card img{width:100%;height:auto;border-radius:12px}
@media (max-width:520px){.hero-actions{flex-direction:column}}
    `
        document.head.appendChild(style)
    }, [])
    return null
}

export default function Landing({ heroVariant = getHeroVariantFromQuery() }) {
    const [mounted, setMounted] = useState(false)
    const [theme, setTheme] = useState('light')

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

    const onStartChat = () => { window.location.href = '/ui/ai' }

    return (
        <div className={classNames('min-h-screen', 'transition-opacity duration-700 ease-out', mounted ? 'opacity-100' : 'opacity-0')} style={{ fontFamily: 'Inter, Roboto, ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial', backgroundColor: 'var(--pageBg)', color: 'var(--text)' }}>
            <FeaturesStyleTag />
            <main>
                <section className="mx-auto max-w-[1200px] px-6 sr-reveal">
                    {heroVariant === 'inline' ? (
                        <HeroInline onStart={onStartChat} />
                    ) : (
                        <HeroStacked onStart={onStartChat} />
                    )}
                </section>
                <section id="services" className="mx-auto max-w-[1200px] px-6 pt-16 sr-reveal">
                    <div className="mb-8 text-center">
                        <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: 'var(--accent)' }}>Можливості</h2>
                        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Усі ключові інструменти в одному місці</p>
                    </div>
                    <FeaturesCarousel />
                </section>
                <section id="advantages" className="mx-auto max-w-[1200px] px-6 pt-16 sr-reveal">
                    <div className="mb-8 text-center">
                        <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: 'var(--accent)' }}>Переваги</h2>
                        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Швидко, надійно, зрозуміло</p>
                    </div>
                    <div className="mx-auto grid max-w-[980px] grid-cols-1 sm:grid-cols-3 gap-6 items-stretch justify-items-stretch sr-stagger">
                        <AdvTriple />
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}

function AdvTriple() {
    return (
        <>
            <div className="theme-card rounded-lg border p-6 h-full">
                <div className="mb-4"><ClockIcon /></div>
                <div className="text-base font-semibold" style={{ color: 'var(--text)' }}>Швидко</div>
                <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Миттєвий старт і швидкі відповіді.</p>
            </div>
            <div className="theme-card rounded-lg border p-6 h-full">
                <div className="mb-4"><ShieldIcon /></div>
                <div className="text-base font-semibold" style={{ color: 'var(--text)' }}>Надійно</div>
                <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Стабільна робота і збереження даних.</p>
            </div>
            <div className="theme-card rounded-lg border p-6 h-full">
                <div className="mb-4"><BadgeIcon /></div>
                <div className="text-base font-semibold" style={{ color: 'var(--text)' }}>Просто</div>
                <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Зручний інтерфейс і чіткі кроки.</p>
            </div>
        </>
    )
}


