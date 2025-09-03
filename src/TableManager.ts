import type { Row } from './types';

export class TableManager {
    private data: Row[];
    private lcCache: Map<string, string[]> = new Map();
    private batchFilters: Map<string, string> = new Map();
    private isBatching = false;
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    
    constructor(data: Row[]) {
        this.data = data;
        this.buildLazyCache();
    }
    
    // Ленивый кэш для колонок
    private buildLazyCache() {
        this.lcCache.clear();
        const columnCount = this.data[0]?.length || 0;
        
        for (let colIdx = 0; colIdx < columnCount; colIdx++) {
            this.lcCache.set(colIdx.toString(), []);
        }
    }
    
    // Получить очищенное значение для колонки
    private getCleanValue(rowIdx: number, colIdx: number): string {
        const cacheKey = colIdx.toString();
        let columnCache = this.lcCache.get(cacheKey);
        
        if (!columnCache) {
            columnCache = [];
            this.lcCache.set(cacheKey, columnCache);
        }
        
        if (!columnCache[rowIdx]) {
            const rawValue = String(this.data[rowIdx]?.[colIdx] || '');
            columnCache[rowIdx] = this.stripTags(rawValue).toLowerCase();
        }
        
        return columnCache[rowIdx];
    }
    
    private stripTags(html: string): string {
        return html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();
    }
    
    // Начать батч
    beginBatch() {
        this.isBatching = true;
        this.batchFilters.clear();
    }
    
    // Применить фильтр в батче
    applyFilter(columnId: string, value: string) {
        if (this.isBatching) {
            this.batchFilters.set(columnId, value);
        }
    }
    
    // Завершить батч с debounce
    endBatch(callback: (result: { pageRows: Row[], total: number }) => void) {
        this.isBatching = false;
        
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        this.debounceTimer = setTimeout(() => {
            const result = this.processFilters();
            callback(result);
        }, 200);
    }
    
    // Сбросить все фильтры
    resetSearch() {
        this.batchFilters.clear();
        return this.processFilters();
    }
    
    // Применить набор фильтров
    applyFilters(filters: Map<string, string>) {
        this.batchFilters = new Map(filters);
        return this.processFilters();
    }
    
    // Основной процесс фильтрации
    private processFilters(): { pageRows: Row[], total: number } {
        const pageSize = 30;
        const pageIndex = 0; // Пока фиксированная первая страница
        
        // Получаем индексы колонок
        const columnMap: Record<string, number> = {
            'ДН': 0, 'Чемпионат': 1, 'Дата': 2, 'Счет': 3, '1 Тайм': 4,
            'Матч': 5, 'п1': 6, 'х': 7, 'п2': 8, 'Ф1(0)': 9, 'Ф2(0)': 10,
            '1 заб': 11, '2 заб': 12, 'ТБ2.5': 13, 'ТМ2.5': 14,
            'ТБ3': 15, 'ТМ3': 16, 'ОЗ-Да': 17, 'ОЗ-Нет': 18
        };
        
        // Фильтрация
        let filteredIndices: number[] = [];
        
        for (let rowIdx = 0; rowIdx < this.data.length; rowIdx++) {
            let rowPasses = true;
            
            for (const [columnId, filterValue] of this.batchFilters) {
                if (!filterValue.trim()) continue;
                
                const colIdx = columnMap[columnId];
                if (colIdx === undefined) continue;
                
                const cleanValue = this.getCleanValue(rowIdx, colIdx);
                const filterStr = filterValue.toLowerCase();
                
                if (!cleanValue.includes(filterStr)) {
                    rowPasses = false;
                    break;
                }
            }
            
            if (rowPasses) {
                filteredIndices.push(rowIdx);
            }
        }
        
        // Сортировка по epoch (если есть фильтр по дате)
        if (this.batchFilters.has('Дата')) {
            filteredIndices.sort((a, b) => {
                const getEpoch = (rowIdx: number) => {
                    const dateStr = String(this.data[rowIdx]?.[2] || '');
                    const match = dateStr.match(/<span[^>]*>(\d+)<\/span>/);
                    return match ? parseInt(match[1]) : 0;
                };
                
                const epochA = getEpoch(a);
                const epochB = getEpoch(b);
                return epochB - epochA; // Свежие в начале
            });
        }
        
        // Пагинация
        const total = filteredIndices.length;
        const startIdx = pageIndex * pageSize;
        const endIdx = startIdx + pageSize;
        const pageIndices = filteredIndices.slice(startIdx, endIdx);
        
        const pageRows = pageIndices.map(idx => this.data[idx]);
        
        return { pageRows, total };
    }
    
    // Очистить кэш при изменении данных
    updateData(newData: Row[]) {
        this.data = newData;
        this.buildLazyCache();
    }
}
