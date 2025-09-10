import { Header } from '../pages/landing/components.jsx'

export default function Layout({ children }) {
    return (
        <div>
            <Header />
            <main className="mx-auto max-w-7xl px-6 py-6">
                {children}
            </main>
        </div>
    )
}


