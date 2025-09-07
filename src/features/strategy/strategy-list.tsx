import React, { useState, useEffect } from 'react';
import { StrategyService } from 'entities/strategy/strategy-service';
import type { Strategy, StrategyStats } from 'entities/match/types';
import { Button } from 'shared/ui/Button';

interface StrategyListProps {
    onStrategySelect?: (strategy: Strategy) => void;
}

export const StrategyList: React.FC<StrategyListProps> = ({ onStrategySelect }) => {
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [stats, setStats] = useState<Map<string, StrategyStats>>(new Map());
    const strategyService = StrategyService.getInstance();

    const loadStrategies = () => {
        const allStrategies = strategyService.getAllStrategies();
        setStrategies(allStrategies);

        // Расчет статистики для каждой стратегии
        const newStats = new Map<string, StrategyStats>();
        allStrategies.forEach(strategy => {
            const strategyStats = strategyService.calculateStrategyStats(strategy.id);
            if (strategyStats) {
                newStats.set(strategy.id, strategyStats);
            }
        });
        setStats(newStats);
    };

    useEffect(() => {
        loadStrategies();
    }, []);

    const handleDeleteStrategy = (id: string) => {
        if (window.confirm('Вы уверены, что хотите удалить эту стратегию?')) {
            strategyService.deleteStrategy(id);
            loadStrategies();
        }
    };

    const handleToggleActive = (id: string) => {
        strategyService.toggleStrategyActive(id);
        loadStrategies();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    if (strategies.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-slate-400 mb-4">Стратегии не найдены</p>
                <p className="text-slate-500 text-sm">Создайте первую стратегию для начала работы</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {strategies.map(strategy => {
                const strategyStats = stats.get(strategy.id);
                
                return (
                    <div
                        key={strategy.id}
                        className={`bg-slate-800/50 rounded-lg p-6 border transition-all duration-200 ${
                            strategy.isActive 
                                ? 'border-slate-600 hover:border-slate-500' 
                                : 'border-slate-700 opacity-60'
                        }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-semibold text-white">
                                        {strategy.name}
                                    </h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        strategy.isActive 
                                            ? 'bg-green-500/20 text-green-400' 
                                            : 'bg-slate-500/20 text-slate-400'
                                    }`}>
                                        {strategy.isActive ? 'Активна' : 'Неактивна'}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-sm">
                                    Банк: {formatCurrency(strategy.bank)}
                                </p>
                                <p className="text-slate-500 text-xs">
                                    Создана: {new Date(strategy.createdAt).toLocaleDateString('ru-RU')}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleToggleActive(strategy.id)}
                                >
                                    {strategy.isActive ? 'Деактивировать' : 'Активировать'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleDeleteStrategy(strategy.id)}
                                >
                                    Удалить
                                </Button>
                            </div>
                        </div>

                        {strategyStats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">
                                        {strategyStats.totalBets}
                                    </div>
                                    <div className="text-slate-400 text-sm">Ставок</div>
                                </div>

                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${
                                        strategyStats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {formatCurrency(strategyStats.totalProfit)}
                                    </div>
                                    <div className="text-slate-400 text-sm">Прибыль</div>
                                </div>

                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${
                                        strategyStats.roi >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {formatPercentage(strategyStats.roi)}
                                    </div>
                                    <div className="text-slate-400 text-sm">ROI</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-400">
                                        {formatPercentage(strategyStats.winRate)}
                                    </div>
                                    <div className="text-slate-400 text-sm">Винрейт</div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="primary"
                                onClick={() => onStrategySelect?.(strategy)}
                                className="flex-1"
                            >
                                Управлять ставками
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
