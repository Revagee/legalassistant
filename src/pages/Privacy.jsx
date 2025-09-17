export default function Privacy() {
    return (
        <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Політика конфіденційності</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}</p>

            <div className="mt-6 space-y-5" style={{ color: 'var(--ink)' }}>
                <section>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>1. Хто ми</h2>
                    <p className="mt-2 text-sm">«Юридичний помічник» — веб‑застосунок для створення юридичних документів, роботи з правовою базою та взаємодії з Юридичним ШІ. Ми поважаємо вашу приватність і обробляємо дані відповідально.</p>
                </section>
                <section>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>2. Які дані ми збираємо</h2>
                    <ul className="mt-2 text-sm list-disc pl-5">
                        <li>Облікові дані: ім’я, email, технічні токени авторизації.</li>
                        <li>Використання сервісу: історія генерацій документів, взаємодія з чат‑інтерфейсом (за умови увімкнення історії).</li>
                        <li>Технічні дані: лог‑файли, IP‑адреса, тип пристрою та браузера, cookies.</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>3. Для чого ми використовуємо дані</h2>
                    <ul className="mt-2 text-sm list-disc pl-5">
                        <li>Надання функцій застосунку: авторизація, збереження згенерованих файлів, доступ до преміум‑можливостей.</li>
                        <li>Покращення сервісу: діагностика помилок, аналітика використання функцій.</li>
                        <li>Комунікація: сервісні листи, повідомлення про зміни.</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>4. Зберігання та безпека</h2>
                    <p className="mt-2 text-sm">Ми застосовуємо технічні й організаційні заходи безпеки. Частина даних (наприклад, посилання на згенеровані файли) може зберігатися локально у вашому браузері (<code>localStorage</code>).</p>
                </section>
                <section>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>5. Файли cookie</h2>
                    <p className="mt-2 text-sm">Cookies використовуються для авторизації, збереження налаштувань теми та покращення роботи інтерфейсу.</p>
                </section>
                <section>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>6. Треті сторони</h2>
                    <p className="mt-2 text-sm">Ми можемо використовувати платіжних провайдерів (наприклад, LiqPay/Stripe/WayForPay) та сервіси аналітики. Дані передаються лише в обсязі, необхідному для надання послуги.</p>
                </section>
                <section>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>7. Ваші права</h2>
                    <ul className="mt-2 text-sm list-disc pl-5">
                        <li>Доступ, виправлення або видалення персональних даних.</li>
                        <li>Обмеження обробки та заперечення проти неї, де це застосовно.</li>
                        <li>Перенесення даних (за можливості).</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>8. Контакти</h2>
                    <p className="mt-2 text-sm">З питань приватності: <a href="mailto:legal@example.com" className="underline">legal@example.com</a>.</p>
                </section>
            </div>
        </div>
    )
}


