const KEY = 'lawbot_generated_files_v1'

export function readGenerated() {
    try {
        const raw = localStorage.getItem(KEY)
        if (!raw) return []
        const arr = JSON.parse(raw)
        return Array.isArray(arr) ? arr : []
    } catch { return [] }
}

export function saveGenerated(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

function generateUniqueTitle(desiredTitle, existingList) {
    const existingTitles = existingList.map(item => item.title)

    if (!existingTitles.includes(desiredTitle)) {
        return desiredTitle
    }

    let counter = 2
    while (true) {
        const newTitle = `${desiredTitle} (${counter})`
        if (!existingTitles.includes(newTitle)) {
            return newTitle
        }
        counter++
    }
}

export function addGenerated({ title, blobUrl, fileName }) {
    const list = readGenerated()
    const uniqueTitle = generateUniqueTitle(title, list)
    const item = { id: `${Date.now()}`, title: uniqueTitle, blobUrl, fileName, createdAt: new Date().toISOString() }
    list.unshift(item)
    saveGenerated(list)
    return item
}

export function clearGenerated() { saveGenerated([]) }

