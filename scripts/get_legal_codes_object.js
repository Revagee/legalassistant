import fs from 'fs';
import path from 'path';

const DEFAULT_CODES_DIR = '/Users/alexanderrekachynskyi/Programming/lawbotFrontend/lawbot/public/codes';

function toDisplayName(basename) {
    return String(basename).replace(/_/g, ' ').trim();
}

export function getLegalCodesObject(codesDirectory = DEFAULT_CODES_DIR) {
    const entries = fs.readdirSync(codesDirectory, { withFileTypes: true });
    const result = {};

    for (const dirent of entries) {
        if (!dirent.isFile()) continue;
        const name = dirent.name;
        if (!/\.htm$/i.test(name)) continue; // только .htm

        const basename = path.basename(name, path.extname(name));
        const displayName = toDisplayName(basename);
        result[displayName] = { id: basename };
    }

    return result;
}

// Если запущен напрямую: вывести JSON в stdout
if (import.meta.url === `file://${process.argv[1]}`) {
    const dir = process.argv[2] || DEFAULT_CODES_DIR;
    const obj = getLegalCodesObject(dir);
    process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}


