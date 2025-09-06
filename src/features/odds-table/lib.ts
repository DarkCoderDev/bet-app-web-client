// --- Функция расчета результатов ставок
import type {FilterFn} from "@tanstack/react-table";
import type {Match} from "entities/match/types.ts";


export const calculateBetResult = (betType: string, homeScore: number, awayScore: number): boolean => {
    const totalGoals = homeScore + awayScore;

    const betResults = {
        'П1': () => homeScore > awayScore,
        'Х': () => homeScore === awayScore,
        'П2': () => awayScore > homeScore,
        'Ф1(0)': () => homeScore > awayScore,
        'Ф2(0)': () => awayScore > homeScore,
        '1 заб': () => homeScore > 0,
        '2 заб': () => awayScore > 0,
        'ТМ2.5': () => totalGoals < 2.5,
        'ТБ2.5': () => totalGoals > 2.5,
        'ТМ3': () => totalGoals < 3,
        'ТБ3': () => totalGoals > 3,
        'Оз-да': () => homeScore > 0 && awayScore > 0,
        'Оз-нет': () => homeScore === 0 || awayScore === 0,
    };

    const result = betResults[betType as keyof typeof betResults]?.() ?? false;
    
    return result;
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
    ['Команды', 5],
    ['П1', 6],
    ['Х', 7],
    ['П2', 8],
    ['Ф1(0)', 9],
    ['Ф2(0)', 10],
    ['1 заб', 11],
    ['2 заб', 12],
    ['ТБ2.5', 13],
    ['ТМ2.5', 14],
    ['ТБ3', 15],
    ['ТМ3', 16],
    ['Оз-да', 17],
    ['Оз-нет', 18],
]);

// Вспомогательная функция для получения индекса колонки
export const getColumnIndex = (columnId: string): number => {
    return columnMap.get(columnId) ?? -1;
};
