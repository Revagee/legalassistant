import { Header } from '../pages/landing/components.jsx'
import { useLocation } from 'react-router-dom'

export default function Layout({ children }) {
    const location = useLocation()
    const isChat = location.pathname.startsWith('/ai')
    return (
        <div>
            <Header />
            <main className={isChat ? 'p-0' : 'mx-auto max-w-7xl px-6 py-6'} style={isChat ? { height: 'calc(100dvh - var(--header-h, 64px))', minHeight: 'calc(100dvh - var(--header-h, 64px))', overflow: 'hidden' } : undefined}>
                {children}
            </main>
        </div>
    )
}


