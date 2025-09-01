// src/components/DataTable.tsx
import * as React from "react";
import {
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type FilterFn,
} from "@tanstack/react-table";
import { truncate } from "./consts";

type Row = string[];

// --- утилиты
const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): T => {
    let timeout: ReturnType<typeof setTimeout>;
    return ((...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    }) as T;
};

const stripTags = (html: string) =>
    html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();

const includesText: FilterFn<Row> = (row, columnId, filterValue) => {
    const v = String(row.getValue(columnId) ?? "");
    return stripTags(v).toLowerCase().includes(String(filterValue ?? "").toLowerCase());
};

const renderClean = (v: string) => stripTags(v);

// --- Функция расчета результатов ставок
const calculateBetResult = (betType: string, homeScore: number, awayScore: number, homeHalf: number, awayHalf: number) => {
    const totalGoals = homeScore + awayScore;
    const halfGoals = homeHalf + awayHalf;
    const secondHalfGoals = totalGoals - halfGoals;

    switch (betType) {
        case 'п1':
            return homeScore > awayScore ? 1 : (homeScore === awayScore ? 0 : -1);
        case 'х':
            return homeScore === awayScore ? 1 : -1;
        case 'п2':
            return awayScore > homeScore ? 1 : (homeScore === awayScore ? 0 : -1);
        case 'Ф1(0)':
            if (homeScore === awayScore) return 0;
            return homeScore > awayScore ? 1 : -1;
        case 'Ф2(0)':
            if (homeScore === awayScore) return 0;
            return awayScore > homeScore ? 1 : -1;
        case '1 заб':
            return homeScore > 0 ? 1 : -1;
        case '2 заб':
            return awayScore > 0 ? 1 : -1;
        case 'ТМ2.5':
            return totalGoals < 2.5 ? 1 : -1;
        case 'ТБ2.5':
            return totalGoals > 2.5 ? 1 : -1;
        case 'ТМ3':
            return totalGoals < 3 ? 1 : -1;
        case 'ТБ3':
            return totalGoals > 3 ? 1 : -1;
        case 'ОЗ-Да':
            return homeScore > 0 && awayScore > 0 ? 1 : -1;
        case 'ОЗ-Нет':
            return homeScore === 0 || awayScore === 0 ? 1 : -1;
        default:
            return -1;
    }
};

// --- Функция определения цвета ячейки (только для выигрышных ставок)
const getCellColor = (betType: string, row: Row, result: number) => {
    if (result === 1) {
        return 'bg-green-600/30 text-green-100 border-green-500/50';
    }
    return '';
};

// --- Функция получения результата ставки для ячейки
const getBetResultForCell = (columnId: string, row: Row) => {
    // Получаем данные из строки
    const scoreStr = String(row[3] || ''); // Счет (индекс 3)
    const halfStr = String(row[4] || ''); // 1 Тайм (индекс 4)

    // Парсим счет
    const scoreMatch = scoreStr.match(/(\d+)-(\d+)/);
    const halfMatch = halfStr.match(/(\d+)-(\d+)/);

    if (!scoreMatch || !halfMatch) return -1;

    const homeScore = parseInt(scoreMatch[1]);
    const awayScore = parseInt(scoreMatch[2]);
    const homeHalf = parseInt(halfMatch[1]);
    const awayHalf = parseInt(halfMatch[2]);

    // Определяем тип ставки по названию колонки
    let betType = columnId;

    // Маппинг названий колонок на типы ставок
    const betTypeMap: Record<string, string> = {
        'п1': 'п1',
        'х': 'х',
        'п2': 'п2',
        'Ф1(0)': 'Ф1(0)',
        'Ф2(0)': 'Ф2(0)',
        '1 заб': '1 заб',
        '2 заб': '2 заб',
        'ТБ2.5': 'ТБ2.5',
        'ТМ2.5': 'ТМ2.5',
        'ТБ3': 'ТБ3',
        'ТМ3': 'ТМ3',
        'ОЗ-Да': 'ОЗ-Да',
        'ОЗ-Нет': 'ОЗ-Нет'
    };

    if (betTypeMap[columnId]) {
        return calculateBetResult(betTypeMap[columnId], homeScore, awayScore, homeHalf, awayHalf);
    }

    return -1;
};

// -------------------- Таблица --------------------
export const DataTable = React.memo(function DataTable({data}: { data: Row[] }) {
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [pageIndex, setPageIndex] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(34);

    // Локальное состояние для полей фильтрации
    const [filterInputs, setFilterInputs] = React.useState<Record<string, string>>({});
    


    // Debounced функция для фильтрации
    const debouncedSetFilter = React.useMemo(
        () => debounce((args: [string, string]) => {
            const [columnId, value] = args;
            console.log('Debounced filter applied:', columnId, value);
            setColumnFilters(prev => {
                const newFilters = prev.filter(f => f.id !== columnId);
                if (value && value.trim()) {
                    newFilters.push({id: columnId, value: value.trim()});
                }
                return newFilters;
            });
        }, 300),
        []
    );

    // Мемоизированные обработчики для кнопок (оптимизация производительности)
    const handleK1Click = React.useCallback((row: any) => {
        // Сначала очищаем все фильтры коэффициентов
        const coefficientColumns = ['п1', 'х', 'п2', 'Ф1(0)', 'Ф2(0)', '1 заб', '2 заб', 'ТБ2.5', 'ТМ2.5', 'ТБ3', 'ТМ3', 'ОЗ-Да', 'ОЗ-Нет'];
        
        // Очищаем фильтры
        coefficientColumns.forEach(col => {
            debouncedSetFilter([col, '']);
        });
        
        // Очищаем поля ввода
        setFilterInputs(prev => {
            const newInputs = { ...prev };
            coefficientColumns.forEach(col => {
                newInputs[col] = '';
            });
            return newInputs;
        });
        
        // Получаем значения п1, х, п2 из текущей строки
        const p1Value = String(row[6] || ''); // п1 (индекс 6)
        const xValue = String(row[7] || ''); // х (индекс 7)
        const p2Value = String(row[8] || ''); // п2 (индекс 8)
        
        // Применяем truncate с обрезкой сотых (второй аргумент = 1)
        const truncatedP1 = truncate(p1Value, 1);
        const truncatedX = truncate(xValue, 1);
        const truncatedP2 = truncate(p2Value, 1);
        
        // Устанавливаем значения в фильтры
        setFilterInputs(prev => ({
            ...prev,
            'п1': truncatedP1,
            'х': truncatedX,
            'п2': truncatedP2
        }));
        
        // Применяем фильтры
        debouncedSetFilter(['п1', truncatedP1]);
        debouncedSetFilter(['х', truncatedX]);
        debouncedSetFilter(['п2', truncatedP2]);
    }, [debouncedSetFilter]);

    const handleMathClick = React.useCallback((row: any) => {
        // Сначала очищаем все фильтры коэффициентов
        const coefficientColumns = ['п1', 'х', 'п2', 'Ф1(0)', 'Ф2(0)', '1 заб', '2 заб', 'ТБ2.5', 'ТМ2.5', 'ТБ3', 'ТМ3', 'ОЗ-Да', 'ОЗ-Нет'];
        
        // Очищаем фильтры
        coefficientColumns.forEach(col => {
            debouncedSetFilter([col, '']);
        });
        
        // Очищаем поля ввода
        setFilterInputs(prev => {
            const newInputs = { ...prev };
            coefficientColumns.forEach(col => {
                newInputs[col] = '';
            });
            return newInputs;
        });
        
        // Получаем все значения коэффициентов из текущей строки
        const p1Value = String(row[6] || ''); // п1 (индекс 6)
        const xValue = String(row[7] || ''); // х (индекс 7)
        const p2Value = String(row[8] || ''); // п2 (индекс 8)
        const f10Value = String(row[9] || ''); // Ф1(0) (индекс 9)
        const f20Value = String(row[10] || ''); // Ф2(0) (индекс 10)
        const zab1Value = String(row[11] || ''); // 1 заб (индекс 11)
        const zab2Value = String(row[12] || ''); // 2 заб (индекс 12)
        const tb25Value = String(row[13] || ''); // ТБ2.5 (индекс 13)
        const tm25Value = String(row[14] || ''); // ТМ2.5 (индекс 14)
        const tb3Value = String(row[15] || ''); // ТБ3 (индекс 15)
        const tm3Value = String(row[16] || ''); // ТМ3 (индекс 16)
        const ozYesValue = String(row[17] || ''); // ОЗ-Да (индекс 17)
        const ozNoValue = String(row[18] || ''); // ОЗ-Нет (индекс 18)
        
        // Применяем truncate с обрезкой после точки (второй аргумент = 0)
        const truncatedP1 = truncate(p1Value, 0);
        const truncatedX = truncate(xValue, 0);
        const truncatedP2 = truncate(p2Value, 0);
        const truncatedF10 = truncate(f10Value, 0);
        const truncatedF20 = truncate(f20Value, 0);
        const truncatedZab1 = truncate(zab1Value, 0);
        const truncatedZab2 = truncate(zab2Value, 0);
        const truncatedTb25 = truncate(tb25Value, 0);
        const truncatedTm25 = truncate(tm25Value, 0);
        const truncatedTb3 = truncate(tb3Value, 0);
        const truncatedTm3 = truncate(tm3Value, 0);
        const truncatedOzYes = truncate(ozYesValue, 0);
        const truncatedOzNo = truncate(ozNoValue, 0);
        
        // Устанавливаем значения во все фильтры
        setFilterInputs(prev => ({
            ...prev,
            'п1': truncatedP1,
            'х': truncatedX,
            'п2': truncatedP2,
            'Ф1(0)': truncatedF10,
            'Ф2(0)': truncatedF20,
            '1 заб': truncatedZab1,
            '2 заб': truncatedZab2,
            'ТБ2.5': truncatedTb25,
            'ТМ2.5': truncatedTm25,
            'ТБ3': truncatedTb3,
            'ТМ3': truncatedTm3,
            'ОЗ-Да': truncatedOzYes,
            'ОЗ-Нет': truncatedOzNo
        }));
        
        // Применяем все фильтры
        debouncedSetFilter(['п1', truncatedP1]);
        debouncedSetFilter(['х', truncatedX]);
        debouncedSetFilter(['п2', truncatedP2]);
        debouncedSetFilter(['Ф1(0)', truncatedF10]);
        debouncedSetFilter(['Ф2(0)', truncatedF20]);
        debouncedSetFilter(['1 заб', truncatedZab1]);
        debouncedSetFilter(['2 заб', truncatedZab2]);
        debouncedSetFilter(['ТБ2.5', truncatedTb25]);
        debouncedSetFilter(['ТМ2.5', truncatedTm25]);
        debouncedSetFilter(['ТБ3', truncatedTb3]);
        debouncedSetFilter(['ТМ3', truncatedTm3]);
        debouncedSetFilter(['ОЗ-Да', truncatedOzYes]);
        debouncedSetFilter(['ОЗ-Нет', truncatedOzNo]);
    }, [debouncedSetFilter]);

    const handleTotalClick = React.useCallback((row: any) => {
        // Сначала очищаем все фильтры коэффициентов
        const coefficientColumns = ['п1', 'х', 'п2', 'Ф1(0)', 'Ф2(0)', '1 заб', '2 заб', 'ТБ2.5', 'ТМ2.5', 'ТБ3', 'ТМ3', 'ОЗ-Да', 'ОЗ-Нет'];
        
        // Очищаем фильтры
        coefficientColumns.forEach(col => {
            debouncedSetFilter([col, '']);
        });
        
        // Очищаем поля ввода
        setFilterInputs(prev => {
            const newInputs = { ...prev };
            coefficientColumns.forEach(col => {
                newInputs[col] = '';
            });
            return newInputs;
        });
        
        // Получаем все значения коэффициентов из текущей строки
        const p1Value = String(row[6] || ''); // п1 (индекс 6)
        const xValue = String(row[7] || ''); // х (индекс 7)
        const p2Value = String(row[8] || ''); // п2 (индекс 8)
        const f10Value = String(row[9] || ''); // Ф1(0) (индекс 9)
        const f20Value = String(row[10] || ''); // Ф2(0) (индекс 10)
        const zab1Value = String(row[11] || ''); // 1 заб (индекс 11)
        const zab2Value = String(row[12] || ''); // 2 заб (индекс 12)
        const tb25Value = String(row[13] || ''); // ТБ2.5 (индекс 13)
        const tm25Value = String(row[14] || ''); // ТМ2.5 (индекс 14)
        const tb3Value = String(row[15] || ''); // ТБ3 (индекс 15)
        const tm3Value = String(row[16] || ''); // ТМ3 (индекс 16)
        const ozYesValue = String(row[17] || ''); // ОЗ-Да (индекс 17)
        const ozNoValue = String(row[18] || ''); // ОЗ-Нет (индекс 18)
        
        // Применяем смешанную логику обрезки согласно требованиям
        // п1, х, п2 - обрезка после точки (truncate, 0)
        const truncatedP1 = truncate(p1Value, 0);
        const truncatedX = truncate(xValue, 0);
        const truncatedP2 = truncate(p2Value, 0);
        
        // Остальные - обрезка сотых (truncate, 1)
        const truncatedF10 = truncate(f10Value, 1);
        const truncatedF20 = truncate(f20Value, 1);
        const truncatedZab1 = truncate(zab1Value, 1);
        const truncatedZab2 = truncate(zab2Value, 1);
        const truncatedTb25 = truncate(tb25Value, 1);
        const truncatedTm25 = truncate(tm25Value, 1);
        const truncatedTb3 = truncate(tb3Value, 1);
        const truncatedTm3 = truncate(tm3Value, 1);
        const truncatedOzYes = truncate(ozYesValue, 1);
        const truncatedOzNo = truncate(ozNoValue, 1);
        
        // Устанавливаем значения во все фильтры
        setFilterInputs(prev => ({
            ...prev,
            'п1': truncatedP1,
            'х': truncatedX,
            'п2': truncatedP2,
            'Ф1(0)': truncatedF10,
            'Ф2(0)': truncatedF20,
            '1 заб': truncatedZab1,
            '2 заб': truncatedZab2,
            'ТБ2.5': truncatedTb25,
            'ТМ2.5': truncatedTm25,
            'ТБ3': truncatedTb3,
            'ТМ3': truncatedTm3,
            'ОЗ-Да': truncatedOzYes,
            'ОЗ-Нет': truncatedOzNo
        }));
        
        // Применяем все фильтры
        debouncedSetFilter(['п1', truncatedP1]);
        debouncedSetFilter(['х', truncatedX]);
        debouncedSetFilter(['п2', truncatedP2]);
        debouncedSetFilter(['Ф1(0)', truncatedF10]);
        debouncedSetFilter(['Ф2(0)', truncatedF20]);
        debouncedSetFilter(['1 заб', truncatedZab1]);
        debouncedSetFilter(['Ф2(0)', truncatedF20]);
        debouncedSetFilter(['1 заб', truncatedZab1]);
        debouncedSetFilter(['2 заб', truncatedZab2]);
        debouncedSetFilter(['ТБ2.5', truncatedTb25]);
        debouncedSetFilter(['ТМ2.5', truncatedTm25]);
        debouncedSetFilter(['ТБ3', truncatedTb3]);
        debouncedSetFilter(['ТМ3', truncatedTm3]);
        debouncedSetFilter(['ОЗ-Да', truncatedOzYes]);
        debouncedSetFilter(['ОЗ-Нет', truncatedOzNo]);
    }, [debouncedSetFilter]);

    // колонки
    const columns = React.useMemo<ColumnDef<Row>[]>(() => {
        const cols: ColumnDef<Row>[] = [];
        const headers = [
            'ДН',
            'Чемпионат',
            'Дата',
            'Счет',
            '1 Тайм',
            'Матч',
            'п1',
            'х',
            'п2',
            'Ф1(0)',
            'Ф2(0)',
            '1 заб',
            '2 заб',
            'ТБ2.5',
            'ТМ2.5',
            'ТБ3',
            'ТМ3',
            'ОЗ-Да',
            'ОЗ-Нет',
            'Действия'
        ];
        headers.forEach((h, idx) => {
            cols.push({
                id: h,
                header: h,
                accessorFn: (row) => h === 'Действия' ? '' : row[idx],
                cell: (ctx) => renderClean(ctx.getValue<string>()),
                filterFn: includesText,
            } as ColumnDef<Row> & { filterFn: FilterFn<Row> });
        });
        return cols;
    }, [data]);

    // таблица
    const table = useReactTable({
        data,
        columns,
        state: {columnFilters},
        onColumnFiltersChange: (updater) => {
            const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
            setColumnFilters(newFilters);

            const newFilterInputs: Record<string, string> = {};
            newFilters.forEach(filter => {
                newFilterInputs[filter.id] = String(filter.value || '');
            });
            setFilterInputs(newFilterInputs);
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        filterFns: {includesText},
        enableColumnFilters: true,
    });

    // пагинация
    const allRows = table.getRowModel().rows;
    const pageCount = Math.max(1, Math.ceil(allRows.length / pageSize));
    const pageRows = React.useMemo(
        () => allRows.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize),
        [allRows, pageIndex, pageSize]
    );

    React.useEffect(() => setPageIndex(0), [columnFilters]);
    
    // Удалено: превью количества строк для кнопок (для повышения производительности)
    
    // Функция для получения индекса колонки по названию
    const getColumnIndex = (columnName: string): number => {
        const columnMap: Record<string, number> = {
            'п1': 6, 'х': 7, 'п2': 8, 'Ф1(0)': 9, 'Ф2(0)': 10,
            '1 заб': 11, '2 заб': 12, 'ТБ2.5': 13, 'ТМ2.5': 14,
            'ТБ3': 15, 'ТМ3': 16, 'ОЗ-Да': 17, 'ОЗ-Нет': 18
        };
        return columnMap[columnName] || 0;
    };
    
    return (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 h-screen p-6 flex flex-col">
                {/* Основной контейнер */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col flex-1">
                    {/* Панель управления */}
                    <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-6 border-b border-white/10">
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            {/*<div className="flex items-center gap-4">*/}
                            {/*    <label className="flex items-center gap-3 text-white">*/}
                            {/*        <span className="text-sm font-medium">На странице:</span>*/}
                            {/*        <select*/}
                            {/*            value={pageSize}*/}
                            {/*            onChange={(e) => setPageSize(Number(e.target.value))}*/}
                            {/*            className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-slate-700"*/}
                            {/*        >*/}
                            {/*            {[40].map((n) => (*/}
                            {/*                <option key={n} value={n}>{n}</option>*/}
                            {/*            ))}*/}
                            {/*        </select>*/}
                            {/*    </label>*/}
                            {/*</div>*/}

                            <div className="flex items-center gap-4">
                                <div className="px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-slate-300 text-sm font-medium">
                                    Найдено: <span className="text-blue-400 font-bold">{allRows.length.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setColumnFilters([]);
                                        setFilterInputs({});
                                    }}
                                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
                                >
                                    Сбросить фильтры
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Таблица */}
                    <div className="flex-1 overflow-hidden">
                                                <div className="w-full h-full flex flex-col overflow-x-auto">
                            <table className="w-full table-auto border-collapse">
                                <thead>
                                {table.getHeaderGroups().map((hg) => (
                                    <tr key={hg.id} className="bg-gradient-to-r from-slate-800 to-slate-700">
                                        {hg.headers.map((h) => (
                                            <th
                                                key={h.id}
                                                className={`text-left p-1 border-b border-slate-600 text-white font-semibold text-xs leading-tight sticky top-0 z-10 ${
                                                    h.column.id === 'ДН' ? 'w-16' :
                                                    h.column.id === 'Чемпионат' ? 'w-48 lg:w-56' :
                                                    h.column.id === 'Матч' ? 'w-40 lg:w-48' :
                                                    h.column.id === 'Дата' ? 'w-28 lg:w-32' :
                                                    h.column.id === 'Счет' || h.column.id === '1 Тайм' ? 'w-20' :
                                                    h.column.id === 'п1' || h.column.id === 'х' || h.column.id === 'п2' ? 'w-20' :
                                                    h.column.id === 'Действия' ? 'w-32' :
                                                    'w-20'
                                                }`}
                                            >

                                                {h.column.id === 'Действия' ? (
                                                    <div className="select-none text-blue-300 font-bold text-center">
                                                        {h.column.id}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="select-none text-blue-300 font-bold mb-1 text-center">
                                                            {h.column.id}
                                                </div>

                                                        {/* Поле фильтра на всю доступную ширину */}
                                                    <input
                                                        value={filterInputs[h.column.id] || ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            console.log('Input changed:', h.column.id, value);
                                                            setFilterInputs(prev => ({...prev, [h.column.id]: value}));
                                                            debouncedSetFilter([h.column.id, value]);
                                                        }}
                                                    placeholder={`${h.column.id}`}
                                                    className="w-full px-2 py-0.5 text-xs bg-slate-700/50 border border-slate-600 rounded outline-none transition-all duration-200 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-slate-700"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                        </>
                                                    )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                                </thead>

                                <tbody className="divide-y divide-slate-700/50">
                                {pageRows.map((row, rowIndex) => (
                                    <tr
                                        key={row.id}
                                        className={`transition-all duration-200 hover:bg-slate-800/30 ${
                                            rowIndex % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-800/20'
                                        }`}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className={`p-1 text-slate-300 text-xs leading-tight cursor-pointer transition-all duration-200 hover:bg-slate-700/50 hover:text-white group text-center ${
                                                    cell.column.id === 'ДН' ? 'w-16' :
                                                    cell.column.id === 'Чемпионат' ? 'w-48 lg:w-56' :
                                                    cell.column.id === 'Матч' ? 'w-40 lg:w-48' :
                                                    cell.column.id === 'Дата' ? 'w-28 lg:w-32' :
                                                    cell.column.id === 'Счет' || cell.column.id === '1 Тайм' ? 'w-20' :
                                                    cell.column.id === 'п1' || cell.column.id === 'х' || cell.column.id === 'п2' ? 'w-20' :
                                                    cell.column.id === 'Действия' ? 'w-32' :
                                                    'w-20'
                                                }`}
                                                style={{
                                                    backgroundColor: (() => {
                                                        const betResult = getBetResultForCell(cell.column.id, row.original);
                                                        if (betResult === 1) return 'rgba(34, 197, 94, 0.2)'; // green
                                                        return 'transparent';
                                                    })()
                                                }}
                                                onClick={() => {
                                                    const value = String(cell.getValue() ?? "");
                                                    const cleanValue = renderClean(value);
                                                    if (cleanValue && cleanValue.trim()) {
                                                        setFilterInputs(prev => ({...prev, [cell.column.id]: cleanValue.trim()}));
                                                        debouncedSetFilter([cell.column.id, cleanValue.trim()]);
                                                    }
                                                }}
                                                title="Клик для вставки в фильтр"
                                            >
                                                {cell.column.id === 'Действия' ? (
                                                    <div className="flex gap-1 justify-center">
                                                        <button
                                                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                                                            onClick={() => handleK1Click(row.original)}
                                                        >
                                                            К1
                                                        </button>
                                                        <button
                                                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                                                            onClick={() => handleMathClick(row.original)}
                                                        >
                                                            м
                                                        </button>
                                                        <button
                                                            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                                                            onClick={() => handleTotalClick(row.original)}
                                                        >
                                                            Т
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="group-hover:scale-105 transition-transform duration-200 truncate">
                                                        {(() => {
                                                            const betResult = getBetResultForCell(cell.column.id, row.original);
                                                            const value = renderClean(String(cell.getValue() ?? ""));

                                                            if (betResult === 1) {
                                                                return <span className="text-green-300 font-semibold">{value}</span>;
                                                            }

                                                            return value;
                                                        })()}
                                                </div>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {pageRows.length === 0 && (
                                    <tr>
                                        <td colSpan={columns.length}
                                            className="p-8 text-center text-slate-400 text-lg">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                                                    </svg>
                                                </div>
                                                <span>Ничего не найдено</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Пагинация */}
                    <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-6 border-t border-white/10">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                            <button
                                onClick={() => setPageIndex(0)}
                                disabled={pageIndex === 0}
                                className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 text-slate-300 enabled:bg-slate-700 enabled:text-white enabled:cursor-pointer enabled:hover:bg-slate-600 enabled:hover:border-slate-500 transform hover:scale-105 active:scale-95"
                            >
                                «
                            </button>
                            <button
                                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                                disabled={pageIndex === 0}
                                className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 text-slate-300 enabled:bg-slate-700 enabled:text-white enabled:cursor-pointer enabled:hover:bg-slate-600 enabled:hover:border-slate-500 transform hover:scale-105 active:scale-95"
                            >
                                ‹
                            </button>
                            <span className="px-6 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-sm font-medium">
                                {pageIndex + 1} / {pageCount}
                            </span>
                            <button
                                onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                                disabled={pageIndex >= pageCount - 1}
                                className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 text-slate-300 enabled:bg-slate-700 enabled:text-white enabled:cursor-pointer enabled:hover:bg-slate-600 enabled:hover:border-slate-500 transform hover:scale-105 active:scale-95"
                            >
                                ›
                            </button>
                            <button
                                onClick={() => setPageIndex(pageCount - 1)}
                                disabled={pageIndex >= pageCount - 1}
                                className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 text-slate-300 enabled:bg-slate-700 enabled:text-white enabled:cursor-pointer enabled:hover:bg-slate-600 enabled:hover:border-slate-500 transform hover:scale-105 active:scale-95"
                            >
                                »
                            </button>
                        </div>
                    </div>
                </div>
        </div>
    );
});

// -------------------- App с загрузкой .gz --------------------

export default function App() {
    const [rows, setRows] = React.useState<Row[] | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let isMounted = true;

        async function loadData() {
            try {
                setError(null);

                const response = await fetch('/coefficient-total-compressed.gz', {
                    headers: {
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (isMounted) {
                    setRows(result.data);
                }
            } catch (e) {
                console.error('Ошибка загрузки данных:', e);
                if (isMounted) {
                    setError(e instanceof Error ? e.message : 'Неизвестная ошибка');
                }
            }
        }

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Ошибка загрузки</h3>
                    <pre className="whitespace-pre-wrap text-red-200 text-sm bg-red-900/30 rounded-lg p-3">{error}</pre>
                </div>
            </div>
        );
    }

    if (!rows) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="mb-6">
                        <div className="loading-spinner mx-auto"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Загрузка данных…</h3>
                    <p className="text-slate-400 text-lg">Пожалуйста, подождите</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <DataTable data={rows}/>
        </div>
    );
}
