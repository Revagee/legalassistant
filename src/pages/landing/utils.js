export function assetPath(name) {
    return `/img/${name}`
}

export function classNames(...xs) {
    return xs.filter(Boolean).join(' ')
}

export function getHeroVariantFromQuery() {
    try {
        const params = new URLSearchParams(window.location.search)
        const v = params.get('hero')
        return v === 'inline' ? 'inline' : 'stacked'
    } catch {
        return 'stacked'
    }
}
