import { useMemo } from 'react'
import { getSubjects } from '../../lib/trainer.js'

export default function TrainerIndex({ subjects = {} }) {
    const computed = useMemo(() => {
        const list = getSubjects()
        const map = list.reduce((acc, x) => { acc[x.label] = x.code; return acc }, {})
        return map
    }, [])

    const subjectsMap = Object.keys(subjects).length > 0 ? subjects : computed

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>Тренажер</h1>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Object.entries(subjectsMap).map(([label, code]) => (
                    <a key={code} href={`/trainer/quiz?code=${code}`} className="rounded-lg border border-gray-200 bg-white p-4 text-sm hover:shadow-sm">
                        <span className="font-semibold text-gray-900">{label}</span>
                        <span className="ml-2 text-gray-500">→</span>
                    </a>
                ))}
            </div>
        </div>
    )
}


