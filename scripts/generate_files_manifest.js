#!/usr/bin/env node
// Генерация манифеста документов из public/files
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const PUBLIC_FILES_DIR = path.join(ROOT, 'public', 'files')
const OUTPUT_FILE = path.join(PUBLIC_FILES_DIR, 'manifest.json')

const CATEGORY_LABELS = {
    'claims': 'Позови',
    'complaints applications': 'Скарги та заяви',
    'contracts': 'Договори',
}

/**
 * Преобразование имени файла в человекочитаемое название.
 * Удаляем расширение, заменяем подчёркивания/дефисы на пробелы,
 * приводим к нормальному регистру, сохраняем кириллицу.
 */
function humanizeName(filename) {
    const base = filename.replace(/\.(docx?|rtf)$/i, '')
    const spaced = base.replace(/[._]+/g, ' ').replace(/\s+/g, ' ').trim()
    // Спец-обработка общих аббревиатур
    const fixed = spaced
        .replace(/\bpozov\b/ig, 'Позов')
        .replace(/\bdogovir\b/ig, 'Договір')
        .replace(/\bklopot(ann?ya)?\b/ig, 'Клопотання')
        .replace(/\bzayava\b/ig, 'Заява')
    // Первая буква заглавная для каждого слова (для латиницы)
    const titled = fixed.split(' ').map(w => w.length ? w[0].toUpperCase() + w.slice(1) : w).join(' ')
    return titled
}

function collectFiles() {
    const categories = []
    const entries = fs.readdirSync(PUBLIC_FILES_DIR, { withFileTypes: true })
    for (const dirent of entries) {
        if (!dirent.isDirectory()) continue
        const categoryKey = dirent.name
        const categoryPath = path.join(PUBLIC_FILES_DIR, categoryKey)
        const files = fs.readdirSync(categoryPath, { withFileTypes: true })
            .filter(f => f.isFile())
            .filter(f => /\.(docx?|rtf)$/i.test(f.name))
            .map(f => {
                const relPath = `/files/${categoryKey}/${f.name}`
                return {
                    name: humanizeName(f.name),
                    filename: f.name,
                    path: relPath,
                    ext: path.extname(f.name).replace('.', '').toLowerCase(),
                    size: fs.statSync(path.join(categoryPath, f.name)).size
                }
            })
            .sort((a, b) => a.name.localeCompare(b.name, 'uk'))
        categories.push({
            key: categoryKey,
            label: CATEGORY_LABELS[categoryKey] || humanizeName(categoryKey),
            files
        })
    }
    categories.sort((a, b) => a.label.localeCompare(b.label, 'uk'))
    return { generatedAt: new Date().toISOString(), categories }
}

function main() {
    if (!fs.existsSync(PUBLIC_FILES_DIR)) {
        console.error('Not found:', PUBLIC_FILES_DIR)
        window.process.exit(1)
    }
    const manifest = collectFiles()
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2), 'utf8')
    console.log('Manifest written to', OUTPUT_FILE)
}

main()


