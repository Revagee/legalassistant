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
    try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { }
}

export function addGenerated({ title, blobUrl, fileName }) {
    const list = readGenerated()
    const item = { id: `${Date.now()}`, title, blobUrl, fileName, createdAt: new Date().toISOString() }
    list.unshift(item)
    saveGenerated(list)
    return item
}

export function clearGenerated() { saveGenerated([]) }

