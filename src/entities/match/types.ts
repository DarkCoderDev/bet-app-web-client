export type Match = [
    string, string, string, string, string, string, string, string, string,
    string, string, string, string, string, string, string, string, string, string
];

// Типы для сохраненных матчей
export interface SavedMatch {
    id: string;
    timestamp: string;
    matchData: {
        league: string;
        date: string;
        teams: string;
        score: string;
        firstHalfScore: string;
        p1: string;
        x: string;
        p2: string;
        handicap1_0: string;
        handicap2_0: string;
        oneToScore: string;
        twoToScore: string;
        over2_5: string;
        under2_5: string;
        over3: string;
        under3: string;
        bttsYes: string;
        bttsNo: string;
    };
    filterValues: Record<string, string>; // Сохраненные значения фильтров
    bet?: string; // Сумма ставки
    betResult?: 'won' | 'lost' | ''; // Результат ставки
    finalScore?: string; // Финальный счет
    isHighlighted?: boolean; // Подсвечен ли матч в таблице
}

// Типы для управления ставками
export interface BetManagement {
    savedMatches: SavedMatch[];
    highlightedMatches: Set<string>; // ID подсвеченных матчей
}
