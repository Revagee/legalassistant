import { merchant } from '../lib/merchant.js'

export default function Refunds() {
    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Повернення коштів</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}</p>

            <div className="mt-6 space-y-5" style={{ color: 'var(--ink)' }}>
                <section>
                    <h2 className="text-lg font-semibold">Політика повернення</h2>
                    <p className="mt-2 text-sm">{merchant.refunds.policy}</p>
                </section>
                <section>
                    <h2 className="text-lg font-semibold">Як оформити повернення</h2>
                    <p className="mt-2 text-sm">{merchant.refunds.howTo} Контакт для звернень: <a href={`mailto:${merchant.email}`} className="underline">{merchant.email}</a>.</p>
                </section>
                <section>
                    <h2 className="text-lg font-semibold">Винятки</h2>
                    <p className="mt-2 text-sm">{merchant.refunds.exceptions}</p>
                </section>
            </div>
        </div>
    )
}


