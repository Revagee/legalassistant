import { merchant } from '../lib/merchant.js'

export default function Merchant() {
    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Інформація про власника</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Одержувач оплати та відшкодувань</p>

            <div className="mt-6 space-y-5" style={{ color: 'var(--ink)' }}>
                <section>
                    <h2 className="text-lg font-semibold">Юридична інформація</h2>
                    <ul className="mt-2 text-sm list-disc pl-5">
                        <li>Найменування: {merchant.legalName}</li>
                        <li>РНОКПП/ЄДРПОУ: {merchant.edrpou}</li>
                        <li>Адреса: {merchant.address}</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-lg font-semibold">Контакти</h2>
                    <ul className="mt-2 text-sm list-disc pl-5">
                        <li>Email: <a href={`mailto:${merchant.email}`} className="underline">{merchant.email}</a></li>
                        <li>Телефон: <a href={`tel:${merchant.phone.replace(/\s/g, '')}`} className="underline">{merchant.phone}</a></li>
                    </ul>
                </section>
            </div>
        </div>
    )
}


