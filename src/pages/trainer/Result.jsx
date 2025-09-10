import { useLocation } from 'react-router-dom'

export default function TrainerResult({ subject = '', correct = 0, percentage = 0, answers = [] }) {
    const location = useLocation()
    let s = subject
    let c = correct
    let p = percentage
    let a = answers
    if (location && location.state && typeof location.state === 'object') {
        s = location.state.subject || s
        c = Number.isFinite(location.state.correct) ? location.state.correct : c
        p = Number.isFinite(location.state.percentage) ? location.state.percentage : p
        a = Array.isArray(location.state.answers) ? location.state.answers : a
    } else {
        try {
            const raw = sessionStorage.getItem('trainer:result')
            if (raw) {
                const data = JSON.parse(raw)
                s = data.subject || s
                c = Number.isFinite(data.correct) ? data.correct : c
                p = Number.isFinite(data.percentage) ? data.percentage : p
                a = Array.isArray(data.answers) ? data.answers : a
            }
        } catch (_) { }
    }
    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>Результат тренування — {s}</h1>
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
                <div className="text-sm" style={{ color: '#111827' }}>Правильних відповідей: {c} з 10 ({p}%)</div>
                <div className="mt-3">
                    <ol className="list-decimal pl-6">
                        {a.map((x, idx) => (
                            <li key={idx} className="mb-2 text-sm leading-6">
                                <div>{x.question}</div>
                                <div>
                                    Ваша відповідь: {x.user} {x.ok ? '✅' : `❌ (правильно: ${x.correct})`}
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
            <p className="mt-4"><a className="inline-flex rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95" href="/ui/trainer">Нове тренування</a></p>
        </div>
    )
}


