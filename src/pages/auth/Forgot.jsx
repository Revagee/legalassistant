export default function Forgot({ info = '', resetLink = '' }) {
    return (
        <div className="mx-auto max-w-md px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>Відновлення пароля</h1>
            {info && <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{info}</div>}
            {resetLink && (
                <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">Тестове посилання для скидання: <a className="underline" href={resetLink}>{resetLink}</a></div>
            )}
            <form method="post" action="/ui/auth/forgot" className="mt-6 grid gap-4">
                <label className="text-sm font-semibold text-gray-900">Email
                    <input type="email" name="email" required className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                </label>
                <button type="submit" className="rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95">Надіслати інструкції</button>
            </form>
        </div>
    )
}


