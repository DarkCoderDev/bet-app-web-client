import type { Match, SavedMatch } from './types';
import { MatchIndexMap, MatchKeys } from './consts';

// Ключи для localStorage
const STORAGE_KEYS = {
    SAVED_MATCHES: 'bet_saved_matches',
    HIGHLIGHTED_MATCHES: 'bet_highlighted_matches'
};

// Сервис для управления ставками
export class BetManagementService {
    private static instance: BetManagementService;
    private savedMatches: SavedMatch[] = [];
    private highlightedMatches: Set<string> = new Set();

    private constructor() {
        this.loadFromStorage();
    }

    public static getInstance(): BetManagementService {
        if (!BetManagementService.instance) {
            BetManagementService.instance = new BetManagementService();
        }
        return BetManagementService.instance;
    }

    // Загрузка данных из localStorage
    private loadFromStorage(): void {
        try {
            const savedMatchesData = localStorage.getItem(STORAGE_KEYS.SAVED_MATCHES);
            if (savedMatchesData) {
                this.savedMatches = JSON.parse(savedMatchesData);
            }

            const highlightedData = localStorage.getItem(STORAGE_KEYS.HIGHLIGHTED_MATCHES);
            if (highlightedData) {
                this.highlightedMatches = new Set(JSON.parse(highlightedData));
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }

    // Сохранение данных в localStorage
    private saveToStorage(): void {
        try {
            localStorage.setItem(STORAGE_KEYS.SAVED_MATCHES, JSON.stringify(this.savedMatches));
            localStorage.setItem(STORAGE_KEYS.HIGHLIGHTED_MATCHES, JSON.stringify(Array.from(this.highlightedMatches)));
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
        }
    }

    // Сохранение матча
    public saveMatch(match: Match, filterValues: Record<string, string>): SavedMatch {
        const matchData = {
            league: String(match[MatchIndexMap[MatchKeys.LEAGUE]] || ''),
            date: String(match[MatchIndexMap[MatchKeys.DATE]] || ''),
            teams: String(match[MatchIndexMap[MatchKeys.TEAMS]] || ''),
            score: String(match[MatchIndexMap[MatchKeys.SCORE]] || ''),
            firstHalfScore: String(match[MatchIndexMap[MatchKeys.FIRST_HALF_SCORE]] || ''),
            p1: String(match[MatchIndexMap[MatchKeys.P1]] || ''),
            x: String(match[MatchIndexMap[MatchKeys.X]] || ''),
            p2: String(match[MatchIndexMap[MatchKeys.P2]] || ''),
            handicap1_0: String(match[MatchIndexMap[MatchKeys.HANDICAP1_0]] || ''),
            handicap2_0: String(match[MatchIndexMap[MatchKeys.HANDICAP2_0]] || ''),
            oneToScore: String(match[MatchIndexMap[MatchKeys.ONE_TO_SCORE]] || ''),
            twoToScore: String(match[MatchIndexMap[MatchKeys.TWO_TO_SCORE]] || ''),
            over2_5: String(match[MatchIndexMap[MatchKeys.OVER2_5]] || ''),
            under2_5: String(match[MatchIndexMap[MatchKeys.UNDER2_5]] || ''),
            over3: String(match[MatchIndexMap[MatchKeys.OVER3]] || ''),
            under3: String(match[MatchIndexMap[MatchKeys.UNDER3]] || ''),
            bttsYes: String(match[MatchIndexMap[MatchKeys.BTTS_YES]] || ''),
            bttsNo: String(match[MatchIndexMap[MatchKeys.BTTS_NO]] || '')
        };

        // Проверяем, существует ли уже матч с такими же командами и датой
        const existingMatchIndex = this.savedMatches.findIndex(savedMatch =>
            savedMatch.matchData.teams === matchData.teams &&
            savedMatch.matchData.date === matchData.date
        );

        let savedMatch: SavedMatch;

        if (existingMatchIndex !== -1) {
            // Обновляем существующий матч
            savedMatch = {
                ...this.savedMatches[existingMatchIndex],
                filterValues,
                timestamp: new Date().toISOString()
            };
            this.savedMatches[existingMatchIndex] = savedMatch;
        } else {
            // Создаем новый матч
            savedMatch = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                matchData,
                filterValues,
                bet: '',
                betResult: '',
                finalScore: '',
                isHighlighted: false,
                lastSyncDate: new Date().toISOString(),
                scoreSource: 'dataset'
            };
            this.savedMatches.push(savedMatch);
        }

        this.saveToStorage();
        return savedMatch;
    }

    // Получение всех сохраненных матчей
    public getSavedMatches(): SavedMatch[] {
        return [...this.savedMatches];
    }

    public getHighlightedMatches(): Set<string> {
        return this.highlightedMatches;
    }

    // Получение матчей по табу (Today/History)
    public getMatchesByTab(tab: 'today' | 'history'): SavedMatch[] {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.savedMatches.filter(match => {
            if (tab === 'today') {
                // Парсим дату матча
                const matchDate = this.parseMatchDate(match.matchData.date);
                return matchDate >= today;
            } else {
                // History - прошедшие даты
                const matchDate = this.parseMatchDate(match.matchData.date);
                return matchDate < today;
            }
        });
    }

    // Группировка матчей по времени (для Today)
    public getGroupedMatches(tab: 'today' | 'history'): Record<string, SavedMatch[]> {
        const matches = this.getMatchesByTab(tab);

        if (tab === 'history') {
            // Для history группируем по дате и сортируем
            const groups: Record<string, SavedMatch[]> = {};
            
            // Сначала группируем по дате
            matches.forEach(match => {
                const dateKey = this.formatMatchDate(match.matchData.date);
                if (!groups[dateKey]) {
                    groups[dateKey] = [];
                }
                groups[dateKey].push(match);
            });
            
            // Сортируем матчи внутри каждой группы по времени
            Object.keys(groups).forEach(dateKey => {
                groups[dateKey].sort((a, b) => {
                    const timeA = this.parseMatchTime(a.matchData.date);
                    const timeB = this.parseMatchTime(b.matchData.date);
                    return timeA - timeB;
                });
            });
            
            // Сортируем группы по дате (от новых к старым)
            const sortedGroups: Record<string, SavedMatch[]> = {};
            const sortedKeys = Object.keys(groups).sort((a, b) => {
                const dateA = this.parseMatchDate(groups[a][0].matchData.date);
                const dateB = this.parseMatchDate(groups[b][0].matchData.date);
                return dateB.getTime() - dateA.getTime(); // Сортировка от новых к старым
            });
            
            sortedKeys.forEach(key => {
                sortedGroups[key] = groups[key];
            });
            
            return sortedGroups;
        }

        // Для today группируем по времени с разницей до 30 минут
        const timeGroups: Array<{
            timestamp: string;
            matchDate: Date;
            matchTime: number;
            matches: SavedMatch[];
        }> = [];

        // Сортируем матчи по дате и времени
        const sortedMatches = [...matches].sort((a, b) => {
            const dateA = this.parseMatchDate(a.matchData.date);
            const dateB = this.parseMatchDate(b.matchData.date);
            if (dateA.getTime() !== dateB.getTime()) {
                return dateA.getTime() - dateB.getTime();
            }
            const timeA = this.parseMatchTime(a.matchData.date);
            const timeB = this.parseMatchTime(b.matchData.date);
            return timeA - timeB;
        });

        sortedMatches.forEach(match => {
            const matchDate = this.parseMatchDate(match.matchData.date);
            const matchTime = this.parseMatchTime(match.matchData.date);

            let addedToGroup = false;

            // Ищем подходящую группу
            for (let i = 0; i < timeGroups.length; i++) {
                const group = timeGroups[i];
                if (group.matchDate.getTime() === matchDate.getTime() &&
                    Math.abs(matchTime - group.matchTime) <= 30) {
                    group.matches.push(match);
                    addedToGroup = true;
                    break;
                }
            }

            if (!addedToGroup) {
                timeGroups.push({
                    timestamp: match.timestamp,
                    matchDate,
                    matchTime,
                    matches: [match]
                });
            }
        });

        // Сортируем группы по времени
        timeGroups.sort((a, b) => {
            if (a.matchDate.getTime() !== b.matchDate.getTime()) {
                return a.matchDate.getTime() - b.matchDate.getTime();
            }
            return a.matchTime - b.matchTime;
        });
        

        // Формируем ключи для групп
        const groupedMatches: Record<string, SavedMatch[]> = {};
        timeGroups.forEach((group, index) => {
            groupedMatches[`group_${index}`] = group.matches;
        });

        return groupedMatches;
    }

    // Обновление матча
    public updateMatch(id: string, updates: Partial<SavedMatch>): boolean {
        const matchIndex = this.savedMatches.findIndex(match => match.id === id);
        if (matchIndex === -1) return false;

        this.savedMatches[matchIndex] = { ...this.savedMatches[matchIndex], ...updates };
        this.saveToStorage();
        return true;
    }

    // Удаление матча
    public deleteMatch(id: string): boolean {
        const matchIndex = this.savedMatches.findIndex(match => match.id === id);
        if (matchIndex === -1) return false;

        this.savedMatches.splice(matchIndex, 1);
        this.highlightedMatches.delete(id);
        this.saveToStorage();
        return true;
    }

    // Подсветка/снятие подсветки матча
    public toggleHighlight(id: string): boolean {
        if (this.highlightedMatches.has(id)) {
            this.highlightedMatches.delete(id);
        } else {
            this.highlightedMatches.add(id);
        }
        this.saveToStorage();
        return this.highlightedMatches.has(id);
    }

    // Проверка, подсвечен ли матч
    public isHighlighted(id: string): boolean {
        return this.highlightedMatches.has(id);
    }

    // Синхронизация счета с датасетом
    public syncWithDataset(dataset: Match[]): { updated: number; errors: number } {
        let updated = 0;
        let errors = 0;

        this.savedMatches.forEach(savedMatch => {
            try {
                // Ищем соответствующий матч в датасете
                const datasetMatch = dataset.find(match => {
                    const datasetTeams = String(match[MatchIndexMap[MatchKeys.TEAMS]] || '');
                    const datasetDate = String(match[MatchIndexMap[MatchKeys.DATE]] || '');
                    
                    return datasetTeams === savedMatch.matchData.teams && 
                           datasetDate === savedMatch.matchData.date;
                });

                if (datasetMatch) {
                    const datasetScore = String(datasetMatch[MatchIndexMap[MatchKeys.SCORE]] || '');
                    const currentScore = savedMatch.matchData.score;
                    
                    // Обновляем счет только если он изменился и не был изменен вручную
                    if (datasetScore !== currentScore && savedMatch.scoreSource !== 'manual') {
                        savedMatch.matchData.score = datasetScore;
                        savedMatch.lastSyncDate = new Date().toISOString();
                        savedMatch.scoreSource = 'dataset';
                        updated++;
                    }
                }
            } catch (error) {
                console.error('Ошибка синхронизации матча:', error);
                errors++;
            }
        });

        if (updated > 0) {
            this.saveToStorage();
        }

        return { updated, errors };
    }

    // Обновление источника счета при ручном изменении
    public markScoreAsManual(matchId: string): void {
        const match = this.savedMatches.find(m => m.id === matchId);
        if (match) {
            match.scoreSource = 'manual';
            match.lastSyncDate = new Date().toISOString();
            this.saveToStorage();
        }
    }

    // Экспорт данных
    public exportData(): string {
        return JSON.stringify({
            savedMatches: this.savedMatches,
            highlightedMatches: Array.from(this.highlightedMatches)
        }, null, 2);
    }

    // Импорт данных
    public importData(data: string): boolean {
        try {
            const imported = JSON.parse(data);
            if (imported.savedMatches && Array.isArray(imported.savedMatches)) {
                this.savedMatches = imported.savedMatches;
                if (imported.highlightedMatches && Array.isArray(imported.highlightedMatches)) {
                    this.highlightedMatches = new Set(imported.highlightedMatches);
                }
                this.saveToStorage();
                return true;
            }
        } catch (error) {
            console.error('Ошибка импорта:', error);
        }
        return false;
    }

    // Применение сохраненных фильтров
    public getFilterValues(id: string): Record<string, string> | null {
        const match = this.savedMatches.find(m => m.id === id);
        return match ? match.filterValues : null;
    }

    // Получение всех матчей для экспорта
    public getAllMatches(): SavedMatch[] {
        return [...this.savedMatches];
    }

    // Восстановление матча из данных
    public restoreMatch(matchData: SavedMatch): void {
        // Проверяем, существует ли уже матч с таким ID
        const existingIndex = this.savedMatches.findIndex(m => m.id === matchData.id);
        if (existingIndex !== -1) {
            // Обновляем существующий
            this.savedMatches[existingIndex] = matchData;
        } else {
            // Добавляем новый
            this.savedMatches.push(matchData);
        }
        this.saveToStorage();
    }

    // Очистка всех матчей
    public clearAllMatches(): void {
        this.savedMatches = [];
        this.highlightedMatches.clear();
        this.saveToStorage();
    }

    // Вспомогательные методы для парсинга дат
    private parseMatchDate(dateStr: string): Date {
        if (!dateStr || !dateStr.includes(' ')) return new Date();

        const datePart = dateStr.split(' ')[0]; // "30.08.25"
        const dateParts = datePart.split('.');
        if (dateParts.length === 3) {
            const year = 2000 + parseInt(dateParts[2]);
            const month = parseInt(dateParts[1]) - 1;
            const day = parseInt(dateParts[0]);
            return new Date(year, month, day);
        }
        return new Date();
    }

    private parseMatchTime(dateStr: string): number {
        if (!dateStr || !dateStr.includes(' ')) return 0;

        const timePart = dateStr.split(' ')[1]; // "17:00"
        const [hours, minutes] = timePart.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private formatMatchDate(dateStr: string): string {
        const date = this.parseMatchDate(dateStr);
        return date.toLocaleDateString('ru-RU', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }


    // Синхронизация сохраненных матчей с актуальным датасетом
    public syncSavedMatchesWithDataset(currentDataset: Match[]): void {
        if (!currentDataset || currentDataset.length === 0) {
            return;
        }

        // Создаем Map для быстрого поиска матчей в актуальном датасете
        const datasetMap = new Map<string, Match>();

        currentDataset.forEach(match => {
            const teams = String(match[MatchIndexMap[MatchKeys.TEAMS]] || '');
            const date = String(match[MatchIndexMap[MatchKeys.DATE]] || '');
            const key = `${teams}_${date}`;
            datasetMap.set(key, match);
        });

        // Обновляем сохраненные матчи
        let hasUpdates = false;

        this.savedMatches.forEach(savedMatch => {
            const key = `${savedMatch.matchData.teams}_${savedMatch.matchData.date}`;
            const currentMatch = datasetMap.get(key);

            if (currentMatch) {
                const currentScore = String(currentMatch[MatchIndexMap[MatchKeys.SCORE]] || '');

                // Обновляем счет только если он не пустой в актуальном датасете
                if (currentScore && currentScore.trim() !== '') {
                    savedMatch.matchData.score = currentScore;
                    hasUpdates = true;
                }
            }
        });

        // Сохраняем изменения, если были обновления
        if (hasUpdates) {
            this.saveToStorage();
        }
    }
}
