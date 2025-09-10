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

        // Сохраняем обратно
        fs.writeFileSync(filePath, JSON.stringify(processed));
        console.log('✅ Готово: public/dataset.json обновлен');
    } catch (err) {
        console.error('❌ Ошибка обработки:', err.message);
        process.exit(1);
    }
}

processDataset();


