export default function Login({ error = null, next = '', googleEnabled = false }) {
    return (
        <div className="mx-auto max-w-md px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>Вхід</h1>
            {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
            <form method="post" action="/ui/auth/login" className="mt-6 grid gap-4">
                {next && <input type="hidden" name="next" value={next} />}
                <label className="text-sm font-semibold text-gray-900">Email
                    <input type="email" name="email" required className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <label className="text-sm font-semibold text-gray-900">Пароль
                    <input type="password" name="password" required className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <button type="submit" className="rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95">Увійти</button>
            </form>
            {googleEnabled && (
                <div className="mt-4">
                    <a className="inline-flex rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" href={`/ui/auth/google${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Увійти через Google</a>
                </div>
            )}
            <p className="mt-4 text-sm"><a className="text-[#1E3A8A] hover:underline" href="/ui/auth/forgot">Забули пароль?</a></p>
            <p className="mt-1 text-sm">Ще немає акаунта? <a className="text-[#1E3A8A] hover:underline" href={`/ui/auth/register${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Зареєструватися</a></p>
        </div>
    )
}


