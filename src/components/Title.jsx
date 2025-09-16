import { useEffect } from 'react'

export default function Title({ title }) {
    useEffect(() => {
        document.title = title ? `${title} — Pravo Helper` : 'Pravo Helper'
    }, [title])
    return null
}


