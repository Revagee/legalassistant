import { merchant } from '../lib/merchant.js'

export default function Contacts() {
    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Контакти</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Звʼяжіться з нами з будь‑яких питань щодо сервісу</p>

            <div className="mt-6 space-y-5 text-page-section-container">
                <section>
                    <h2 className="text-lg font-semibold">Назва магазину</h2>
                    <p className="mt-2 text-sm">{merchant.shopName}</p>
                </section>
                <section>
                    <h2 className="text-lg font-semibold">Контактна інформація</h2>
                    <ul className="mt-2 text-sm list-disc pl-5">
                        <li>Email: <a href={`mailto:${merchant.email}`} className="underline">{merchant.email}</a></li>
                        <li>Телефон: <a href={`tel:${merchant.phone.replace(/\s/g, '')}`} className="underline">{merchant.phone}</a></li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-lg font-semibold">Адреса</h2>
                    <p className="mt-2 text-sm">{merchant.address}</p>
                </section>
                <section>
                    <h2 className="text-lg font-semibold">Години підтримки</h2>
                    <p className="mt-2 text-sm">Пн‑Пт 10:00–18:00 (EET). Вихідні: Сб‑Нд.</p>
                </section>
            </div>
        </div>
    )
}


