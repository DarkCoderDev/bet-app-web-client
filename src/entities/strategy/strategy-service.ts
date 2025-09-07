import type { Strategy, Bet, StrategyStats, BetType } from '../match/types';

// Ключ для localStorage
const STORAGE_KEY = 'bet_strategies';

// Сервис для управления стратегиями
export class StrategyService {
    private static instance: StrategyService;
    private strategies: Strategy[] = [];

    private constructor() {
        this.loadFromStorage();
    }

    public static getInstance(): StrategyService {
        if (!StrategyService.instance) {
            StrategyService.instance = new StrategyService();
        }
        return StrategyService.instance;
    }

    // Загрузка данных из localStorage
    private loadFromStorage(): void {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                this.strategies = JSON.parse(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки стратегий:', error);
        }
    }

    // Сохранение данных в localStorage
    private saveToStorage(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.strategies));
        } catch (error) {
            console.error('Ошибка сохранения стратегий:', error);
        }
    }

    // Создание новой стратегии
    public createStrategy(name: string, bank: number): Strategy {
        const strategy: Strategy = {
            id: Date.now().toString(),
            name,
            bank,
            bets: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true
        };

        this.strategies.push(strategy);
        this.saveToStorage();
        return strategy;
    }

    // Получение всех стратегий
    public getAllStrategies(): Strategy[] {
        return [...this.strategies];
    }

    // Получение стратегии по ID
    public getStrategyById(id: string): Strategy | null {
        return this.strategies.find(s => s.id === id) || null;
    }

    // Обновление стратегии
    public updateStrategy(id: string, updates: Partial<Strategy>): boolean {
        const index = this.strategies.findIndex(s => s.id === id);
        if (index === -1) return false;

        this.strategies[index] = {
            ...this.strategies[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.saveToStorage();
        return true;
    }

    // Удаление стратегии
    public deleteStrategy(id: string): boolean {
        const index = this.strategies.findIndex(s => s.id === id);
        if (index === -1) return false;

        this.strategies.splice(index, 1);
        this.saveToStorage();
        return true;
    }

    // Добавление ставки к стратегии
    public addBetToStrategy(
        strategyId: string, 
        betType: BetType, 
        coefficient: number, 
        amount: number,
        matchInfo?: { teams: string; date: string; league: string }
    ): boolean {
        const strategy = this.getStrategyById(strategyId);
        if (!strategy) return false;

        const bet: Bet = {
            id: Date.now().toString(),
            betType,
            coefficient,
            amount,
            result: 'pending',
            matchInfo,
            timestamp: new Date().toISOString()
        };

        strategy.bets.push(bet);
        strategy.updatedAt = new Date().toISOString();
        this.saveToStorage();
        return true;
    }

    // Обновление результата ставки
    public updateBetResult(strategyId: string, betId: string, result: 'won' | 'lost'): boolean {
        const strategy = this.getStrategyById(strategyId);
        if (!strategy) return false;

        const bet = strategy.bets.find(b => b.id === betId);
        if (!bet) return false;

        bet.result = result;
        strategy.updatedAt = new Date().toISOString();
        this.saveToStorage();
        return true;
    }

    // Удаление ставки
    public removeBetFromStrategy(strategyId: string, betId: string): boolean {
        const strategy = this.getStrategyById(strategyId);
        if (!strategy) return false;

        const betIndex = strategy.bets.findIndex(b => b.id === betId);
        if (betIndex === -1) return false;

        strategy.bets.splice(betIndex, 1);
        strategy.updatedAt = new Date().toISOString();
        this.saveToStorage();
        return true;
    }

    // Расчет статистики стратегии
    public calculateStrategyStats(strategyId: string): StrategyStats | null {
        const strategy = this.getStrategyById(strategyId);
        if (!strategy) return null;

        const bets = strategy.bets;
        const totalBets = bets.length;
        const wonBets = bets.filter(b => b.result === 'won').length;
        const lostBets = bets.filter(b => b.result === 'lost').length;
        const pendingBets = bets.filter(b => b.result === 'pending').length;

        // Расчет прибыли/убытка
        let totalProfit = 0;
        let totalInvested = 0;

        bets.forEach(bet => {
            totalInvested += bet.amount;
            
            if (bet.result === 'won') {
                totalProfit += (bet.coefficient - 1) * bet.amount; // Прибыль во флетах
            } else if (bet.result === 'lost') {
                totalProfit -= bet.amount; // Убыток
            }
            // pending ставки не учитываются в расчете прибыли
        });

        const roi = strategy.bank > 0 ? (totalProfit / strategy.bank) * 100 : 0;
        const winRate = totalBets > 0 ? (wonBets / (wonBets + lostBets)) * 100 : 0;
        const averageBet = totalBets > 0 ? totalInvested / totalBets : 0;

        return {
            totalBets,
            wonBets,
            lostBets,
            pendingBets,
            totalProfit,
            roi,
            winRate,
            totalInvested,
            averageBet
        };
    }

    // Получение активных стратегий
    public getActiveStrategies(): Strategy[] {
        return this.strategies.filter(s => s.isActive);
    }

    // Активация/деактивация стратегии
    public toggleStrategyActive(id: string): boolean {
        const strategy = this.getStrategyById(id);
        if (!strategy) return false;

        strategy.isActive = !strategy.isActive;
        strategy.updatedAt = new Date().toISOString();
        this.saveToStorage();
        return true;
    }

    // Экспорт данных
    public exportData(): string {
        return JSON.stringify(this.strategies, null, 2);
    }

    // Импорт данных
    public importData(data: string): boolean {
        try {
            const imported = JSON.parse(data);
            if (Array.isArray(imported)) {
                this.strategies = imported;
                this.saveToStorage();
                return true;
            }
        } catch (error) {
            console.error('Ошибка импорта стратегий:', error);
        }
        return false;
    }

    // Очистка всех стратегий
    public clearAllStrategies(): void {
        this.strategies = [];
        this.saveToStorage();
    }
}
