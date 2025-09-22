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
        style.textContent = `
/* Main Background with Smooth Transitions */
.modern-bg{position:relative;overflow:hidden;background:var(--pageBg)}
.modern-bg > *{position:relative;z-index:1}

/* Removed gradient section styles */

/* Smooth transition sections */
.content-transition{background:linear-gradient(180deg,transparent 0%,color-mix(in oklab,var(--cardBg) 80%,transparent) 50%,var(--cardBg) 100%);padding:80px 0 40px;margin-top:-40px}

/* Liquid Glass Grid */
.liquid-glass-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;perspective:1000px;position:relative;width:100%;grid-auto-rows:max-content}
.liquid-glass-item{position:relative;background:rgba(255,255,255,0.05);backdrop-filter:blur(25px) saturate(180%);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:24px;transition:all 0.4s cubic-bezier(0.23,1,0.32,1);overflow:hidden;transform-style:preserve-3d;cursor:pointer;height:auto;box-shadow:2px 6px 6px color-mix(in oklab,var(--cardBorder) 30%,transparent)}

/* Glass refraction effects */
.liquid-glass-item::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3) var(--glow-x,50%),transparent);opacity:0;transition:opacity 0.3s ease,transform 0.3s ease}
.liquid-glass-item:hover::after{opacity:1;transform:translateX(var(--glow-offset,0px))}

/* Background distortion */
.glass-distortion{position:absolute;inset:0;border-radius:20px;background:radial-gradient(circle at var(--mouse-x,50%) var(--mouse-y,50%),rgba(255,255,255,0.12) 0%,rgba(255,255,255,0.04) 30%,transparent 60%);opacity:0;transition:opacity 0.3s ease;mix-blend-mode:overlay;filter:blur(0.5px)}
.liquid-glass-item:hover .glass-distortion{opacity:1}

/* Additional glass realism */
.glass-reflection{position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.03) 0%,transparent 100%);border-radius:20px 20px 0 0;pointer-events:none}
.glass-chromatic{position:absolute;inset:1px;border-radius:19px;background:linear-gradient(45deg,rgba(0,150,255,0.02),rgba(255,0,150,0.02),rgba(150,255,0,0.02));opacity:0;transition:opacity 0.3s ease;mix-blend-mode:screen}
.liquid-glass-item:hover .glass-chromatic{opacity:1}

/* Content styling */
.glass-content{position:relative;z-index:2}
.glass-icon{width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;margin-bottom:16px;border:1px solid rgba(255,255,255,0.2)}
.glass-title{font-size:16px;font-weight:600;color:var(--text);margin-bottom:8px;line-height:1.4}
.glass-description{font-size:13px;color:var(--muted);line-height:1.5;opacity:0.9}

/* Enhanced hover state */
.liquid-glass-item:hover{transform:translateY(-4px) rotateX(calc(var(--rotate-x,0deg) * -1)) rotateY(calc(var(--rotate-y,0deg) * -1)) scale(1.02);border-color:rgba(255,255,255,0.3);background:rgba(255,255,255,0.08);box-shadow:0 25px 50px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.2),0 0 30px rgba(255,255,255,0.1)}
.liquid-glass-item:hover .glass-icon{background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.3);transform:scale(1.05)}

/* Active card state */
.liquid-glass-item.active{border-color:color-mix(in oklab,var(--accent) 40%,transparent);background:rgba(255,255,255,0.06);box-shadow:0 15px 30px color-mix(in oklab,var(--accent) 20%,transparent),inset 0 1px 0 rgba(255,255,255,0.15)}
.liquid-glass-item.active .glass-icon{background:color-mix(in oklab,var(--accent) 15%,transparent);border-color:color-mix(in oklab,var(--accent) 30%,transparent)}

/* Mobile optimizations */
@media (max-width:1024px){
.liquid-glass-grid{width:100%}
.liquid-glass-item{padding:22px}
}

@media (max-width:768px){
.liquid-glass-grid{grid-template-columns:1fr;gap:16px;width:100%;max-width:400px}
.liquid-glass-item{padding:20px;transform:none !important}
.liquid-glass-item:hover{transform:translateY(-2px) !important}
.glass-icon{width:40px;height:40px}
.glass-title{font-size:15px}
.glass-description{font-size:12px}
}

@media (max-width:480px){
.liquid-glass-grid{max-width:320px;gap:12px}
.liquid-glass-item{padding:16px}
.glass-icon{width:36px;height:36px}
}

/* Modern Cards */
.neo-card{position:relative;background:var(--cardBg);border:1px solid color-mix(in oklab,var(--cardBorder) 60%,transparent);border-radius:20px;padding:24px;transition:all 0.3s cubic-bezier(0.23,1,0.32,1);overflow:hidden}
.neo-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in oklab,var(--accent) 40%,transparent) 50%,transparent);opacity:0;transition:opacity 0.3s ease}
.neo-card:hover{transform:translateY(-4px);border-color:color-mix(in oklab,var(--accent) 30%,transparent);box-shadow:0 20px 40px color-mix(in oklab,var(--accent) 15%,transparent)}
.neo-card:hover::before{opacity:1}

/* Feature Grid with floating elements */
.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px;position:relative}
.feature-item{position:relative;background:var(--cardBg);border:1px solid color-mix(in oklab,var(--cardBorder) 50%,transparent);border-radius:24px;padding:32px 24px;transition:all 0.4s cubic-bezier(0.23,1,0.32,1);overflow:hidden}
.feature-item::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:conic-gradient(from 0deg,transparent,color-mix(in oklab,var(--accent) 20%,transparent),transparent);opacity:0;transition:all 0.6s ease;animation:rotate 10s linear infinite;border-radius:50%}
.feature-item:hover::before{opacity:1}
.feature-item::after{content:'';position:absolute;inset:2px;background:var(--cardBg);border-radius:22px;z-index:1}
.feature-item > *{position:relative;z-index:2}
@keyframes rotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}

/* Icon containers */
.icon-glow{position:relative;width:64px;height:64px;border-radius:20px;background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 20%,transparent),color-mix(in oklab,#22d3ee 15%,transparent));display:flex;align-items:center;justify-content:center;margin-bottom:20px}
.icon-glow::before{content:'';position:absolute;inset:-2px;border-radius:22px;background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 40%,transparent),color-mix(in oklab,#22d3ee 30%,transparent));z-index:-1;filter:blur(8px);opacity:0.7}

/* Floating particles */
.particles{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.particle{position:absolute;width:4px;height:4px;border-radius:50%;background:color-mix(in oklab,var(--accent) 30%,transparent);animation:float 8s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0px) scale(1);opacity:0.8}50%{transform:translateY(-20px) scale(1.2);opacity:0.4}}

/* Advantages Section with Gradient (mirrored from above section) */
.advantages-section{position:relative;background:linear-gradient(180deg,color-mix(in oklab,var(--cardBg) 80%,transparent) 0%,var(--cardBg) 50%,transparent 100%);overflow:hidden}
.advantages-section::before{content:'';position:absolute;bottom:0;left:0;width:60%;height:100%;background:radial-gradient(ellipse at 20% 80%,color-mix(in oklab,var(--accent) 6%,transparent) 0%,color-mix(in oklab,#22d3ee 4%,transparent) 40%,transparent 70%);pointer-events:none;z-index:0}

/* Floating particles for advantages section */
.floating-particles{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1}
.floating-particle{position:absolute;width:3px;height:3px;border-radius:50%;background:color-mix(in oklab,var(--accent) 40%,transparent);animation:floatUp 12s ease-in-out infinite}
@keyframes floatUp{0%{transform:translateY(100vh) translateX(0px) scale(0.5);opacity:0}10%{opacity:0.8}90%{opacity:0.3}100%{transform:translateY(-20vh) translateX(var(--drift-x,0px)) scale(1.2);opacity:0}}

/* Glass Number Cards */
.glass-number-card{position:relative;background:rgba(255,255,255,0.06);backdrop-filter:blur(20px) saturate(150%);border:1px solid rgba(255,255,255,0.18);border-radius:24px;padding:32px 24px;transition:all 0.5s cubic-bezier(0.23,1,0.32,1);overflow:hidden;transform-style:preserve-3d;box-shadow:0 8px 32px color-mix(in oklab,var(--accent) 8%,transparent),inset 0 1px 0 rgba(255,255,255,0.12)}
.glass-number-card::before{content:'';position:absolute;inset:0;border-radius:24px;background:linear-gradient(135deg,rgba(255,255,255,0.1) 0%,transparent 50%);pointer-events:none}
.glass-number-card:hover{transform:translateY(-8px) scale(1.02);border-color:rgba(255,255,255,0.25);box-shadow:0 20px 40px color-mix(in oklab,var(--accent) 12%,transparent),inset 0 1px 0 rgba(255,255,255,0.2)}

/* Glass Numbers */
.glass-number{position:absolute;top:0;left:80%;bottom:0;width:auto;height:100%;display:flex;align-items:center;justify-content:center;font-size:120px;font-weight:900;color:color-mix(in oklab,var(--accent) 40%,transparent);text-shadow:none;pointer-events:none;z-index:1}

/* Flex Grid for advantages */
.advantages-flex-grid{display:flex;flex-wrap:wrap;gap:32px;width:100%}
.advantages-flex-grid > *{flex:1;min-width:300px}

/* Card content */
.glass-card-content{position:relative;z-index:2}
.glass-card-icon{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 15%,transparent),color-mix(in oklab,#22d3ee 10%,transparent));backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;margin-bottom:20px;transition:all 0.3s ease}
.glass-number-card:hover .glass-card-icon{background:linear-gradient(135deg,color-mix(in oklab,var(--accent) 20%,transparent),color-mix(in oklab,#22d3ee 15%,transparent));border-color:rgba(255,255,255,0.25)}

/* Scroll indicator */
.scroll-indicator{position:fixed;top:0;left:0;width:100%;height:4px;background:color-mix(in oklab,var(--cardBorder) 30%,transparent);z-index:100}
.scroll-progress{height:100%;background:linear-gradient(90deg,var(--accent),#22d3ee);transition:width 0.1s ease}

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

/* Hero Fullscreen Styles */
.hero-fullscreen{position:relative;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 30% 50%,color-mix(in oklab,var(--accent) 25%,transparent),color-mix(in oklab,var(--accent) 8%,transparent) 40%,var(--pageBg) 70%),linear-gradient(135deg,color-mix(in oklab,var(--accent) 15%,var(--pageBg)),var(--pageBg) 60%,color-mix(in oklab,var(--accent) 10%,var(--pageBg)))}
.hero-container{display:grid;grid-template-columns:1fr 1fr;height:100%;align-items:center}
.hero-content{padding:4rem 3rem 4rem 4rem;display:flex;align-items:center;justify-content:center}
.hero-text{max-width:540px}
.hero-title{font-size:clamp(2.5rem,6vw,4.5rem);font-weight:700;line-height:1.1;margin-bottom:1.5rem;color:var(--accent);letter-spacing:-0.02em}
.hero-description{font-size:1.125rem;line-height:1.6;color:var(--muted);margin-bottom:2.5rem;opacity:0.9}
.hero-actions{display:flex;gap:1rem;align-items:center}
.hero-chat-container{position:relative;height:100%;display:flex;align-items:center;justify-content:center;padding:2rem 4rem 2rem 2rem}
.hero-chat-wrapper{position:relative;width:100%;height:80%;max-height:600px;border-radius:20px;overflow:hidden;border:1px solid var(--cardBorder);background:var(--cardBg);display:flex;flex-direction:column}
.chat-header{background:color-mix(in oklab,var(--accent) 10%,var(--cardBg));border-bottom:1px solid var(--cardBorder);padding:1rem 1.5rem}
.chat-header-content{display:flex;align-items:center;gap:0.75rem}
.chat-title{font-weight:600;color:var(--text);font-size:1.1rem}
.chat-status{color:var(--muted);font-size:0.875rem}
.chat-messages{flex:1;padding:1.5rem;overflow-y:auto;display:flex;flex-direction:column;gap:1rem;min-height:0}
.user-message{display:flex;justify-content:flex-end;opacity:0;transform:translateY(20px);transition:all 0.5s ease-out}
.user-message.show{opacity:1;transform:translateY(0)}
.ai-message{display:flex;align-items:flex-start;gap:0.75rem;opacity:0;transform:translateY(10px);transition:all 0.3s ease-out}
.ai-message.show{opacity:1;transform:translateY(0)}
.ai-avatar{width:32px;height:32px;border-radius:50%;background:var(--accent);color:var(--btnText);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:600;flex-shrink:0}
.message-bubble{max-width:85%;padding:0.875rem 1.125rem;border-radius:18px;line-height:1.5;font-size:0.9rem}
.user-bubble{background:var(--accent);color:var(--btnText);border-bottom-right-radius:6px}
.ai-bubble{background:color-mix(in oklab,var(--cardBorder) 50%,transparent);color:var(--text);border-bottom-left-radius:6px}
.typing-cursor{animation:blink 1s infinite;margin-left:2px}
@keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}
.chat-input-area{border-top:1px solid var(--cardBorder);padding:1rem 1.5rem;background:var(--cardBg)}
.chat-input-wrapper{display:flex;gap:0.75rem;align-items:center}
.chat-input{flex:1;padding:0.75rem 1rem;border:1px solid var(--cardBorder);border-radius:24px;background:var(--pageBg);color:var(--muted);font-size:0.9rem;outline:none}
.send-button{width:40px;height:40px;border-radius:50%;background:color-mix(in oklab,var(--accent) 80%,transparent);color:var(--accent);border:none;display:flex;align-items:center;justify-content:center;cursor:not-allowed}
.hero-chat-gradient{position:absolute;bottom:0;left:0;right:0;height:30%;background:linear-gradient(to top,var(--pageBg),color-mix(in oklab,var(--pageBg) 70%,transparent) 60%,transparent);pointer-events:none}

/* Responsive Design */
@media (max-width:1024px){
.hero-container{grid-template-columns:1.2fr 0.8fr}
.hero-content{padding:3rem 2rem 3rem 3rem}
.hero-chat-container{padding:2rem 3rem 2rem 1.5rem}
.hero-chat-wrapper{width:90%;height:75%}
}

@media (max-width:768px){
.hero-container{grid-template-columns:1fr;grid-template-rows:1fr auto;gap:0}
.hero-content{padding:3rem 2rem 2rem;order:1}
.hero-text{text-align:center}
.hero-title{font-size:clamp(2rem,8vw,3rem)}
.hero-description{font-size:1rem}
.hero-actions{justify-content:center}
.hero-chat-container{order:2;height:50vh;padding:0 2rem 2rem;align-items:flex-start}
.hero-chat-wrapper{width:100%;height:100%;max-width:400px;margin:0 auto}
.chat-messages{padding:1rem;gap:0.75rem}
.message-bubble{font-size:0.85rem;padding:0.75rem 1rem}
}

@media (max-width:520px){
.hero-fullscreen{height:100svh}
.hero-content{padding:2rem 1.5rem 1.5rem}
.hero-chat-container{padding:0 1.5rem 1.5rem}
.hero-actions{flex-direction:column;gap:0.75rem}
.hero-chat-wrapper{max-width:100%}
.chat-header{padding:0.75rem 1rem}
.chat-messages{padding:0.75rem;gap:0.5rem}
.chat-input-area{padding:0.75rem 1rem}
}
    `
        document.head.appendChild(style)
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
