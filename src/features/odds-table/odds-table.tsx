import React from "react";
import { useSearchParams } from "react-router-dom";
import {
    type ColumnDef,
    type ColumnFiltersState,
    getCoreRowModel, getFilteredRowModel,
    createColumnHelper,
    useReactTable
} from "@tanstack/react-table";
import type {Match} from "entities/match/types.ts";
import {debounce} from "shared/libs.ts";
import {MatchIndexMap, RusMatchKeys, MatchKeys} from "entities/match/consts.ts";
import {signatures} from "entities/filter/signatures.ts";
import { calculateBetResult, includesText, renderClean } from './lib';
import { BetManagementService } from "entities/match/bet-management.ts";
import { SavedMatchesModal } from "components/saved-matches.tsx";

const columnHelper = createColumnHelper<Match>();

// --- Функция получения результата ставки для ячейки
const getBetResultForCell = (columnId: string, Match: Match): boolean => {
    // Получаем данные из строки
    const scoreStr = String(Match[MatchIndexMap[MatchKeys.SCORE]] || ''); // Счет
    const halfStr = String(Match[MatchIndexMap[MatchKeys.FIRST_HALF_SCORE]] || ''); // 1 Тайм

    // Парсим счет
    const scoreMatch = scoreStr.match(/(\d+)-(\d+)/);
    const halfMatch = halfStr.match(/(\d+)-(\d+)/);

    if (!scoreMatch || !halfMatch) return false;

    const homeScore = parseInt(scoreMatch[1]);
    const awayScore = parseInt(scoreMatch[2]);

    // Маппинг колонок ставок на функцию расчета
    const betColumns = {
        [RusMatchKeys[MatchKeys.P1]]: true,
        [RusMatchKeys[MatchKeys.X]]: true,
        [RusMatchKeys[MatchKeys.P2]]: true,
        [RusMatchKeys[MatchKeys.HANDICAP1_0]]: true,
        [RusMatchKeys[MatchKeys.HANDICAP2_0]]: true,
        [RusMatchKeys[MatchKeys.ONE_TO_SCORE]]: true,
        [RusMatchKeys[MatchKeys.TWO_TO_SCORE]]: true,
        [RusMatchKeys[MatchKeys.OVER2_5]]: true,
        [RusMatchKeys[MatchKeys.UNDER2_5]]: true,
        [RusMatchKeys[MatchKeys.OVER3]]: true,
        [RusMatchKeys[MatchKeys.UNDER3]]: true,
        [RusMatchKeys[MatchKeys.BTTS_YES]]: true,
        [RusMatchKeys[MatchKeys.BTTS_NO]]: true,
    } as const;

    if (betColumns[columnId as keyof typeof betColumns]) {
        return calculateBetResult(columnId, homeScore, awayScore);
    }

    return false;
};

// Маппинг ключей из signatures на заголовки колонок через RusMatchKeys
const signatureKeyToColumnHeader: Record<string, string> = {
    [MatchKeys.P1]: RusMatchKeys[MatchKeys.P1],
    [MatchKeys.X]: RusMatchKeys[MatchKeys.X],
    [MatchKeys.P2]: RusMatchKeys[MatchKeys.P2],
    [MatchKeys.HANDICAP1_0]: RusMatchKeys[MatchKeys.HANDICAP1_0],
    [MatchKeys.HANDICAP2_0]: RusMatchKeys[MatchKeys.HANDICAP2_0],
    [MatchKeys.ONE_TO_SCORE]: RusMatchKeys[MatchKeys.ONE_TO_SCORE],
    [MatchKeys.TWO_TO_SCORE]: RusMatchKeys[MatchKeys.TWO_TO_SCORE],
    [MatchKeys.OVER2_5]: RusMatchKeys[MatchKeys.OVER2_5],
    [MatchKeys.UNDER2_5]: RusMatchKeys[MatchKeys.UNDER2_5],
    [MatchKeys.OVER3]: RusMatchKeys[MatchKeys.OVER3],
    [MatchKeys.UNDER3]: RusMatchKeys[MatchKeys.UNDER3],
    [MatchKeys.BTTS_YES]: RusMatchKeys[MatchKeys.BTTS_YES],
    [MatchKeys.BTTS_NO]: RusMatchKeys[MatchKeys.BTTS_NO]
};

type DataKey = keyof typeof MatchIndexMap;
const dataColumns: { key: DataKey; label: string; widthClass: string }[] = [
    {key: MatchKeys.WD, label: RusMatchKeys[MatchKeys.WD], widthClass: 'w-11'},
    {key: MatchKeys.LEAGUE, label: RusMatchKeys[MatchKeys.LEAGUE], widthClass: 'w-2/12'},
    {key: MatchKeys.DATE, label: RusMatchKeys[MatchKeys.DATE], widthClass: 'w-1/12'},
    {key: MatchKeys.SCORE, label: RusMatchKeys[MatchKeys.SCORE], widthClass: 'w-13'},
    {key: MatchKeys.FIRST_HALF_SCORE, label: RusMatchKeys[MatchKeys.FIRST_HALF_SCORE], widthClass: 'w-13'},
    {key: MatchKeys.TEAMS, label: RusMatchKeys[MatchKeys.TEAMS], widthClass: 'w-2/12'},
    {key: MatchKeys.P1, label: RusMatchKeys[MatchKeys.P1], widthClass: 'w-10'},
    {key: MatchKeys.X, label: RusMatchKeys[MatchKeys.X], widthClass: 'w-10'},
    {key: MatchKeys.P2, label: RusMatchKeys[MatchKeys.P2], widthClass: 'w-10'},
    {key: MatchKeys.HANDICAP1_0, label: RusMatchKeys[MatchKeys.HANDICAP1_0], widthClass: 'w-13'},
    {key: MatchKeys.HANDICAP2_0, label: RusMatchKeys[MatchKeys.HANDICAP2_0], widthClass: 'w-13'},
    {key: MatchKeys.ONE_TO_SCORE, label: RusMatchKeys[MatchKeys.ONE_TO_SCORE], widthClass: 'w-13'},
    {key: MatchKeys.TWO_TO_SCORE, label: RusMatchKeys[MatchKeys.TWO_TO_SCORE], widthClass: 'w-13'},
    {key: MatchKeys.OVER2_5, label: RusMatchKeys[MatchKeys.OVER2_5], widthClass: 'w-13'},
    {key: MatchKeys.UNDER2_5, label: RusMatchKeys[MatchKeys.UNDER2_5], widthClass: 'w-13'},
    {key: MatchKeys.OVER3, label: RusMatchKeys[MatchKeys.OVER3], widthClass: 'w-13'},
    {key: MatchKeys.UNDER3, label: RusMatchKeys[MatchKeys.UNDER3], widthClass: 'w-13'},
    {key: MatchKeys.BTTS_YES, label: RusMatchKeys[MatchKeys.BTTS_YES], widthClass: 'w-13'},
    {key: MatchKeys.BTTS_NO, label: RusMatchKeys[MatchKeys.BTTS_NO], widthClass: 'w-12'},
];

const columns: ColumnDef<Match, string>[] = [
    ...dataColumns.map(c => columnHelper.accessor(row => row[MatchIndexMap[c.key]], {
        id: c.label,
        header: c.label,
        cell: ctx => renderClean(String(ctx.getValue() ?? '')),
        filterFn: includesText,
        meta: {widthClass: c.widthClass},
    })),
    columnHelper.display({
        id: 'Сигнатуры',
        header: 'Сигнатуры',
        cell: () => '',
        meta: {widthClass: 'w-1/12'},
    }),
    columnHelper.display({
        id: 'Действия',
        header: 'Действия',
        cell: () => '',
        meta: {widthClass: ' w-20'},
    })
];

export const OddsTable = React.memo(function OddsTable(props: { dataSet: Match[] }) {
    const {dataSet} = props;
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [pageIndex, setPageIndex] = React.useState<number>(0);
    const [pageSize] = React.useState<number>(29);
    const [searchParams, setSearchParams] = useSearchParams();
    const [isSavedMatchesModalOpen, setIsSavedMatchesModalOpen] = React.useState(false);

    // Локальное состояние для полей фильтрации
    const [filterInputs, setFilterInputs] = React.useState<Record<string, string>>({});

    // Сервис управления ставками
    const betService = React.useMemo(() => BetManagementService.getInstance(), []);

    // Функция для обновления URL с фильтрами
    const updateUrlWithFilters = React.useCallback((filters: Record<string, string>) => {
        const newSearchParams = new URLSearchParams();
        
        // Добавляем фильтры в URL, используя индексы из MatchIndexMap
        Object.entries(filters).forEach(([columnName, value]) => {
            if (value && value.trim() !== '') {
                // Находим соответствующий индекс для названия колонки
                const matchKey = Object.entries(RusMatchKeys).find(([key, name]) => name === columnName)?.[0];
                if (matchKey && matchKey in MatchIndexMap) {
                    const index = MatchIndexMap[matchKey as keyof typeof MatchIndexMap];
                    newSearchParams.set(String(index), value);
                }
            }
        });
        
        // Обновляем URL
        setSearchParams(newSearchParams);
    }, [setSearchParams]);

    // Состояние для подсвеченных строк
    const [highlightedRows, setHighlightedRows] = React.useState<Set<string>>(new Set());

    // Загрузка подсвеченных строк при монтировании
    React.useEffect(() => {
        const savedMatches = betService.getSavedMatches();
        const highlighted = new Set<string>();
        
        savedMatches.forEach(match => {
            if (betService.isHighlighted(match.id)) {
                // Ищем строку в таблице по командам и дате
                const tableRow = dataSet.find(row => 
                    String(row[MatchIndexMap[MatchKeys.TEAMS]]) === match.matchData.teams &&
                    String(row[MatchIndexMap[MatchKeys.DATE]]) === match.matchData.date
                );
                if (tableRow) {
                    highlighted.add(`${tableRow[MatchIndexMap[MatchKeys.TEAMS]]}_${tableRow[MatchIndexMap[MatchKeys.DATE]]}`);
                }
            }
        });
        
        setHighlightedRows(highlighted);
    }, [dataSet, betService]);

    // Загрузка фильтров из URL при инициализации
    React.useEffect(() => {
        const urlFilters: Record<string, string> = {};
        
        // Загружаем фильтры из query параметров по индексам
        Object.entries(MatchIndexMap).forEach(([key, index]) => {
            const value = searchParams.get(String(index));
            if (value) {
                // Преобразуем индекс обратно в название колонки для отображения
                const columnName = RusMatchKeys[key as keyof typeof RusMatchKeys];
                if (columnName) {
                    urlFilters[columnName] = value;
                }
            }
        });
        
        // Применяем фильтры из URL
        if (Object.keys(urlFilters).length > 0) {
            setFilterInputs(urlFilters);
            
            // Создаем columnFilters из URL
            const newColumnFilters: ColumnFiltersState = [];
            Object.entries(urlFilters).forEach(([columnId, value]) => {
                if (value && value.trim() !== '') {
                    newColumnFilters.push({id: columnId, value: value.trim()});
                }
            });
            setColumnFilters(newColumnFilters);
        }
    }, [searchParams]);

    // Дополнительная загрузка фильтров при монтировании компонента
    React.useEffect(() => {
        console.log('Component mounted, checking URL for filters...');
        
        // Используем window.location.search для получения текущих параметров
        const currentSearch = window.location.search;
        console.log('Current URL search:', currentSearch);
        
        const urlFilters: Record<string, string> = {};
        
        if (currentSearch) {
            // Парсим параметры из URL
            const urlParams = new URLSearchParams(currentSearch);
            
            // Загружаем фильтры из текущего URL
            Object.entries(MatchIndexMap).forEach(([key, index]) => {
                const value = urlParams.get(String(index));
                if (value) {
                    const columnName = RusMatchKeys[key as keyof typeof RusMatchKeys];
                    if (columnName) {
                        urlFilters[columnName] = value;
                        console.log(`Found filter: ${columnName} = ${value} (index: ${index})`);
                    }
                }
            });
        }
        
        console.log('Total URL filters found:', Object.keys(urlFilters).length);
        
        // Применяем фильтры из URL
        if (Object.keys(urlFilters).length > 0) {
            console.log('Applying filters from URL:', urlFilters);
            setFilterInputs(urlFilters);
            
            const newColumnFilters: ColumnFiltersState = [];
            Object.entries(urlFilters).forEach(([columnId, value]) => {
                if (value && value.trim() !== '') {
                    newColumnFilters.push({id: columnId, value: value.trim()});
                }
            });
            setColumnFilters(newColumnFilters);
            console.log('Column filters set:', newColumnFilters);
        } else {
            console.log('No filters found in URL');
        }
    }, []); // Пустой массив зависимостей - срабатывает только при монтировании

    // refs для расчета доступной высоты
    const tableAreaRef = React.useRef<HTMLDivElement | null>(null);


    // Batch-система для массовых обновлений фильтров
    const batchFilters = React.useRef<Map<string, string>>(new Map());
    const batchTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Начать батч
    const beginBatch = React.useCallback(() => {
        batchFilters.current.clear();
    }, []);

    // Завершить батч
    const endBatch = React.useCallback(() => {
        if (batchTimeout.current) {
            clearTimeout(batchTimeout.current);
        }

        batchTimeout.current = setTimeout(() => {
            // Применяем все фильтры из батча
            const newFilters: ColumnFiltersState = [];
            batchFilters.current.forEach((value, columnId) => {
                if (value && value.trim()) {
                    newFilters.push({id: columnId, value: value.trim()});
                }
            });

            setColumnFilters(newFilters);
            
            // Обновляем URL с новыми фильтрами
            const newFilterInputs = { ...filterInputs };
            batchFilters.current.forEach((value, columnId) => {
                if (value && value.trim()) {
                    newFilterInputs[columnId] = value;
                }
            });
            updateUrlWithFilters(newFilterInputs);
            
            batchFilters.current.clear();
        }, 200);
    }, [filterInputs, updateUrlWithFilters]);

    // Debounced функция для фильтрации (для одиночных обновлений)
    const debouncedSetFilter = React.useMemo(
        () => debounce((args: [string, string]) => {
            const [columnId, value] = args;
            setColumnFilters(prev => {
                const newFilters = prev.filter(f => f.id !== columnId);
                if (value && value.trim()) {
                    newFilters.push({id: columnId, value: value.trim()});
                }
                return newFilters;
            });
            
            // Обновляем URL с новыми фильтрами
            const newFilterInputs = { ...filterInputs, [columnId]: value };
            updateUrlWithFilters(newFilterInputs);
        }, 300),
        [filterInputs, updateUrlWithFilters]
    );

    // Универсальный хендлер для сигнатур
    const handleSignatureClick = React.useCallback((signature: typeof signatures[0], match: Match) => {
        // Сначала очищаем все фильтры коэффициентов
        const coefficientColumns = Object.values(signatureKeyToColumnHeader);

        // Очищаем поля ввода
        setFilterInputs(prev => {
            const newInputs = {...prev};
            coefficientColumns.forEach(col => {
                newInputs[col] = '';
            });
            return newInputs;
        });

        // Применяем трансформации из сигнатуры
        const newFilterInputs: Record<string, string> = {};
        const newBatchFilters: Map<string, string> = new Map();

        signature.fields.forEach(field => {
            const columnHeader = signatureKeyToColumnHeader[field.key];
            if (columnHeader) {
                // Получаем значение из строки по индексу колонки
                const columnIndex = dataColumns.findIndex(col => col.label === columnHeader);
                if (columnIndex !== -1) {
                    const value = String(match[MatchIndexMap[dataColumns[columnIndex].key]] || '');
                    const transformedValue = field.transform(value);

                    newFilterInputs[columnHeader] = transformedValue;
                    newBatchFilters.set(columnHeader, transformedValue);
                }
            }
        });

        // Устанавливаем значения в фильтры
        setFilterInputs(prev => ({...prev, ...newFilterInputs}));

        // Применяем фильтры через batch
        beginBatch();
        newBatchFilters.forEach((value, key) => {
            batchFilters.current.set(key, value);
        });
        endBatch();
    }, [beginBatch, endBatch]);

    // Обработчик сохранения матча
    const handleSaveMatch = React.useCallback((match: Match) => {
        try {
            const savedMatch = betService.saveMatch(match, filterInputs);
            console.log('Матч сохранен:', savedMatch);
            
            // Показываем уведомление (можно заменить на toast)
            alert('Матч сохранен в финансовый менеджер!');
        } catch (error) {
            console.error('Ошибка сохранения матча:', error);
            alert('Ошибка сохранения матча');
        }
    }, [filterInputs, betService]);

    // Обработчик подсветки строки
    const handleToggleHighlight = React.useCallback((match: Match) => {
        const matchKey = `${match[MatchIndexMap[MatchKeys.TEAMS]]}_${match[MatchIndexMap[MatchKeys.DATE]]}`;
        const isHighlighted = highlightedRows.has(matchKey);
        
        if (isHighlighted) {
            highlightedRows.delete(matchKey);
        } else {
            highlightedRows.add(matchKey);
        }
        
        setHighlightedRows(new Set(highlightedRows));
        
        // Сохраняем в сервис
        const savedMatches = betService.getSavedMatches();
        const existingMatch = savedMatches.find(m => 
            m.matchData.teams === String(match[MatchIndexMap[MatchKeys.TEAMS]]) &&
            m.matchData.date === String(match[MatchIndexMap[MatchKeys.DATE]])
        );
        
        if (existingMatch) {
            betService.toggleHighlight(existingMatch.id);
        }
    }, [highlightedRows, betService]);

    // Обработчик применения фильтров
    const handleApplyFilters = (filterValues: Record<string, string>) => {
        console.log('Применяем фильтры:', filterValues);
        
        // Создаем новые columnFilters из filterValues
        const newColumnFilters: ColumnFiltersState = [];
        Object.entries(filterValues).forEach(([columnId, value]) => {
            if (value && value.trim() !== '') {
                newColumnFilters.push({id: columnId, value: value.trim()});
            }
        });
        
        setColumnFilters(newColumnFilters);
        
        // Обновляем filterInputs
        setFilterInputs(filterValues);
        
        // Обновляем URL
        updateUrlWithFilters(filterValues);
    };

    // таблица
    const table = useReactTable({
        data: dataSet,
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
    const pageMatches = React.useMemo(
        () => allRows.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize),
        [allRows, pageIndex, pageSize]
    );

    React.useEffect(() => setPageIndex(0), [columnFilters, pageSize]);

    return (
        <div className="h-full flex flex-col">
            {/* Основной контейнер */}
            <div
                className="bg-white/5 backdrop-blur-xl overflow-hidden flex flex-col h-full">
                {/* Панель управления */}
                <div
                    className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-4 border-b border-white/10 flex-shrink-0">
                    <div className="flex flex-col lg:flex-Match gap-4 items-end justify-end">
                        <div className="flex items-center gap-4">
                            <div
                                className="px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-slate-300 text-sm font-medium">
                                Найдено: <span
                                className="text-blue-400 font-bold">{allRows.length.toLocaleString()}</span>
                            </div>
                            <button
                                onClick={() => setIsSavedMatchesModalOpen(true)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 text-sm"
                            >
                                💾 Сохраненные матчи
                            </button>
                            <button
                                onClick={() => {
                                    setColumnFilters([]);
                                    setFilterInputs({});
                                    // Очищаем URL
                                    setSearchParams(new URLSearchParams());
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 text-sm"
                            >
                                Сбросить фильтры
                            </button>
                        </div>
                    </div>
                </div>

                {/* Таблица - занимает всю доступную высоту */}
                <div className="flex-1 overflow-hidden" ref={tableAreaRef}>
                    <div className="w-full h-full">
                        <table className="w-full table-fixed border-collapse h-full">
                            <thead className="sticky top-0 z-10">
                            {table.getHeaderGroups().map((hg) => (
                                <tr key={hg.id} className="bg-gradient-to-r from-slate-800 to-slate-700">
                                    {hg.headers.map((h) => (
                                        <th
                                            key={h.id}
                                            title={h.column.id}
                                            className={`text-left p-0.5 border-b border-slate-600 text-white font-semibold text-xs leading-tight ${(h.column.columnDef as {
                                                meta?: { widthClass?: string }
                                            }).meta?.widthClass ?? 'w-1/12'}`}
                                        >

                                            {h.column.id === 'Сигнатуры' || h.column.id === 'Действия' ? (
                                                <div className="select-none text-blue-300 font-bold text-center">
                                                    {h.column.id}
                                                </div>
                                            ) : (
                                                <>
                                                    <div
                                                        className="select-none text-blue-300 font-bold mb-1 text-center">
                                                        {h.column.id}
                                                    </div>

                                                    {/* Поле фильтра на всю доступную ширину */}
                                                    <input
                                                        value={filterInputs[h.column.id] || ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            setFilterInputs(prev => ({...prev, [h.column.id]: value}));
                                                            debouncedSetFilter([h.column.id, value]);
                                                        }}
                                                        placeholder={`${h.column.id}`}
                                                        className="w-full px-1 py-0 text-xs bg-slate-700/50 border border-slate-600 rounded outline-none transition-all duration-200 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-slate-700 min-w-0"
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
                            {pageMatches.map((match, matchIndex) => {
                                const matchKey = `${match.original[MatchIndexMap[MatchKeys.TEAMS]]}_${match.original[MatchIndexMap[MatchKeys.DATE]]}`;
                                const isHighlighted = highlightedRows.has(matchKey);
                                
                                return (
                                    <tr
                                        key={match.id}
                                        className={`transition-all duration-200 hover:bg-slate-800/30 ${
                                            matchIndex % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-800/20'
                                        } ${isHighlighted ? 'bg-yellow-500/20' : ''}`}
                                    >
                                        {match.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className={`p-0.5 text-slate-300 text-xs leading-tight cursor-pointer transition-all duration-200 hover:bg-slate-700/50 hover:text-white group text-center overflow-hidden ${(cell.column.columnDef as { meta?: { widthClass?: string } }).meta?.widthClass ?? 'w-1/12'}`}
                                                style={{
                                                    backgroundColor: (() => {
                                                        const betResult = getBetResultForCell(cell.column.id, match.original);
                                                        if (betResult === true) return 'rgba(34, 197, 94, 0.2)'; // green
                                                        return 'transparent';
                                                    })()
                                                }}
                                                onClick={() => {
                                                    const value = String(cell.getValue() ?? "");
                                                    const cleanValue = renderClean(value);
                                                    if (cleanValue && cleanValue.trim()) {
                                                        setFilterInputs(prev => ({
                                                            ...prev,
                                                            [cell.column.id]: cleanValue.trim()
                                                        }));
                                                        debouncedSetFilter([cell.column.id, cleanValue.trim()]);
                                                    }
                                                }}
                                                title={renderClean(String(cell.getValue() ?? ""))}
                                            >
                                                {cell.column.id === 'Сигнатуры' ? (
                                                    <div className="flex gap-1 justify-center">
                                                        {signatures.map((signature) => (
                                                            <button
                                                                key={signature.label}
                                                                className="px-2 py-1 text-white text-xs rounded transition-colors"
                                                                style={{
                                                                    backgroundColor: signature.color
                                                                }}
                                                                onClick={() => handleSignatureClick(signature, match.original)}
                                                            >
                                                                {signature.btnText}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : cell.column.id === 'Действия' ? (
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-all duration-200"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleHighlight(match.original);
                                                            }}
                                                            title={isHighlighted ? "Убрать подсветку" : "Подсветить строку"}
                                                        >
                                                            {isHighlighted ? "✅" : "✏️"}
                                                        </button>
                                                        <button
                                                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-all duration-200"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSaveMatch(match.original);
                                                            }}
                                                            title="Сохранить матч"
                                                        >
                                                            💾
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="group-hover:scale-105 transition-transform duration-200 truncate overflow-hidden text-ellipsis whitespace-nowrap">
                                                        {(() => {
                                                            const betResult = getBetResultForCell(cell.column.id, match.original);
                                                            const value = renderClean(String(cell.getValue() ?? ""));

                                                            if (betResult === true) {
                                                                return <span
                                                                    className="text-green-300 font-semibold">{value}</span>;
                                                            }
                                                            return value;
                                                        })()}
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                            {pageMatches.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length}
                                        className="p-8 text-center text-slate-400 text-lg">
                                        <div className="flex flex-col items-center gap-3">
                                            <div
                                                className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center">
                                                <svg className="w-8 h-8 text-slate-500" fill="none"
                                                     stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"/>
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

                {/* Пагинация - прибита к низу */}
                <div
                    className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-4 border-t border-white/10 flex-shrink-0">
                    <div className="flex flex-row sm:flex-Match gap-4 items-center justify-center">
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
                        <span
                            className="px-6 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-sm font-medium">
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

                {/* Модалка сохраненных матчей */}
                <SavedMatchesModal
                    isOpen={isSavedMatchesModalOpen}
                    onClose={() => setIsSavedMatchesModalOpen(false)}
                    onApplyFilters={handleApplyFilters}
                />
            </div>
        </div>
    );
});
