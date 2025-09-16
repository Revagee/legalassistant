export default function VerifySuccess() {
    return (
        <div className="mx-auto max-w-md px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Email підтверджено</h1>
            <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">Успіх! Тепер ви можете увійти до системи.</div>
            <div className="mt-6 grid gap-3">
                <a href="/" className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200">На головну</a>
                <a href="/auth/login" className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95">Перейти до входу</a>
            </div>
        </div>
    )
}


