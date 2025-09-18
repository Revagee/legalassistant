import { merchant } from '../lib/merchant.js'

export default function Delivery() {
    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Доставка та отримання</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}</p>

            <div className="mt-6 space-y-5" style={{ color: 'var(--ink)' }}>
                <section>
                    <h2 className="text-lg font-semibold">Спосіб доставки</h2>
                    <p className="mt-2 text-sm">{merchant.delivery.method}</p>
                </section>
                <section>
                    <h2 className="text-lg font-semibold">Умови отримання</h2>
                    <p className="mt-2 text-sm">{merchant.delivery.terms}</p>
                </section>
                <section>
                    <h2 className="text-lg font-semibold">Підтвердження оплати</h2>
                    <p className="mt-2 text-sm">Після успішної оплати ви отримаєте електронний лист на {merchant.email} або зможете одразу перейти до розділу «Акаунт» для доступу до послуг.</p>
                </section>
            </div>
        </div>
    )
}


