import { Document, Packer, Paragraph, TextRun, AlignmentType, convertInchesToTwip } from 'docx'

export async function generateDocxFile({ title, bodyText, fileName }) {
    const paragraphs = []
    const lines = String(bodyText || '').split('\n')
    const trimmedLines = lines.map(l => String(l || '').trim())
    // Определяем первую строку-заголовок (центр), всё, что выше и непустое — шапка (вправо)
    let headingIndex = trimmedLines.findIndex((t) => {
        if (!t) return false
        return (t.toUpperCase() === t) || /^(ПОЗОВНА|ЗАЯВА|КЛОПОТАННЯ|АПЕЛЯЦІЙНА|КАСАЦІЙНА|ДОГОВІР)/i.test(t)
    })
    if (headingIndex < 0) headingIndex = lines.length

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const trimmed = line.trim()
        const isHeading = i === headingIndex
        const isHeaderBlock = i < headingIndex && trimmed.length > 0
        paragraphs.push(new Paragraph({
            alignment: isHeading ? AlignmentType.CENTER : (isHeaderBlock ? AlignmentType.RIGHT : AlignmentType.LEFT),
            children: [new TextRun({ text: line, font: 'Times New Roman', size: 24 })],
        }))
    }

    const margin = convertInchesToTwip(0.79) // ~2 см
    const doc = new Document({ sections: [{ properties: { page: { margin: { top: margin, bottom: margin, left: margin, right: margin } } }, children: paragraphs }] })
    const blob = await Packer.toBlob(doc)
    const finalName = fileName || `${title || 'document'}.docx`
    return new File([blob], finalName, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
}

