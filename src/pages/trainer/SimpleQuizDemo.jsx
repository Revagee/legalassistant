import { useState } from 'react'

const initial = [
    { q: "What's the color of the sky on a clear day?", options: ['Green', 'Blue', 'Red', 'Yellow'], answer: 1 },
    { q: '2 + 2 = ?', options: ['3', '4', '5', '22'], answer: 1 },
    { q: 'Which is a fruit?', options: ['Carrot', 'Potato', 'Apple', 'Onion'], answer: 2 },
]

export default function SimpleQuizDemo() {
    const [current, setCurrent] = useState(0)
    const [score, setScore] = useState(0)
    const [finished, setFinished] = useState(false)

    function handleAnswer(idx) {
        if (idx === initial[current].answer) setScore((s) => s + 1)
        const next = current + 1
        next < initial.length ? setCurrent(next) : setFinished(true)
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--accent)] mb-6">Simple Quiz Demo</h1>
            {!finished ? (
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <h2 className="text-lg font-semibold mb-4">{initial[current].q}</h2>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {initial[current].options.map((opt, i) => (
                            <button key={i} className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50" onClick={() => handleAnswer(i)}>
                                {opt}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-600">{current + 1} / {initial.length}</div>
                </div>
            ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                    <h2 className="text-xl font-semibold mb-2">Your Score</h2>
                    <div className="text-4xl font-bold mb-4 text-[var(--accent)]">{score} / {initial.length}</div>
                    <button className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white" onClick={() => { setCurrent(0); setScore(0); setFinished(false) }}>Retry Quiz</button>
                </div>
            )}
        </div>
    )
}


