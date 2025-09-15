import { TEMPLATE_CATEGORIES } from '../lib/templates.js'

export default function TemplatesIndex({ categories = TEMPLATE_CATEGORIES }) {
    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>Майстер документів</h1>
            <p className="mt-2 text-sm" style={{ color: '#4B5563' }}>Оберіть шаблон з категорії:</p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.entries(categories).map(([cat, items]) => (
                    <div key={cat} className="rounded-xl border border-gray-200 bg-white p-5">
                        <h3 className="text-base font-semibold text-gray-900">{cat}</h3>
                        <ul className="mt-2 list-disc pl-6">
                            {items.map((item) => (
                                <li key={item} className="text-sm leading-7">
                                    <a className="text-[#1E3A8A] hover:underline" href={`/template?key=${encodeURIComponent(item)}`}>{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}


