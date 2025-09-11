import fs from 'fs';
import path from 'path';

// Очистка HTML-тегов
function cleanHtml(htmlString) {
    if (typeof htmlString !== 'string') return htmlString;
    return htmlString
        .replace(/<br\s*\/>?/gi, ' ')
        .replace(/<div[^>]*>.*?<\/div>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Достаем epoch из колонки даты (3-я колонка)
function getEpoch(row) {
    const dateStr = String(row[2] || '');
    const match = dateStr.match(/<span[^>]*>(\d+)<\/span>/);
    return match ? parseInt(match[1]) : 0;
}

// Вырезаем видимую дату из HTML, остальное чистим
function extractDateTime(htmlDateStr) {
    if (typeof htmlDateStr !== 'string') return htmlDateStr;
    const dateMatch = htmlDateStr.match(/(\d{1,2}\.\d{1,2}\.\d{2,4}\s+\d{1,2}:\d{2})/);
    if (dateMatch) return dateMatch[1].trim();
    let cleaned = htmlDateStr.replace(/<span[^>]*>(.*?)<\/span>/g, '$1');
    return cleanHtml(cleaned);
}

// Рекурсивная обработка: извлекаем даты и чистим HTML
function processDataWithDateExtraction(data) {
    if (Array.isArray(data)) {
        return data.map(item => processDataWithDateExtraction(item));
    } else if (typeof data === 'object' && data !== null) {
        const processed = {};
        for (const [key, value] of Object.entries(data)) {
            processed[key] = processDataWithDateExtraction(value);
        }
        return processed;
    } else if (typeof data === 'string') {
        if (data.includes('<span') && data.includes('</span>')) {
            return extractDateTime(data);
        }
        return cleanHtml(data);
    }
    return data;
}

async function processDataset() {
    const filePath = path.join(process.cwd(), 'public', 'dataset.json');
    console.log('🚀 Обрабатываю файл:', filePath);

    if (!fs.existsSync(filePath)) {
        console.error('❌ Файл public/dataset.json не найден');
        process.exit(1);
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(raw);

        if (json.data && Array.isArray(json.data)) {
            // Сортировка по epoch
            json.data.sort((a, b) => getEpoch(b) - getEpoch(a));
        }

        // Очистка HTML и извлечение дат
        const processed = processDataWithDateExtraction(json);

        // --- Добавление расчетов маржи ---
        // Используем ту же идею truncate (усечение), что и в фронте: работаем со строками
        const truncate = (value, digits = 2) => {
            if (value === null || value === undefined) return '';
            const str = String(value);
            const [intPart, fracPart = ''] = str.split('.');
            if (digits == null || digits <= 0) return intPart + '.';
            return intPart + '.' + fracPart.slice(0, digits).padEnd(digits, '0');
        };

        const toNum = (v) => {
            const n = Number(v);
            return Number.isFinite(n) && n > 0 ? n : null;
        };

        const calcMargin3Way = (p1, px, p2) => {
            const a = toNum(p1), b = toNum(px), c = toNum(p2);
            if (a && b && c) {
                const m = (1 / a + 1 / b + 1 / c - 1) * 100;
                return truncate(m, 2);
            }
            return '';
        };

        const calcMargin2Way = (pa, pb) => {
            const a = toNum(pa), b = toNum(pb);
            if (a && b) {
                const m = (1 / a + 1 / b - 1) * 100;
                return truncate(m, 2);
            }
            return '';
        };

        if (processed.data && Array.isArray(processed.data)) {
            processed.data = processed.data.map((row) => {
                if (!Array.isArray(row)) return row;
                const p1 = row[6];
                const x = row[7];
                const p2 = row[8];
                const over25 = row[13];
                const under25 = row[14];
                const over3 = row[15];
                const under3 = row[16];
                const bttsYes = row[17];
                const bttsNo = row[18];

                const margin1x2 = calcMargin3Way(p1, x, p2);
                const marginOu25 = calcMargin2Way(over25, under25);
                const marginOu3 = calcMargin2Way(over3, under3);
                const marginBtts = calcMargin2Way(bttsYes, bttsNo);

                return [...row, margin1x2, marginOu25, marginOu3, marginBtts];
            });
        }

        // Сохраняем обратно
        fs.writeFileSync(filePath, JSON.stringify(processed));
        console.log('✅ Готово: public/dataset.json обновлен');
    } catch (err) {
        console.error('❌ Ошибка обработки:', err.message);
        process.exit(1);
    }
}

processDataset();


