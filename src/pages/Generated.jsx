import { useEffect, useState } from 'react'
import { readGenerated, clearGenerated } from '../lib/generatedStore.js'

export default function Generated() {
    const [files, setFiles] = useState([])
    useEffect(() => { setFiles(readGenerated()) }, [])
    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>Останні згенеровані файли</h1>
            {files && files.length > 0 ? (
                <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">Збережено локально у браузері</div>
                        <button onClick={() => { clearGenerated(); setFiles([]) }} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">Очистити</button>
                    </div>
                    <ul className="mt-3 grid gap-2">
                        {files.map((f) => (
                            <li key={f.id} className="flex items-center justify-between gap-3 rounded-md border border-gray-100 p-2">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-medium text-gray-900">{f.title}</div>
                                    <div className="truncate text-xs text-gray-500">{f.fileName} · {new Date(f.createdAt).toLocaleString()}</div>
                                </div>
                                <a className="shrink-0 rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95" href={f.blobUrl} download={f.fileName}>Завантажити</a>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p className="mt-6 text-sm" style={{ color: '#4B5563' }}>Поки що немає файлів.</p>
            )}
        </div>
    )
}


