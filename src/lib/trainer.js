// Utilities to load and parse JSONL trainer data

const SUBJECT_LABELS = {
    administrative: 'Адміністративне право',
    civil_procedure: 'Цивільний процес',
    commercial: 'Господарське право',
    family: 'Сімейне право',
    labor: 'Трудове право',
}

/**
 * Parse JSONL (one JSON object per line) into array of objects
 * @param {string} text
 * @returns {Array}
 */
function parseJsonl(text) {
    return text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => JSON.parse(line))
}

// Eagerly load all jsonl files as raw text at build time
const rawFiles = import.meta.glob('./trainer_data/*.jsonl', { eager: true, as: 'raw' })

// Build dataset map: code -> { label, items }
const DATASETS = Object.entries(rawFiles).reduce((acc, [path, raw]) => {
    const fileName = path.split('/').pop() || ''
    const code = fileName.replace('.jsonl', '')
    const label = SUBJECT_LABELS[code] || code
    const items = parseJsonl(raw)
    acc[code] = { code, label, items }
    return acc
}, {})

/**
 * Get available subjects metadata
 * @returns {Array<{code:string,label:string,count:number}>}
 */
export function getSubjects() {
    return Object.values(DATASETS).map((d) => ({ code: d.code, label: d.label, count: d.items.length }))
}

/**
 * Load randomized questions for a subject code
 * @param {string} code
 * @param {number} count default 10
 * @returns {{ subjectLabel: string, questions: Array, ids: Array<number> }}
 */
export function loadQuestions(code, count = 10) {
    const dataset = DATASETS[code]
    if (!dataset) {
        return { subjectLabel: code || 'Тест', questions: [], ids: [] }
    }
    const total = dataset.items.slice()
    // shuffle
    total.sort(() => Math.random() - 0.5)
    const selected = total.slice(0, Math.min(count, total.length))
    // map to expected shape
    const questions = selected.map((q) => ({
        question: q.question,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
    }))
    const ids = questions.map((_, idx) => idx + 1)
    return { subjectLabel: dataset.label, questions, ids }
}

/**
 * Resolve label for code
 */
export function getLabelByCode(code) {
    const d = DATASETS[code]
    return d ? d.label : code
}

export const TRAINER_INTERNALS = {
    SUBJECT_LABELS,
}


