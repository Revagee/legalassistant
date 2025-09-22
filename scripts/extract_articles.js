import fs from 'fs';
import path from 'path';

const CODES_DIR = '/Users/alexanderrekachynskyi/Programming/lawbotFrontend/lawbot/public/codes';

function decodeHtmlEntities(input) {
    if (!input) return '';
    const entityMap = {
        '&nbsp;': ' ',
        '&amp;': '&',
        '&quot;': '"',
        '&apos;': "'",
        '&lt;': '<',
        '&gt;': '>',
        '&laquo;': '«',
        '&raquo;': '»',
        '&ndash;': '–',
        '&mdash;': '—',
        '&#160;': ' ',
        '&#8211;': '–',
        '&#8212;': '—',
        '&#171;': '«',
        '&#187;': '»'
    };
    return input.replace(/&[a-zA-Z#0-9]+;/g, m => entityMap[m] || m);
}

function htmlToPlainText(htmlFragment) {
    if (!htmlFragment) return '';
    let text = htmlFragment;
    text = text.replace(/<\s*\/(p|div|h\d)\s*>/gi, '\n');
    text = text.replace(/<\s*br\s*\/?\s*>/gi, '\n');
    text = text.replace(/<\s*li\s*>/gi, '\n• ');
    text = text.replace(/<\s*\/(ul|ol)\s*>/gi, '\n');
    text = text.replace(/<[^>]+>/g, '');
    text = decodeHtmlEntities(text);
    text = text.replace(/\r\n?/g, '\n');
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.split('\n').map(l => l.replace(/[\t ]+$/g, '').replace(/^[\t ]+/g, '')).join('\n');
    return text.trim();
}

function normalizeArticleIdFromTitleText(titleText) {
    if (!titleText) return null;
    let t = titleText.replace(/\s+/g, ' ').trim();
    // Take only part from 'Стаття' up to the first dot
    const startIdx = t.toLowerCase().indexOf('стаття');
    if (startIdx !== -1) {
        t = t.slice(startIdx + 'стаття'.length);
    }
    const dotIdx = t.indexOf('.');
    if (dotIdx !== -1) {
        t = t.slice(0, dotIdx);
    }
    // Keep digits, spaces and hyphens
    t = t.replace(/[^0-9\-\s]/g, '');
    t = t.replace(/\s*-(?:\s*)/g, '-');
    t = t.replace(/\s+/g, '');
    const m = t.match(/^([0-9]+(?:-[0-9]+)?)$/);
    return m ? m[1] : null;
}

function extractArticles(html) {
    const articles = {};

    const spanRe = /<span[^>]*class\s*=\s*(?:["'])?rvts9(?:["'])?[^>]*>\s*Стаття/gi;
    const matches = [];
    let m;
    while ((m = spanRe.exec(html)) !== null) {
        const spanStart = m.index;
        const headingPEndIndex = html.indexOf('</p>', spanStart);
        if (headingPEndIndex === -1) continue;
        const titleHtml = html.slice(spanStart, headingPEndIndex);
        const titleText = htmlToPlainText(titleHtml);
        const id = normalizeArticleIdFromTitleText(titleText);
        if (!id) continue;
        matches.push({ id, start: spanStart });
    }

    for (let i = 0; i < matches.length; i++) {
        const { id, start } = matches[i];
        const nextStart = i + 1 < matches.length ? matches[i + 1].start : html.length;
        let headingPEnd = html.indexOf('</p>', start);
        if (headingPEnd === -1 || headingPEnd > nextStart) {
            headingPEnd = start;
        } else {
            headingPEnd += 4;
        }
        const rawContent = html.slice(headingPEnd, nextStart);
        const body = htmlToPlainText(rawContent);
        const value = body ? `Стаття ${id}.\n${body}` : `Стаття ${id}.`;
        articles[id] = value;
    }

    return articles;
}

function processHtmlFilesInDirectory(directoryPath) {
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
    const htmlFiles = entries
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name)
        .filter(name => {
            const lower = name.toLowerCase();
            return lower.endsWith('.html') || lower.endsWith('.htm');
        });

    let processedCount = 0;
    for (const filename of htmlFiles) {
        try {
            const inputPath = path.join(directoryPath, filename);
            const outputFilename = path.basename(filename, path.extname(filename)) + '.json';
            const outputPath = path.join(directoryPath, outputFilename);

            const html = fs.readFileSync(inputPath, 'utf8');
            const articles = extractArticles(html);
            const out = {
                source: filename,
                timestamp: new Date().toISOString(),
                articles
            };
            const json = JSON.stringify(out, null, 4);
            fs.writeFileSync(outputPath, json, 'utf8');
            console.log(`Written ${Object.keys(articles).length} articles to ${outputPath}`);
            processedCount++;
        } catch (error) {
            console.error(`Failed to process ${filename}:`, error && error.message ? error.message : error);
        }
    }

    console.log(`Processed ${processedCount} HTML file(s) in ${directoryPath}`);
}

function main() {
    processHtmlFilesInDirectory(CODES_DIR);
}

main();
