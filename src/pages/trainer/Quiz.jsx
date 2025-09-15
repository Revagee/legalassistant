import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { loadQuestions } from '../../lib/trainer.js'

export default function TrainerQuiz({ subject = 'Тест', questions = [], ids = [] }) {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const code = searchParams.get('code') || ''
    const loaded = useMemo(() => loadQuestions(code, 10), [code])
    const effectiveSubject = loaded.subjectLabel || subject
    const effectiveQuestions = questions.length > 0 ? questions : loaded.questions
    const effectiveIds = ids.length > 0 ? ids : loaded.ids
    const [remainingMs, setRemainingMs] = useState(10 * 60 * 1000)
    const [paused, setPaused] = useState(false)
    const [answers, setAnswers] = useState({})
    const storageKey = useMemo(() => `trainer:${effectiveSubject}:${effectiveIds.join(',')}`, [effectiveSubject, effectiveIds])
    const resultKey = useMemo(() => `trainer:result`, [])
    const DEFAULT_MS = 10 * 60 * 1000

    useEffect(() => {
        try {
            const state = JSON.parse(localStorage.getItem(storageKey) || '{}')
            setRemainingMs(Number.isFinite(state.remainingMs) ? state.remainingMs : DEFAULT_MS)
            setPaused(state.paused === true)
            setAnswers(state.answers && typeof state.answers === 'object' ? state.answers : {})
        } catch {
            /* ignore */;
        }
    }, [storageKey, DEFAULT_MS])

    useEffect(() => {
        try { localStorage.setItem(storageKey, JSON.stringify({ remainingMs, paused, answers })) } catch {
            /* ignore */;
        }
    }, [storageKey, remainingMs, paused, answers])

    const finishQuiz = useCallback(() => {
        const computed = effectiveQuestions.map((q, index) => {
            const user = answers[`ans_${index + 1}`]
            const correct = q.options[q.correct]
            return { question: q.question, user, correct, ok: user === correct }
        })
        const correctCount = computed.filter((x) => x.ok).length
        const percentage = effectiveQuestions.length > 0 ? Math.round((correctCount / effectiveQuestions.length) * 100) : 0
        const payload = { subject: effectiveSubject, correct: correctCount, percentage, answers: computed }
        try { sessionStorage.setItem(resultKey, JSON.stringify(payload)) } catch {
            /* ignore */;
        }
        try { localStorage.removeItem(storageKey) } catch {
            /* ignore */;
        }
        navigate('/trainer/result', { state: payload })
    }, [answers, effectiveQuestions, effectiveSubject, navigate, resultKey, storageKey])

    useEffect(() => {
        if (paused) return
        const h = setInterval(() => {
            setRemainingMs((ms) => {
                const next = ms - 1000
                if (next <= 0) {
                    clearInterval(h)
                    finishQuiz()
                    return 0
                }
                return next
            })
        }, 1000)
        return () => clearInterval(h)
    }, [paused, answers, effectiveQuestions, finishQuiz])

    function mmss(ms) {
        const total = Math.max(0, Math.floor(ms / 1000))
        const m = Math.floor(total / 60)
        const s = total % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    function onChange(name, value) {
        setAnswers((prev) => ({ ...prev, [name]: value }))
    }



    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>Тема: {effectiveSubject}</h1>
            {effectiveIds && effectiveIds.length > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-md border border-gray-200 bg-white p-3">
                    <div className="text-sm text-gray-700">Час: <span className="font-semibold">{mmss(remainingMs)}</span></div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setPaused(p => !p)} className="rounded-md border border-gray-200 px-3 py-1.5 text-sm">{paused ? 'Продовжити' : 'Пауза'}</button>
                        <button type="button" onClick={() => setRemainingMs(DEFAULT_MS)} className="rounded-md border border-gray-200 px-3 py-1.5 text-sm">Скинути</button>
                    </div>
                </div>
            )}
            <div className="mt-6 flex flex-col space-y-4">
                {effectiveQuestions.map((q, index) => (
                    <div key={index} className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-3 text-base font-medium text-gray-900">Питання {index + 1}:</div>
                        <div className="mb-4 text-base leading-relaxed text-gray-800 break-words">{q.question}</div>
                        <input type="hidden" name={`q_${index + 1}`} value={q.question} />
                        <input type="hidden" name={`c_${index + 1}`} value={q.options[q.correct]} />
                        <div className="grid gap-3">
                            {q.options.map((opt, oi) => (
                                <label key={oi} className="flex items-start cursor-pointer p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-blue-300 transition-all duration-150 min-h-[3rem]">
                                    <input className="mt-1 mr-4 accent-blue-600 flex-shrink-0" type="radio" name={`ans_${index + 1}`} value={opt} required checked={answers[`ans_${index + 1}`] === opt} onChange={() => onChange(`ans_${index + 1}`, opt)} disabled={paused} />
                                    <span className="text-sm leading-relaxed text-gray-700 flex-1 break-words">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                <button className="rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95" type="button" onClick={finishQuiz} disabled={paused}>Завершити</button>
            </div>
        </div>
    )
}


