import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TEMPLATES } from '../lib/templates.js'
import { formatTemplate, slugify } from '../lib/templates.js'
import { generateDocxFile } from '../lib/docxGen.js'
import { addGenerated } from '../lib/generatedStore.js'

export default function TemplateForm({ templateKey = '' }) {
    const navigate = useNavigate()
    const keyFromQuery = useMemo(() => {
        try { return new URL(window.location.href).searchParams.get('key') || templateKey } catch { return templateKey }
    }, [templateKey])
    const template = TEMPLATES[keyFromQuery]
    const fields = Array.isArray(template?.fields) ? template.fields : []
    const backHref = '/ui'

    const rowsLike = useMemo(() => new Set(['обставини', 'текст', 'додаткові', 'перелік']), [])

    function isTextarea(field) {
        const lower = String(field?.prompt || '').toLowerCase()
        if ([...rowsLike].some(k => lower.includes(k))) return true
        if (String(field?.key || '').includes('grounds')) return true
        return false
    }

    async function onGenerate(e) {
        e.preventDefault()
        if (!template) return
        const fd = new FormData(e.currentTarget)
        const answers = {}
        for (const f of fields) { answers[f.key] = String(fd.get(f.key) || '').trim() }
        const body = formatTemplate(keyFromQuery, answers)
        const base = slugify(template.slug || keyFromQuery)
        const ts = new Date()
        const yyyy = ts.getFullYear()
        const mm = String(ts.getMonth() + 1).padStart(2, '0')
        const dd = String(ts.getDate()).padStart(2, '0')
        const HH = String(ts.getHours()).padStart(2, '0')
        const MM = String(ts.getMinutes()).padStart(2, '0')
        const SS = String(ts.getSeconds()).padStart(2, '0')
        const fileName = `${base}_${yyyy}${mm}${dd}_${HH}${MM}${SS}.docx`
        const file = await generateDocxFile({ title: keyFromQuery, bodyText: body, fileName })
        const blobUrl = URL.createObjectURL(file)
        addGenerated({ title: keyFromQuery, blobUrl, fileName })
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        a.remove()
        navigate('/ui/generated')
    }

    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <p><a className="text-[#1E3A8A] hover:underline" href={backHref}>← До категорій</a></p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1E3A8A' }}>{keyFromQuery || 'Шаблон'}</h1>
            {template ? (
                <form onSubmit={onGenerate} className="mt-6 grid gap-4 max-w-3xl">
                    {fields.map((field) => (
                        <div key={field.key}>
                            <label className="text-sm font-semibold text-gray-900" htmlFor={field.key}>{field.prompt}</label>
                            {isTextarea(field) ? (
                                <textarea id={field.key} name={field.key} rows={5} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]"></textarea>
                            ) : (
                                <input id={field.key} name={field.key} type="text" className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(30,58,138,0.2)]" />
                            )}
                        </div>
                    ))}
                    <button className="mt-2 inline-flex rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:opacity-95" type="submit">Згенерувати документ</button>
                </form>
            ) : (
                <p className="mt-6 text-sm" style={{ color: '#4B5563' }}>Шаблон не знайдено.</p>
            )}
        </div>
    )
}


