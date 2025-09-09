import React, { useState, useEffect } from 'react';
import { StrategyService } from 'entities/strategy/strategy-service';
import { BetManagementService } from 'entities/match/bet-management';
import type { Strategy, Bet, BetType, StrategyStats, SavedMatch } from 'entities/match/types';
import { Button } from 'shared/ui/Button';
import { MatchSelectionModal } from './match-selection-modal';

interface StrategyBetsModalProps {
    isOpen: boolean;
    strategy: Strategy | null;
    onClose: () => void;
    onBetsUpdated: () => void;
}


export const StrategyBetsModal: React.FC<StrategyBetsModalProps> = ({
    isOpen,
    strategy,
    onClose,
    onBetsUpdated
}) => {
    const [bets, setBets] = useState<Bet[]>([]);
    const [stats, setStats] = useState<StrategyStats | null>(null);
    const [showMatchSelection, setShowMatchSelection] = useState(false);

    const strategyService = StrategyService.getInstance();
    const betService = BetManagementService.getInstance();

    useEffect(() => {
        if (strategy) {
            setBets(strategy.bets);
            const strategyStats = strategyService.calculateStrategyStats(strategy.id);
            setStats(strategyStats);
        }
    }, [strategy]);

    const handleMatchSelected = (savedMatchId: string, betType: BetType, coefficient: number, amount: number) => {
        if (!strategy) return;

        strategyService.addBetToStrategy(
            strategy.id,
            betType,
            coefficient,
            amount,
            savedMatchId
        );

        // Обновляем локальное состояние
        const updatedStrategy = strategyService.getStrategyById(strategy.id);
        if (updatedStrategy) {
            setBets(updatedStrategy.bets);
            const strategyStats = strategyService.calculateStrategyStats(strategy.id);
            setStats(strategyStats);
        }

        onBetsUpdated();
    };

    const handleUpdateBetResult = (betId: string, result: 'won' | 'lost') => {
        if (!strategy) return;

        strategyService.updateBetResult(strategy.id, betId, result);

        // Обновляем локальное состояние
        const updatedStrategy = strategyService.getStrategyById(strategy.id);
        if (updatedStrategy) {
            setBets(updatedStrategy.bets);
            const strategyStats = strategyService.calculateStrategyStats(strategy.id);
            setStats(strategyStats);
        }

        onBetsUpdated();
    };

    const handleRemoveBet = (betId: string) => {
        if (!strategy) return;

        if (window.confirm('Вы уверены, что хотите удалить эту ставку?')) {
            strategyService.removeBetFromStrategy(strategy.id, betId);

            // Обновляем локальное состояние
            const updatedStrategy = strategyService.getStrategyById(strategy.id);
            if (updatedStrategy) {
                setBets(updatedStrategy.bets);
                const strategyStats = strategyService.calculateStrategyStats(strategy.id);
                setStats(strategyStats);
            }

            onBetsUpdated();
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getResultColor = (result: string) => {
        switch (result) {
            case 'won': return 'text-green-400';
            case 'lost': return 'text-red-400';
            default: return 'text-yellow-400';
        }
    };

    const getResultText = (result: string) => {
        switch (result) {
            case 'won': return 'Выигрыш';
            case 'lost': return 'Проигрыш';
            default: return 'Ожидает';
        }
    };

    const getSavedMatchById = (savedMatchId: string): SavedMatch | null => {
        return betService.getSavedMatches().find(match => match.id === savedMatchId) || null;
    };

    if (!isOpen || !strategy) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        Управление ставками: {strategy.name}
                    </h2>
                    <Button variant="secondary" onClick={onClose}>
                        Закрыть
                    </Button>
                </div>

                {/* Статистика */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-700/30 rounded-lg">
                        <div className="text-center">
                            <div className="text-xl font-bold text-white">{stats.totalBets}</div>
                            <div className="text-slate-400 text-sm">Всего ставок</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-xl font-bold ${
                                stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {formatCurrency(stats.totalProfit)}
                            </div>
                            <div className="text-slate-400 text-sm">Прибыль</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-xl font-bold ${
                                stats.roi >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {stats.roi.toFixed(1)}%
                            </div>
                            <div className="text-slate-400 text-sm">ROI</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-blue-400">
                                {stats.winRate.toFixed(1)}%
                            </div>
                            <div className="text-slate-400 text-sm">Винрейт</div>
                        </div>
                    </div>
                )}

                {/* Кнопка добавления ставки */}
                <div className="mb-4">
                    <Button
                        variant="primary"
                        onClick={() => setShowMatchSelection(true)}
                    >
                        Добавить ставку
                    </Button>
                </div>

                {/* Список ставок */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Ставки ({bets.length})</h3>
                    
                    {bets.length === 0 ? (
                        <p className="text-slate-400 text-center py-4">
                            Ставки не найдены. Добавьте первую ставку.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {bets.map(bet => {
                                const savedMatch = getSavedMatchById(bet.savedMatchId);
                                return (
                                    <div
                                        key={bet.id}
                                        className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4">
                                                <span className="font-medium text-white">
                                                    {bet.betType}
                                                </span>
                                                <span className="text-slate-300">
                                                    {bet.coefficient}
                                                </span>
                                                <span className="text-slate-300">
                                                    {formatCurrency(bet.amount)}
                                                </span>
                                                <span className={`font-medium ${getResultColor(bet.result || 'pending')}`}>
                                                    {getResultText(bet.result || 'pending')}
                                                </span>
                                            </div>
                                            {savedMatch && (
                                                <div className="text-slate-500 text-sm mt-1">
                                                    {savedMatch.matchData.teams} - {savedMatch.matchData.date}
                                                    {savedMatch.matchData.league && ` (${savedMatch.matchData.league})`}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {bet.result === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        onClick={() => handleUpdateBetResult(bet.id, 'won')}
                                                    >
                                                        Выигрыш
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleUpdateBetResult(bet.id, 'lost')}
                                                    >
                                                        Проигрыш
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleRemoveBet(bet.id)}
                                            >
                                                Удалить
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Модальное окно выбора матча */}
            <MatchSelectionModal
                isOpen={showMatchSelection}
                onClose={() => setShowMatchSelection(false)}
                onMatchSelected={handleMatchSelected}
            />
        </div>
    );
};

