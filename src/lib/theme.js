// Simple theme manager for toggling data-theme on <html> and persisting choice
(function initThemeManager() {
    const STORAGE_KEY = 'lawbot_theme'

    // Provide shared CSS variables for cards/buttons used in header/landing
    try {
        const STYLE_ID = 'theme-vars'
        if (!document.getElementById(STYLE_ID)) {
            const style = document.createElement('style')
            style.id = STYLE_ID
            style.textContent = `
          :root{--pageBg:#ffffff;--text:#0f172a;--muted:#4B5563;--accent:#1E3A8A;--accentBg:#1E3A8A;--btnText:#ffffff;--cardBg:#ffffff;--cardBorder:#e5e7eb;
            /* Radix Themes accent override to keep borders consistent */
            --accent-9:#1E3A8A; --accent-10:#1A357C; --accent-8:#2F4FA5}
          [data-theme="dark"]{--pageBg:#0b0f14;--text:#e6edf7;--muted:#a5b0c2;--accent:#93c5fd;--accentBg:#60a5fa;--btnText:#0b0f14;--cardBg:#0f1622;--cardBorder:#1f2937;
            --accent-9:#93c5fd; --accent-10:#bfdbfe; --accent-8:#60a5fa}
          .theme-card{background:var(--cardBg) !important; border-color:var(--cardBorder) !important}
        `
            document.head.appendChild(style)
        }
    } catch {
        // ignore
    }

    function getStoredTheme() {
        try {
            const val = localStorage.getItem(STORAGE_KEY)
            if (val === 'dark' || val === 'light') return val
        } catch {
            // ignore
        }
        return null
    }

    function detectSystemTheme() {
        try {
            return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'
        } catch {
            return 'light'
        }
    }

    function getCurrentTheme() {
        const attr = document.documentElement.getAttribute('data-theme')
        if (attr === 'dark' || attr === 'light') return attr
        const stored = getStoredTheme()
        return stored || 'light'
    }

    function setTheme(next) {
        const theme = (next === 'dark' || next === 'light') ? next : 'light'
        document.documentElement.setAttribute('data-theme', theme)
        try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* ignore */ }
        const ev = new CustomEvent('themeChanged', { detail: { theme } })
        window.dispatchEvent(ev)
    }

    function toggleTheme() {
        const cur = getCurrentTheme()
        setTheme(cur === 'dark' ? 'light' : 'dark')
    }

    function setThemeIcon(iconEl, theme) {
        try {
            if (!iconEl) return
            // Для иконок lucide-react меняем только дата-атрибут; сам компонент можно отрендерить статично
            iconEl.setAttribute('data-theme-icon', theme)
        } catch {
            // noop
        }
    }

    function setupEventListeners() {
        try {
            const icon = document.getElementById('themeIcon')
            const label = document.getElementById('themeLabel')
            const theme = getCurrentTheme()
            setThemeIcon(icon, theme)
            if (label) label.textContent = theme === 'light' ? 'Dark' : 'Light'
        } catch {
            // noop
        }
    }

    // Ensure initial attribute is present if not set by early script
    if (!document.documentElement.getAttribute('data-theme')) {
        setTheme(getStoredTheme() || detectSystemTheme())
    }

    // Keep header button in sync (event delegation, once)
    try {
        const onClick = (ev) => {
            const btn = ev.target.closest && ev.target.closest('#themeBtn')
            if (!btn) return
            const before = getCurrentTheme()
            const next = before === 'dark' ? 'light' : 'dark'
            setTheme(next)
            const icon = document.getElementById('themeIcon')
            const label = document.getElementById('themeLabel')
            setThemeIcon(icon, next)
            if (label) label.textContent = next === 'light' ? 'Dark' : 'Light'
        }
        if (!window.__lawbotThemeDelegationAttached__) {
            document.addEventListener('click', onClick)
            window.__lawbotThemeDelegationAttached__ = true
        }
        // Sync icon/label on themeChanged
        window.addEventListener('themeChanged', () => {
            const theme = getCurrentTheme()
            const icon = document.getElementById('themeIcon')
            const label = document.getElementById('themeLabel')
            setThemeIcon(icon, theme)
            if (label) label.textContent = theme === 'light' ? 'Dark' : 'Light'
        })
        // Initial sync (in case header already rendered)
        setTimeout(() => setupEventListeners(), 0)
        document.addEventListener('DOMContentLoaded', setupEventListeners)
    } catch {
        // ignore
    }

    const api = { getCurrentTheme, setTheme, toggleTheme, setupEventListeners, setThemeIcon }
    window.ThemeManager = api
    // Back-compat for code referencing window.setThemeIcon
    window.setThemeIcon = setThemeIcon
})()


