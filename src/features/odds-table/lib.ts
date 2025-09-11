// --- Функция расчета результатов ставок
import type {FilterFn} from "@tanstack/react-table";
import type {Match} from "entities/match/types.ts";


export type BetResult = 'win' | 'return' | 'lose';

export const calculateBetResult = (
    betType: string,
    homeScore: number,
    awayScore: number
): BetResult => {
    const totalGoals = homeScore + awayScore;

    const betResults: Record<string, () => BetResult> = {
        'П1': () => (homeScore > awayScore ? 'win' : 'lose'),
        'Х': () => (homeScore === awayScore ? 'win' : 'lose'),
        'П2': () => (awayScore > homeScore ? 'win' : 'lose'),

        'Ф1(0)': () => (homeScore > awayScore ? 'win' : homeScore === awayScore ? 'return' : 'lose'),
        'Ф2(0)': () => (awayScore > homeScore ? 'win' : homeScore === awayScore ? 'return' : 'lose'),

        '1 заб': () => (homeScore > 0 ? 'win' : 'lose'),
        '2 заб': () => (awayScore > 0 ? 'win' : 'lose'),

        'ТМ2.5': () => (totalGoals < 2.5 ? 'win' : 'lose'),
        'ТБ2.5': () => (totalGoals > 2.5 ? 'win' : 'lose'),
        'ТМ3': () => (totalGoals < 3 ? 'win' : totalGoals === 3 ? 'return' : 'lose'),
        'ТБ3': () => (totalGoals > 3 ? 'win' : totalGoals === 3 ? 'return' : 'lose'),

        'Оз-да': () => (homeScore > 0 && awayScore > 0 ? 'win' : 'lose'),
        'Оз-нет': () => (homeScore === 0 || awayScore === 0 ? 'win' : 'lose'),
    };

    return betResults[betType]?.() ?? 'lose';
};



// Кэш для индексов колонок (избегаем повторных вычислений)
const columnIndexCache = new Map<string, number>();

// Оптимизированная функция фильтрации с использованием преднормализованных данных
export const includesText: FilterFn<Match> = (match, columnId, filterValue) => {
    // Быстрая проверка на пустое значение фильтра
    if (!filterValue) return true;

    // Кэшируем индекс колонки
    let columnIndex = columnIndexCache.get(columnId);
    if (columnIndex === undefined) {
        columnIndex = getColumnIndex(columnId);
        columnIndexCache.set(columnId, columnIndex);
    }
    if (columnIndex === -1) return true;

    // Данные уже очищены в API, просто сравниваем
    if (columnIndex >= 0 && match.original) {
        const value = String(match.original[columnIndex] ?? "");
        return value.toLowerCase().includes(filterValue.toLowerCase());
    }

    // Fallback к простому сравнению если индекс невалидный
    const v = String(match.getValue(columnId) ?? "");
    return v.toLowerCase().includes(filterValue.toLowerCase());
};

// Функция отображения - данные уже очищены на сервере
export const renderClean = (v: string) => {
    return v;
};

// Оптимизированный маппинг названий колонок на индексы (Map быстрее объекта для поиска)
const columnMap = new Map<string, number>([
    ['День', 0],
    ['Лига', 1],
    ['Дата', 2],
    ['Счет', 3],
    ['1 тайм', 4],
    ['2 тайм', 5],
    ['Команды', 6],
    ['П1', 7],
    ['Х', 8],
    ['П2', 9],
    ['Ф1(0)', 10],
    ['Ф2(0)', 11],
    ['1 заб', 12],
    ['2 заб', 13],
    ['ТБ2.5', 14],
    ['ТМ2.5', 15],
    ['ТБ3', 16],
    ['ТМ3', 17],
    ['Оз-да', 18],
    ['Оз-нет', 19],
    ['Маржа 1X2', 20],
    ['Маржа ТБ/ТМ2.5', 21],
    ['Маржа ТБ/ТМ3', 22],
    ['Маржа ОЗ', 23],
]);

// Вспомогательная функция для получения индекса колонки
export const getColumnIndex = (columnId: string): number => {
    return columnMap.get(columnId) ?? -1;
};
