import { merchant } from '../lib/merchant.js'

export default function Terms() {
    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Умови користування</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}</p>

            <div className="mt-6 space-y-5 text-page-section-container">
                <section>
                    <h2 className="text-lg font-semibold">1. Призначення сервісу</h2>
                    <p className="mt-2 text-sm">«Юридичний помічник» надає інструменти для генерації юридичних документів, розрахунків та довідкової інформації, а також інтерфейс Юридичного ШІ. Сервіс не є юридичною фірмою та не надає індивідуальних правових консультацій.</p>
                </section>
                <section>
                    <h2 className="text-lg font-semibold">2. Доступ і обліковий запис</h2>
                    <ul className="mt-2 text-sm list-disc pl-5">
                        <li>Ви відповідаєте за збереження конфіденційності своїх облікових даних.</li>
                        <li>Ви погоджуєтесь використовувати сервіс законно і добросовісно.</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-lg font-semibold">3. Платні функції</h2>
                    <p className="mt-2 text-sm">Преміум‑можливості доступні за підпискою (місячною або річною). Оплата обробляється платіжними провайдерами. Умови підписки можуть оновлюватися; актуальні тарифи вказано на сторінці «Підписка».</p>
                </section>
                <section>
                    <h2 className="text-lg font-semibold">4. Контент і відповідальність</h2>
                    <ul className="mt-2 text-sm list-disc pl-5">
                        <li>Згенеровані матеріали мають інформаційний характер і потребують перевірки користувачем.</li>
                        <li>Ми прагнемо точності, але не гарантуємо повної відповідності актуальному законодавству у кожному випадку.</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-lg font-semibold">5. Обмеження</h2>
                    <ul className="mt-2 text-sm list-disc pl-5">
                        <li>Заборонено використовувати сервіс для протиправної діяльності або порушення прав третіх осіб.</li>
                        <li>Заборонений несанкціонований доступ, реверс‑інжиніринг, втручання в роботу сервісу.</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-lg font-semibold">6. Припинення доступу</h2>
                    <p className="mt-2 text-sm">Ми можемо призупинити або припинити доступ у випадку порушення Умов або з міркувань безпеки.</p>
                </section>
                <section>
                    <h2 className="text-lg font-semibold">7. Зміни в Умовах</h2>
                    <p className="mt-2 text-sm">Ми можемо час від часу оновлювати ці Умови. Продовження користування сервісом означає згоду з актуальною версією.</p>
                </section>
                <section>
                    <h2 className="text-lg font-semibold">8. Контакти</h2>
                    <p className="mt-2 text-sm">З юридичних питань: <a href={`mailto:${merchant.email}`} className="underline">{merchant.email}</a>.</p>
                </section>
            </div>
        </div>
    )
}


