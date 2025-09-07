import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BetManagementService } from 'entities/match/bet-management';
import type { SavedMatch } from 'entities/match/types';
import { Button } from 'shared/ui/Button';
import { RusMatchKeys, MatchIndexMap } from 'entities/match/consts';

export const SavedMatchesPage: React.FC = () => {
    const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([]);
    const [todayMatches, setTodayMatches] = useState<Record<string, SavedMatch[]>>({});
    const [historyMatches, setHistoryMatches] = useState<Record<string, SavedMatch[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    const betService = BetManagementService.getInstance();
    const navigate = useNavigate();

    const loadSavedMatches = () => {
        setIsLoading(true);
        try {
            // Получаем все матчи
            const allMatches = betService.getAllMatches();
            setSavedMatches(allMatches);
            
            // Группируем по табам
            const today = betService.getGroupedMatches('today');
            const history = betService.getGroupedMatches('history');
            
            setTodayMatches(today);
            setHistoryMatches(history);
        } catch (error) {
            console.error('Ошибка загрузки сохраненных матчей:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSavedMatches();
    }, []);

    const handleDeleteMatch = (id: string) => {
        if (window.confirm('Вы уверены, что хотите удалить этот матч?')) {
            betService.deleteMatch(id);
            loadSavedMatches();
        }
    };

    const handleUpdateBetResult = (id: string, result: 'won' | 'lost' | '') => {
        betService.updateMatch(id, { betResult: result });
        loadSavedMatches();
    };


    const handleUpdateScore = (id: string, score: string) => {
        betService.updateMatch(id, { 
            matchData: { 
                ...betService.getSavedMatches().find(m => m.id === id)?.matchData,
                score: score 
            } 
        });
        loadSavedMatches();
    };

    const handleUpdateBetType = (id: string, betType: string) => {
        betService.updateMatch(id, { betType });
        loadSavedMatches();
    };

    const handleApplyFilters = (filterValues: Record<string, string>) => {
        console.log('Applying filters:', filterValues);
        
        // Формируем URL параметры в правильном формате (индексы полей)
        const searchParams = new URLSearchParams();
        Object.entries(filterValues).forEach(([russianKey, value]) => {
            if (value && value.trim()) {
                // Находим соответствующий ключ в RusMatchKeys
                const matchKey = Object.entries(RusMatchKeys).find(([, name]) => name === russianKey)?.[0];
                if (matchKey) {
                    const idx = MatchIndexMap[matchKey as keyof typeof MatchIndexMap];
                    searchParams.set(String(idx), value.trim());
                    console.log(`Converting ${russianKey} (${matchKey}) to index ${idx} with value ${value.trim()}`);
                }
            }
        });
        
        console.log('Search params:', searchParams.toString());
        
        // Если есть параметры, переходим с ними
        if (searchParams.toString()) {
            navigate(`/?${searchParams.toString()}`);
        } else {
            console.log('No filters to apply, navigating to home page');
            navigate('/');
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('ru-RU', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    const getBetResultColor = (result: string) => {
        switch (result) {
            case 'won': return 'text-green-400 bg-green-500/20';
            case 'lost': return 'text-red-400 bg-red-500/20';
            default: return 'text-yellow-400 bg-yellow-500/20';
        }
    };

    const getBetResultText = (result: string) => {
        switch (result) {
            case 'won': return 'Выигрыш';
            case 'lost': return 'Проигрыш';
            default: return 'Не сыграно';
        }
    };

    const formatGroupTime = (matches: SavedMatch[]) => {
        if (matches.length === 0) return '';
        
        // Находим самый ранний матч в группе
        const earliestMatch = matches.reduce((earliest, current) => {
            const earliestTime = new Date(earliest.matchData.date).getTime();
            const currentTime = new Date(current.matchData.date).getTime();
            return currentTime < earliestTime ? current : earliest;
        });

        // Форматируем дату и время
        try {
            const date = new Date(earliestMatch.matchData.date);
            return date.toLocaleString('ru-RU', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return earliestMatch.matchData.date;
        }
    };

    const isScoreFromDataset = (match: SavedMatch) => {
        // Проверяем, есть ли счет и не является ли он пустым или placeholder
        const score = match.matchData.score;
        return score && score.trim() !== '' && score !== 'undefined' && score !== 'null' && score !== 'Не завершен';
    };

    const formatDateTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return {
                date: date.toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                }),
                time: date.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
        } catch {
            return { date: dateStr, time: '' };
        }
    };

    const getCardBackgroundColor = (betResult: string) => {
        switch (betResult) {
            case 'won': return 'bg-green-500/10 border-green-500/30';
            case 'lost': return 'bg-red-500/10 border-red-500/30';
            default: return 'bg-slate-700/30 border-slate-700';
        }
    };

    const getMatchStats = () => {
        const totalMatches = savedMatches.length;
        const todayCount = Object.values(todayMatches).flat().length;
        const historyCount = Object.values(historyMatches).flat().length;
        
        // Подсчет выигранных и проигранных матчей
        const wonMatches = savedMatches.filter(match => match.betResult === 'won').length;
        const lostMatches = savedMatches.filter(match => match.betResult === 'lost').length;
        
        return { 
            totalMatches, 
            todayMatches: todayCount, 
            historyMatches: historyCount,
            wonMatches,
            lostMatches
        };
    };

    const stats = getMatchStats();

    if (isLoading) {
        return (
            <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="loading-spinner mx-auto mb-4"></div>
                    <p className="text-slate-400">Загрузка сохраненных матчей...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
            <main className="flex-1 overflow-auto">
                <div className="container mx-auto px-4 py-3 pb-4">
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-white mb-1">Сохраненные матчи</h1>
                        <p className="text-slate-300 text-sm">
                            История и статистика ваших матчей
                        </p>
                    </div>

                    {/* Статистика */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">Всего:</span>
                            <span className="text-sm font-bold text-blue-400">{stats.totalMatches}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">Выиграно:</span>
                            <span className="text-sm font-bold text-green-400">{stats.wonMatches}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">Проиграно:</span>
                            <span className="text-sm font-bold text-red-400">{stats.lostMatches}</span>
                        </div>
                    </div>

                    {/* Список матчей */}
                    {stats.totalMatches === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Нет сохраненных матчей
                            </h3>
                            <p className="text-slate-400 mb-6">
                                Сохраните матчи из таблицы, чтобы они появились здесь
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => window.location.href = '/'}
                            >
                                Перейти к таблице матчей
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Сегодняшние матчи */}
                            {Object.keys(todayMatches).length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <h2 className="text-lg font-bold text-white">Сегодня</h2>
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                            {stats.todayMatches}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {Object.entries(todayMatches).map(([groupKey, matches]) => (
                                            <div key={groupKey} className="bg-slate-800/50 rounded border border-slate-700">
                                                <div className="p-2 border-b border-slate-700">
                                                    <h3 className="text-sm font-semibold text-white">
                                                        {formatGroupTime(matches)}
                                                    </h3>
                                                    <p className="text-slate-400 text-xs">
                                                        {matches.length} матч{matches.length === 1 ? '' : matches.length < 5 ? 'а' : 'ей'}
                                                    </p>
                                                </div>

                                                <div className="p-2">
                                                    <div className="space-y-2">
                                                        {matches.map((match) => {
                                                            const dateTime = formatDateTime(match.matchData.date);
                                                            const scoreFromDataset = isScoreFromDataset(match);
                                                            const cardBgColor = getCardBackgroundColor(match.betResult || '');
                                                            
                                                            return (
                                                                <div
                                                                    key={match.id}
                                                                    className={`p-2 rounded border ${cardBgColor}`}
                                                                >
                                                                    <div className="flex items-start gap-4">
                                                                        {/* Левая часть: Информация о матче */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="font-medium text-white text-xs truncate">
                                                                                {match.matchData.teams}
                                                                            </div>
                                                                            <div className="text-slate-400 text-xs mb-0.5">
                                                                                {match.matchData.league}
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="text-slate-300 text-xs">
                                                                                    {dateTime.date} {dateTime.time}
                                                                                </div>
                                                                                <div className="w-10">
                                                                                    {scoreFromDataset ? (
                                                                                        <div className="text-green-400 text-xs font-medium text-center">
                                                                                            {match.matchData.score}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <input
                                                                                            type="text"
                                                                                            value={match.matchData.score || ''}
                                                                                            onChange={(e) => handleUpdateScore(match.id, e.target.value)}
                                                                                            placeholder="Счет"
                                                                                            className="w-full px-1 py-0.5 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent text-center"
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                                <input
                                                                                    type="text"
                                                                                    value={match.betType || ''}
                                                                                    onChange={(e) => handleUpdateBetType(match.id, e.target.value)}
                                                                                    placeholder="Тип ставки"
                                                                                    className="w-20 px-1 py-0.5 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                                                                />
                                                                                <div className="flex gap-1">
                                                                                    <button
                                                                                        onClick={() => handleUpdateBetResult(match.id, 'won')}
                                                                                        className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                                                                                            match.betResult === 'won'
                                                                                                ? 'bg-green-600 text-white'
                                                                                                : 'bg-slate-700 text-slate-300 hover:bg-green-600 hover:text-white'
                                                                                        }`}
                                                                                    >
                                                                                        W
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleUpdateBetResult(match.id, 'lost')}
                                                                                        className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                                                                                            match.betResult === 'lost'
                                                                                                ? 'bg-red-600 text-white'
                                                                                                : 'bg-slate-700 text-slate-300 hover:bg-red-600 hover:text-white'
                                                                                        }`}
                                                                                    >
                                                                                        L
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Центральная часть: Фильтрация */}
                                                                        <div className="flex-1 flex justify-center">
                                                                            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded border border-slate-500/50">
                                                                                <div className="flex items-center">
                                                                                    {[
                                                                                        'Лига',
                                                                                        'П1',
                                                                                        'Х', 
                                                                                        'П2',
                                                                                        'Ф1(0)',
                                                                                        'Ф2(0)',
                                                                                        '1 заб',
                                                                                        '2 заб',
                                                                                        'ТБ2.5',
                                                                                        'ТМ2.5',
                                                                                        'ТБ3',
                                                                                        'ТМ3',
                                                                                        'Оз-да',
                                                                                        'Оз-нет'
                                                                                    ].map((columnKey, index) => {
                                                                                        const value = match.filterValues[columnKey]?.trim() || '';
                                                                                        return (
                                                                                            <div key={columnKey} className="flex items-center">
                                                                                                <div className="px-2 py-1 text-xs text-center min-w-[50px]">
                                                                                                    <div className="text-slate-300 font-semibold mb-0.5 leading-none whitespace-nowrap">
                                                                                                        {columnKey}
                                                                                                    </div>
                                                                                                    <div className="text-white font-bold text-xs leading-none">
                                                                                                        {value || '—'}
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="w-px h-6 bg-slate-500/30"></div>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                    {/* Кнопка применить фильтр */}
                                                                                    <div className="flex items-center">
                                                                                        <div className="px-2 py-1 text-xs text-center min-w-[50px]">
                                                                                            <div className="text-slate-300 font-semibold mb-0.5 leading-none whitespace-nowrap">
                                                                                                Действие
                                                                                            </div>
                                                                                            <button
                                                                                                onClick={() => handleApplyFilters(match.filterValues)}
                                                                                                className="px-1.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors relative z-10"
                                                                                            >
                                                                                                Применить
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Правая часть: Удаление */}
                                                                        <div className="flex items-center min-w-0">
                                                                            <button
                                                                                onClick={() => handleDeleteMatch(match.id)}
                                                                                className="px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Исторические матчи */}
                            {Object.keys(historyMatches).length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <h2 className="text-lg font-bold text-white">История</h2>
                                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                            {stats.historyMatches}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {Object.entries(historyMatches).map(([groupKey, matches]) => (
                                            <div key={groupKey} className="bg-slate-800/50 rounded border border-slate-700">
                                                <div className="p-2 border-b border-slate-700">
                                                    <h3 className="text-sm font-semibold text-white">
                                                        {groupKey}
                                                    </h3>
                                                    <p className="text-slate-400 text-xs">
                                                        {matches.length} матч{matches.length === 1 ? '' : matches.length < 5 ? 'а' : 'ей'}
                                                    </p>
                                                </div>

                                                <div className="p-2">
                                                    <div className="space-y-2">
                                                        {matches.map((match) => {
                                                            const dateTime = formatDateTime(match.matchData.date);
                                                            const scoreFromDataset = isScoreFromDataset(match);
                                                            const cardBgColor = getCardBackgroundColor(match.betResult || '');
                                                            
                                                            return (
                                                                <div
                                                                    key={match.id}
                                                                    className={`p-2 rounded border ${cardBgColor}`}
                                                                >
                                                                    <div className="flex items-start gap-4">
                                                                        {/* Левая часть: Информация о матче */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="font-medium text-white text-xs truncate">
                                                                                {match.matchData.teams}
                                                                            </div>
                                                                            <div className="text-slate-400 text-xs mb-0.5">
                                                                                {match.matchData.league}
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="text-slate-300 text-xs">
                                                                                    {dateTime.date} {dateTime.time}
                                                                                </div>
                                                                                <div className="w-10">
                                                                                    {scoreFromDataset ? (
                                                                                        <div className="text-green-400 text-xs font-medium text-center">
                                                                                            {match.matchData.score}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <input
                                                                                            type="text"
                                                                                            value={match.matchData.score || ''}
                                                                                            onChange={(e) => handleUpdateScore(match.id, e.target.value)}
                                                                                            placeholder="Счет"
                                                                                            className="w-full px-1 py-0.5 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent text-center"
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                                <input
                                                                                    type="text"
                                                                                    value={match.betType || ''}
                                                                                    onChange={(e) => handleUpdateBetType(match.id, e.target.value)}
                                                                                    placeholder="Тип ставки"
                                                                                    className="w-20 px-1 py-0.5 bg-slate-700 border border-slate-600 rounded text-white text-xs placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                                                                />
                                                                                <div className="flex gap-1">
                                                                                    <button
                                                                                        onClick={() => handleUpdateBetResult(match.id, 'won')}
                                                                                        className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                                                                                            match.betResult === 'won'
                                                                                                ? 'bg-green-600 text-white'
                                                                                                : 'bg-slate-700 text-slate-300 hover:bg-green-600 hover:text-white'
                                                                                        }`}
                                                                                    >
                                                                                        W
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleUpdateBetResult(match.id, 'lost')}
                                                                                        className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                                                                                            match.betResult === 'lost'
                                                                                                ? 'bg-red-600 text-white'
                                                                                                : 'bg-slate-700 text-slate-300 hover:bg-red-600 hover:text-white'
                                                                                        }`}
                                                                                    >
                                                                                        L
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Центральная часть: Фильтрация */}
                                                                        <div className="flex-1 flex justify-center">
                                                                            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded border border-slate-500/50">
                                                                                <div className="flex items-center">
                                                                                    {[
                                                                                        'Лига',
                                                                                        'П1',
                                                                                        'Х', 
                                                                                        'П2',
                                                                                        'Ф1(0)',
                                                                                        'Ф2(0)',
                                                                                        '1 заб',
                                                                                        '2 заб',
                                                                                        'ТБ2.5',
                                                                                        'ТМ2.5',
                                                                                        'ТБ3',
                                                                                        'ТМ3',
                                                                                        'Оз-да',
                                                                                        'Оз-нет'
                                                                                    ].map((columnKey, index) => {
                                                                                        const value = match.filterValues[columnKey]?.trim() || '';
                                                                                        return (
                                                                                            <div key={columnKey} className="flex items-center">
                                                                                                <div className="px-2 py-1 text-xs text-center min-w-[50px]">
                                                                                                    <div className="text-slate-300 font-semibold mb-0.5 leading-none whitespace-nowrap">
                                                                                                        {columnKey}
                                                                                                    </div>
                                                                                                    <div className="text-white font-bold text-xs leading-none">
                                                                                                        {value || '—'}
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="w-px h-6 bg-slate-500/30"></div>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                    {/* Кнопка применить фильтр */}
                                                                                    <div className="flex items-center">
                                                                                        <div className="px-2 py-1 text-xs text-center min-w-[50px]">
                                                                                            <div className="text-slate-300 font-semibold mb-0.5 leading-none whitespace-nowrap">
                                                                                                Действие
                                                                                            </div>
                                                                                            <button
                                                                                                onClick={() => handleApplyFilters(match.filterValues)}
                                                                                                className="px-1.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors relative z-10"
                                                                                            >
                                                                                                Применить
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Правая часть: Удаление */}
                                                                        <div className="flex items-center min-w-0">
                                                                            <button
                                                                                onClick={() => handleDeleteMatch(match.id)}
                                                                                className="px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
