import React, { useState, useEffect } from 'react';
import { StrategyService } from 'entities/strategy/strategy-service';
import { CreateStrategyModal } from 'features/strategy/create-strategy-modal';
import { StrategyList } from 'features/strategy/strategy-list';
import { StrategyBetsModal } from 'features/strategy/strategy-bets-modal';
import type { Strategy } from 'entities/match/types';
import { Button } from 'shared/ui/Button';

export const FinanceManagerPage: React.FC = () => {
    const [overallStats, setOverallStats] = useState<{
        totalBank: number;
        totalProfit: number;
        totalROI: number;
        totalBets: number;
    }>({
        totalBank: 0,
        totalProfit: 0,
        totalROI: 0,
        totalBets: 0
    });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
    const [isBetsModalOpen, setIsBetsModalOpen] = useState(false);

    const strategyService = StrategyService.getInstance();

    const loadStrategies = () => {
        const allStrategies = strategyService.getAllStrategies();

        // Расчет общей статистики
        let totalBank = 0;
        let totalProfit = 0;
        let totalBets = 0;

        allStrategies.forEach(strategy => {
            totalBank += strategy.bank;
            totalBets += strategy.bets.length;
            
            const stats = strategyService.calculateStrategyStats(strategy.id);
            if (stats) {
                totalProfit += stats.totalProfit;
            }
        });

        const totalROI = totalBank > 0 ? (totalProfit / totalBank) * 100 : 0;

        setOverallStats({
            totalBank,
            totalProfit,
            totalROI,
            totalBets
        });
    };

    useEffect(() => {
        loadStrategies();
    }, []);

    const handleStrategyCreated = () => {
        loadStrategies();
    };

    const handleStrategySelect = (strategy: Strategy) => {
        setSelectedStrategy(strategy);
        setIsBetsModalOpen(true);
    };

    const handleBetsUpdated = () => {
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

    return (
        <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
            {/* Main Content - скроллится */}
            <main className="flex-1 overflow-auto">
                <div className="container mx-auto px-4 py-6 pb-8">
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2">Финансовый менеджер</h1>
                                <p className="text-slate-300 text-lg">
                                    Управление стратегиями и анализ прибыльности
                                </p>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="hidden md:flex items-center gap-3">
                                <Button
                                    variant="primary"
                                    onClick={() => setIsCreateModalOpen(true)}
                                >
                                    Создать стратегию
                                </Button>
                                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">
                                    Экспорт отчета
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Общая статистика */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                            <h3 className="text-xl font-semibold text-white mb-4">Общий банк</h3>
                            <div className="text-3xl font-bold text-green-400 mb-2">
                                {formatCurrency(overallStats.totalBank)}
                            </div>
                            <div className="text-slate-400 text-sm">Сумма всех банков</div>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                            <h3 className="text-xl font-semibold text-white mb-4">Общая прибыль</h3>
                            <div className={`text-3xl font-bold mb-2 ${
                                overallStats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {formatCurrency(overallStats.totalProfit)}
                            </div>
                            <div className="text-slate-400 text-sm">По всем стратегиям</div>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                            <h3 className="text-xl font-semibold text-white mb-4">Общий ROI</h3>
                            <div className={`text-3xl font-bold mb-2 ${
                                overallStats.totalROI >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {overallStats.totalROI.toFixed(1)}%
                            </div>
                            <div className="text-slate-400 text-sm">Возврат инвестиций</div>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                            <h3 className="text-xl font-semibold text-white mb-4">Всего ставок</h3>
                            <div className="text-3xl font-bold text-blue-400 mb-2">
                                {overallStats.totalBets}
                            </div>
                            <div className="text-slate-400 text-sm">По всем стратегиям</div>
                        </div>
                    </div>

                    {/* Кнопка создания стратегии для мобильных */}
                    <div className="md:hidden mb-6">
                        <Button
                            variant="primary"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full"
                        >
                            Создать стратегию
                        </Button>
                    </div>

                    {/* Список стратегий */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Мои стратегии</h2>
                        <StrategyList onStrategySelect={handleStrategySelect} />
                    </div>

                </div>
            </main>

            {/* Модалки */}
            <CreateStrategyModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onStrategyCreated={handleStrategyCreated}
            />

            <StrategyBetsModal
                isOpen={isBetsModalOpen}
                strategy={selectedStrategy}
                onClose={() => {
                    setIsBetsModalOpen(false);
                    setSelectedStrategy(null);
                }}
                onBetsUpdated={handleBetsUpdated}
            />
        </div>
    );
};
