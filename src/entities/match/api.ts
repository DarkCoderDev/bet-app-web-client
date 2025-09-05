import type { Match } from "entities/match/types.ts";

// Кэш для очищенных строк (избегаем повторных вычислений)

// Оптимизированная функция очистки с кэшированием
const cleanString = (value: any): string => {
    if (value === null || value === undefined) return '';
    let result = value;
    // Оптимизированная замена без создания промежуточных строк
    if (result.includes('<br')) {
        result = result.replace(/<br\s*\/?>/gi, " ");
    }
    if (result.includes('<')) {
        result = result.replace(/<[^>]*>/g, "");
    }
    result = result.trim();
    return result;
};

export async function getDataSet(): Promise<Match[]> {
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const url = new URL('/dataset.br', baseUrl);

    const response = await fetch(url.toString(), {
        headers: {
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json() as { data: Match[] };
    const data = result.data;
    const dataLength = data.length;

    // Избегаем создания нового массива, модифицируем существующий
    for (let rowIndex = 0; rowIndex < dataLength; rowIndex++) {
        const row = data[rowIndex];
        const rowLength = row.length;

        // Очищаем дату от HTML тегов (индекс 2)
        if (row[2]) {
            const dateStr = String(row[2]);
            if (dateStr.includes('<span')) {
                row[2] = dateStr.replace(/<span[^>]*>.*?<\/span>/g, '').trim();
            }
        }

        // Преднормализуем все строковые поля для быстрой фильтрации
        for (let i = 0; i < rowLength; i++) {
            const value = row[i];
            if (value !== null && value !== undefined) {
                // Заменяем оригинальное значение на очищенное
                row[i] = cleanString(value);
            }
        }
    }

    return data;
}
