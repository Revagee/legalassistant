export default function Register({ error = null, next = '' }) {
    return (
        <div className="mx-auto max-w-md px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>Реєстрація</h1>
            {error && <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
            <form method="post" action="/ui/auth/register" className="mt-6 grid gap-4">
                {next && <input type="hidden" name="next" value={next} />}
                <label className="text-sm font-semibold text-gray-900">Ім'я
                    <input type="text" name="name" required className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <label className="text-sm font-semibold text-gray-900">Email
                    <input type="email" name="email" required className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <label className="text-sm font-semibold text-gray-900">Пароль
                    <input type="password" name="password" required className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <label className="text-sm font-semibold text-gray-900">Повторіть пароль
                    <input type="password" name="password2" required className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <button type="submit" className="rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95">Створити акаунт</button>
            </form>
            <p className="mt-4 text-sm">Вже маєте акаунт? <a className="text-[#1E3A8A] hover:underline" href={`/ui/auth/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}>Увійти</a></p>
        </div>
    )
}


