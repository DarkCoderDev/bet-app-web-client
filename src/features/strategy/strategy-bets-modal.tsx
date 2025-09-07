import React, { useState, useEffect } from 'react';
import { StrategyService } from 'entities/strategy/strategy-service';
import type { Strategy, Bet, BetType, StrategyStats } from 'entities/match/types';
import { Button } from 'shared/ui/Button';

interface StrategyBetsModalProps {
    isOpen: boolean;
    strategy: Strategy | null;
    onClose: () => void;
    onBetsUpdated: () => void;
}

const BET_TYPES: BetType[] = [
    'П1', 'Х', 'П2', 'Ф1(0)', 'Ф2(0)', '1 заб', '2 заб', 
    'ТБ2.5', 'ТМ2.5', 'ТБ3', 'ТМ3', 'Оз-да', 'Оз-нет'
];

export const StrategyBetsModal: React.FC<StrategyBetsModalProps> = ({
    isOpen,
    strategy,
    onClose,
    onBetsUpdated
}) => {
    const [bets, setBets] = useState<Bet[]>([]);
    const [stats, setStats] = useState<StrategyStats | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newBet, setNewBet] = useState({
        betType: 'П1' as BetType,
        coefficient: '',
        amount: ''
    });

    const strategyService = StrategyService.getInstance();

    useEffect(() => {
        if (strategy) {
            setBets(strategy.bets);
            const strategyStats = strategyService.calculateStrategyStats(strategy.id);
            setStats(strategyStats);
        }
    }, [strategy]);

    const handleAddBet = () => {
        if (!strategy) return;

        const coefficient = parseFloat(newBet.coefficient);
        const amount = parseFloat(newBet.amount);

        if (isNaN(coefficient) || isNaN(amount) || coefficient <= 1 || amount <= 0) {
            return;
        }

        strategyService.addBetToStrategy(
            strategy.id,
            newBet.betType,
            coefficient,
            amount
        );

        // Обновляем локальное состояние
        const updatedStrategy = strategyService.getStrategyById(strategy.id);
        if (updatedStrategy) {
            setBets(updatedStrategy.bets);
            const strategyStats = strategyService.calculateStrategyStats(strategy.id);
            setStats(strategyStats);
        }

        setNewBet({ betType: 'П1', coefficient: '', amount: '' });
        setShowAddForm(false);
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
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? 'Отмена' : 'Добавить ставку'}
                    </Button>
                </div>

                {/* Форма добавления ставки */}
                {showAddForm && (
                    <div className="mb-6 p-4 bg-slate-700/30 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-4">Новая ставка</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Тип ставки
                                </label>
                                <select
                                    value={newBet.betType}
                                    onChange={(e) => setNewBet({ ...newBet, betType: e.target.value as BetType })}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {BET_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Коэффициент
                                </label>
                                <input
                                    type="number"
                                    value={newBet.coefficient}
                                    onChange={(e) => setNewBet({ ...newBet, coefficient: e.target.value })}
                                    placeholder="1.50"
                                    min="1.01"
                                    step="0.01"
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Сумма ставки (₽)
                                </label>
                                <input
                                    type="number"
                                    value={newBet.amount}
                                    onChange={(e) => setNewBet({ ...newBet, amount: e.target.value })}
                                    placeholder="1000"
                                    min="1"
                                    step="1"
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <Button
                                variant="primary"
                                onClick={handleAddBet}
                                disabled={!newBet.coefficient || !newBet.amount}
                            >
                                Добавить ставку
                            </Button>
                        </div>
                    </div>
                )}

                {/* Список ставок */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Ставки ({bets.length})</h3>
                    
                    {bets.length === 0 ? (
                        <p className="text-slate-400 text-center py-4">
                            Ставки не найдены. Добавьте первую ставку.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {bets.map(bet => (
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
                                        {bet.matchInfo && (
                                            <div className="text-slate-500 text-sm mt-1">
                                                {bet.matchInfo.teams} - {bet.matchInfo.date}
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
