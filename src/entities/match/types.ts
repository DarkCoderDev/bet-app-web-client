export type Match = string[];

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
    betType?: string; // Тип ставки
    betResult?: 'won' | 'lost' | 'return' | ''; // Результат ставки
    finalScore?: string; // Финальный счет
    isHighlighted?: boolean; // Подсвечен ли матч в таблице
    lastSyncDate?: string; // Дата последней синхронизации с датасетом
    scoreSource?: 'dataset' | 'manual'; // Источник счета
}

// Типы для стратегий
export type BetType = 'П1' | 'Х' | 'П2' | 'Ф1(0)' | 'Ф2(0)' | '1 заб' | '2 заб' | 'ТБ2.5' | 'ТМ2.5' | 'ТБ3' | 'ТМ3' | 'Оз-да' | 'Оз-нет';

export interface Bet {
    id: string;
    betType: BetType;
    coefficient: number;
    amount: number; // Сумма ставки
    result?: 'won' | 'lost' | 'pending'; // Результат ставки
    savedMatchId: string; // ID сохраненного матча
    timestamp: string;
}

export interface Strategy {
    id: string;
    name: string;
    bank: number; // Размер банка
    bets: Bet[]; // Список ставок
    createdAt: string;
    updatedAt: string;
    isActive: boolean; // Активна ли стратегия
}

export interface StrategyStats {
    totalBets: number;
    wonBets: number;
    lostBets: number;
    pendingBets: number;
    totalProfit: number; // Общая прибыль/убыток
    roi: number; // ROI в процентах
    winRate: number; // Винрейт в процентах
    totalInvested: number; // Общая сумма ставок
    averageBet: number; // Средняя ставка
}

