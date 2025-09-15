export default function CalculatorsIndex() {
    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>Калькулятори</h1>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h3 className="text-base font-semibold text-gray-900">Судовий збір</h3>
                    <p className="mt-1 text-sm" style={{ color: '#4B5563' }}>Розрахунок збору за типом звернення.</p>
                    <a className="mt-4 inline-flex rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95" href="/calculators/fees">Відкрити</a>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h3 className="text-base font-semibold text-gray-900">3% річних (ЦК 625)</h3>
                    <p className="mt-1 text-sm" style={{ color: '#4B5563' }}>Розрахунок за період прострочки.</p>
                    <a className="mt-4 inline-flex rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95" href="/calculators/interest">Відкрити</a>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h3 className="text-base font-semibold text-gray-900">Пеня (договірна)</h3>
                    <p className="mt-1 text-sm" style={{ color: '#4B5563' }}>За ставкою на день і кількістю днів.</p>
                    <a className="mt-4 inline-flex rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95" href="/calculators/penalty">Відкрити</a>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h3 className="text-base font-semibold text-gray-900">ЄСВ (для ФОП)</h3>
                    <p className="mt-1 text-sm" style={{ color: '#4B5563' }}>Місячний та сукупний ЄСВ.</p>
                    <a className="mt-4 inline-flex rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95" href="/calculators/esv">Відкрити</a>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <h3 className="text-base font-semibold text-gray-900">Аліменти (спрощено)</h3>
                    <p className="mt-1 text-sm" style={{ color: '#4B5563' }}>За кількістю дітей або власним відсотком.</p>
                    <a className="mt-4 inline-flex rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95" href="/calculators/alimony">Відкрити</a>
                </div>
            </div>
        </div>
    )
}


