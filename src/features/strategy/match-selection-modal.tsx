import React, { useState, useEffect } from 'react';
import { BetManagementService } from 'entities/match/bet-management';
import type { SavedMatch, BetType } from 'entities/match/types';
import { Button } from 'shared/ui/Button';

interface MatchSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMatchSelected: (savedMatchId: string, betType: BetType, coefficient: number, amount: number) => void;
}

const BET_TYPES: BetType[] = [
    'П1', 'Х', 'П2', 'Ф1(0)', 'Ф2(0)', '1 заб', '2 заб', 
    'ТБ2.5', 'ТМ2.5', 'ТБ3', 'ТМ3', 'Оз-да', 'Оз-нет'
];

export const MatchSelectionModal: React.FC<MatchSelectionModalProps> = ({
    isOpen,
    onClose,
    onMatchSelected
}) => {
    const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([]);
    const [selectedMatchId, setSelectedMatchId] = useState<string>('');
    const [betType, setBetType] = useState<BetType>('П1');
    const [coefficient, setCoefficient] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const betService = BetManagementService.getInstance();

    useEffect(() => {
        if (isOpen) {
            const matches = betService.getSavedMatches();
            setSavedMatches(matches);
        }
    }, [isOpen]);

    const filteredMatches = savedMatches.filter(match =>
        match.matchData.teams.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.matchData.league.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = () => {
        const coeff = parseFloat(coefficient);
        const betAmount = parseFloat(amount);

        if (!selectedMatchId || isNaN(coeff) || isNaN(betAmount) || coeff <= 1 || betAmount <= 0) {
            return;
        }

        onMatchSelected(selectedMatchId, betType, coeff, betAmount);
        handleClose();
    };

    const handleClose = () => {
        setSelectedMatchId('');
        setBetType('П1');
        setCoefficient('');
        setAmount('');
        setSearchTerm('');
        onClose();
    };

    const selectedMatch = savedMatches.find(match => match.id === selectedMatchId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        Выбор матча для ставки
                    </h2>
                    <Button variant="secondary" onClick={handleClose}>
                        Закрыть
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Выбор матча */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Выберите матч</h3>
                        
                        {/* Поиск */}
                        <div className="mb-4">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Поиск по командам или лиге..."
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Список матчей */}
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {filteredMatches.length === 0 ? (
                                <p className="text-slate-400 text-center py-4">
                                    {searchTerm ? 'Матчи не найдены' : 'Сохраненные матчи отсутствуют'}
                                </p>
                            ) : (
                                filteredMatches.map(match => (
                                    <div
                                        key={match.id}
                                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                            selectedMatchId === match.id
                                                ? 'bg-blue-600/20 border-blue-500'
                                                : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                                        }`}
                                        onClick={() => setSelectedMatchId(match.id)}
                                    >
                                        <div className="font-medium text-white text-sm">
                                            {match.matchData.teams}
                                        </div>
                                        <div className="text-slate-400 text-xs mt-1">
                                            {match.matchData.league} • {match.matchData.date}
                                        </div>
                                        {match.matchData.score && (
                                            <div className="text-green-400 text-xs mt-1">
                                                Счет: {match.matchData.score}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Параметры ставки */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Параметры ставки</h3>
                        
                        {selectedMatch && (
                            <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
                                <div className="text-white font-medium">
                                    {selectedMatch.matchData.teams}
                                </div>
                                <div className="text-slate-400 text-sm">
                                    {selectedMatch.matchData.league} • {selectedMatch.matchData.date}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Тип ставки
                                </label>
                                <select
                                    value={betType}
                                    onChange={(e) => setBetType(e.target.value as BetType)}
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
                                    value={coefficient}
                                    onChange={(e) => setCoefficient(e.target.value)}
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
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="1000"
                                    min="1"
                                    step="1"
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={!selectedMatchId || !coefficient || !amount}
                                className="w-full"
                            >
                                Добавить ставку
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
