import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BetManagementService } from 'entities/match/bet-management';
import type { SavedMatch } from 'entities/match/types';
import { Button } from 'shared/ui/Button';
import { RusMatchKeys, MatchIndexMap } from 'entities/match/consts';
import { getDataSet } from 'entities/match/api';
import toast from 'react-hot-toast';

export const SavedMatchesPage: React.FC = () => {
    const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([]);
    const [todayMatches, setTodayMatches] = useState<Record<string, SavedMatch[]>>({});
    const [historyMatches, setHistoryMatches] = useState<Record<string, SavedMatch[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const betService = BetManagementService.getInstance();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        const current = betService.getSavedMatches().find(m => m.id === id)?.betResult || '';
        const next = current === result ? '' : result;
        betService.updateMatch(id, { betResult: next });
        loadSavedMatches();
    };


    const handleUpdateScore = (id: string, score: string) => {
        const current = betService.getSavedMatches().find(m => m.id === id)?.matchData;
        if (!current) return;
        betService.updateMatch(id, {
            matchData: {
                league: current.league,
                date: current.date,
                teams: current.teams,
                score: score,
                firstHalfScore: current.firstHalfScore,
                p1: current.p1,
                x: current.x,
                p2: current.p2,
                handicap1_0: current.handicap1_0,
                handicap2_0: current.handicap2_0,
                oneToScore: current.oneToScore,
                twoToScore: current.twoToScore,
                over2_5: current.over2_5,
                under2_5: current.under2_5,
                over3: current.over3,
                under3: current.under3,
                bttsYes: current.bttsYes,
                bttsNo: current.bttsNo,
            }
        });
        // Помечаем счет как введенный вручную
        betService.markScoreAsManual(id);
        loadSavedMatches();
    };

    // Функция синхронизации с датасетом
    const handleSyncWithDataset = async () => {
        setIsSyncing(true);
        try {
            // Загружаем датасет при нажатии кнопки
            const currentDataset = await getDataSet();

            const result = betService.syncWithDataset(currentDataset);

            if (result.updated > 0) {
                loadSavedMatches();
                toast.success(`Синхронизировано ${result.updated} матчей`);
            } else {
                toast('Нет матчей для обновления');
            }

            if (result.errors > 0) {
                toast.error(`Ошибок при синхронизации: ${result.errors}`);
            }
        } catch (error) {
            console.error('Ошибка синхронизации:', error);
            toast.error('Ошибка при загрузке датасета или синхронизации');
        } finally {
            setIsSyncing(false);
        }
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

    // Функция экспорта данных в JSON
    const handleExportData = () => {
        try {
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                matches: savedMatches
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `saved-matches-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(`Экспортировано ${savedMatches.length} матчей`);
        } catch (error) {
            console.error('Ошибка экспорта:', error);
            toast.error('Ошибка при экспорте данных');
        }
    };

    // Функция импорта данных из JSON
    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const importData = JSON.parse(content);

                // Валидация структуры данных
                if (!importData.matches || !Array.isArray(importData.matches)) {
                    throw new Error('Неверный формат файла');
                }

                // Валидация каждого матча
                const validMatches = importData.matches.filter((match: any) => {
                    return match.id &&
                           match.timestamp &&
                           match.matchData &&
                           match.filterValues &&
                           typeof match.matchData === 'object' &&
                           typeof match.filterValues === 'object';
                });

                if (validMatches.length === 0) {
                    throw new Error('В файле нет валидных матчей');
                }

                // Объединяем с существующими данными
                const existingMatches = betService.getSavedMatches();
                const existingIds = new Set(existingMatches.map(m => m.id));

                // Добавляем только новые матчи (по ID)
                const newMatches = validMatches.filter((match: SavedMatch) => !existingIds.has(match.id));

                // Сохраняем новые матчи
                newMatches.forEach((m: SavedMatch) => {
                    // для импорта используем restoreMatch, если есть, иначе сохраняем через saveMatch
                    if ('restoreMatch' in betService && typeof (betService as any).restoreMatch === 'function') {
                        (betService as any).restoreMatch(m);
                    } else {
                        // попытка восстановить как можно ближе к исходным данным
                        betService.saveMatch(m.matchData as unknown as any, m.filterValues);
                    }
                });

                // Обновляем отображение
                loadSavedMatches();

                toast.success(`Импортировано ${newMatches.length} новых матчей из ${validMatches.length} в файле`);

                // Очищаем input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } catch (error) {
                console.error('Ошибка импорта:', error);
                toast.error('Ошибка при импорте данных. Проверьте формат файла.');
            }
        };

        reader.readAsText(file);
    };

    // const formatDate = (dateStr: string) => {
    //     try {
    //         return new Date(dateStr).toLocaleDateString('ru-RU', {
    //             weekday: 'short',
    //             month: 'short',
    //             day: 'numeric',
    //             hour: '2-digit',
    //             minute: '2-digit'
    //         });
    //     } catch {
    //         return dateStr;
    //     }
    // };

    // const getBetResultColor = (result: string) => {
    //     switch (result) {
    //         case 'won': return 'text-green-400 bg-green-500/20';
    //         case 'lost': return 'text-red-400 bg-red-500/20';
    //         default: return 'text-yellow-400 bg-yellow-500/20';
    //     }
    // };

    // const getBetResultText = (result: string) => {
    //     switch (result) {
    //         case 'won': return 'Выигрыш';
    //         case 'lost': return 'Проигрыш';
    //         default: return 'Не сыграно';
    //     }
    // };

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
        // Проверяем источник счета
        if (match.scoreSource === 'manual') {
            return false; // Ручной ввод - показываем input
        }

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
            case 'won':
                return 'bg-gradient-to-r from-green-500/15 to-emerald-500/10 border-green-400/40 shadow-green-500/20';
            case 'lost':
                return 'bg-gradient-to-r from-red-500/15 to-rose-500/10 border-red-400/40 shadow-red-500/20';
            default:
                return 'bg-gradient-to-r from-slate-800/60 to-slate-700/40 border-slate-600/50 shadow-slate-500/10';
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
                <div className="w-325 mx-auto px-4 py-3 pb-4">
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                            <h1 className="text-2xl font-bold text-white">Сохраненные матчи</h1>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSyncWithDataset}
                                    disabled={isSyncing}
                                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white text-xs rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 flex items-center gap-1"
                                >
                                    {isSyncing ? '🔄' : '🔄'} {isSyncing ? 'Синхронизация...' : 'Синхронизация'}
                                </button>
                                <button
                                    onClick={handleExportData}
                                    className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 flex items-center gap-1"
                                >
                                    📤 Экспорт
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xs rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 flex items-center gap-1"
                                >
                                    📥 Импорт
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleImportData}
                                    className="hidden"
                                />
                            </div>
                        </div>
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
                                onClick={() => navigate('/')}
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
                                        <span className="px-2 py-1 bg-gray-500/20 text-white  text-xs rounded-full">
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
                                                                    className={`p-3 rounded-xl border ${cardBgColor} backdrop-blur-sm shadow-md`}
                                                                >
                                                                    <div className="flex items-start gap-4">
                                                                        {/* Левая часть: Информация о матче */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="font-semibold text-white text-sm truncate">
                                                                                {match.matchData.teams}
                                                                            </div>
                                                                            <div className="text-slate-400 text-xs mb-1">
                                                                                {match.matchData.league}
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="text-slate-300 text-xs">
                                                                                    {dateTime.date} {dateTime.time}
                                                                                </div>
                                                                                <div className="w-12 relative">
                                                                                    {scoreFromDataset ? (
                                                                                        <div className="text-green-400 text-sm font-bold text-center bg-green-500/10 rounded-lg py-1 relative group">
                                                                                            {match.matchData.score}
                                                                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Счет из датасета"></div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="relative">
                                                                                            <input
                                                                                                type="text"
                                                                                                value={match.matchData.score || ''}
                                                                                                onChange={(e) => handleUpdateScore(match.id, e.target.value)}
                                                                                                placeholder="Счет"
                                                                                                className="w-full px-2 py-1 bg-slate-700/80 border border-slate-600/50 rounded-lg text-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 focus:bg-slate-700 text-center transition-all duration-200"
                                                                                            />
                                                                                            {match.scoreSource === 'manual' && (
                                                                                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full" title="Счет введен вручную"></div>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <input
                                                                                    type="text"
                                                                                    value={match.betType || ''}
                                                                                    onChange={(e) => handleUpdateBetType(match.id, e.target.value)}
                                                                                    placeholder="Тип ставки"
                                                                                    className="w-24 px-2 py-1 bg-slate-700/80 border border-slate-600/50 rounded-lg text-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 focus:bg-slate-700 transition-all duration-200"
                                                                                />
                                                                                <div className="flex gap-1">
                                                                                    <button
                                                                                        onClick={() => handleUpdateBetResult(match.id, 'won')}
                                                                                        className={`px-2 py-1 text-xs rounded-lg transition-all duration-200 hover:scale-105 ${
                                                                                            match.betResult === 'won'
                                                                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                                                                                                : 'bg-slate-700/80 text-slate-300 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:shadow-lg hover:shadow-green-500/30'
                                                                                        }`}
                                                                                    >
                                                                                        W
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleUpdateBetResult(match.id, 'lost')}
                                                                                        className={`px-2 py-1 text-xs rounded-lg transition-all duration-200 hover:scale-105 ${
                                                                                            match.betResult === 'lost'
                                                                                                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30'
                                                                                                : 'bg-slate-700/80 text-slate-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30'
                                                                                        }`}
                                                                                    >
                                                                                        L
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>



                                                                        {/* Правая часть: Удаление */}
                                                                        <div className="flex items-center min-w-0">
                                                                            <button
                                                                                onClick={() => handleDeleteMatch(match.id)}
                                                                                className="px-2 py-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white text-xs rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    {/* Центральная часть: Фильтрация */}
                                                                    <div className="mt-2 flex-1 flex justify-center">
                                                                        <div className="bg-gradient-to-r from-slate-800/70 to-slate-700/50 rounded-lg border border-slate-500/40 shadow-lg backdrop-blur-sm">
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
                                                                                    'Оз-нет',
                                                                                    'Маржа 1X2',
                                                                                    'Маржа ТБ/ТМ2.5',
                                                                                    'Маржа ТБ/ТМ3',
                                                                                    'Маржа ОЗ'
                                                                                ].map((columnKey) => {
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
                                                                                            className="px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xs rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 relative z-10"
                                                                                        >
                                                                                            Применить
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
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
                                        <span className="px-2 py-1 bg-gray-500/20 text-white text-xs rounded-full">
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
                                                                    className={`p-3 rounded-xl border ${cardBgColor} backdrop-blur-sm shadow-md`}
                                                                >
                                                                    <div className="flex items-start gap-4">
                                                                        {/* Левая часть: Информация о матче */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="font-semibold text-white text-sm truncate">
                                                                                {match.matchData.teams}
                                                                            </div>
                                                                            <div className="text-slate-400 text-xs mb-1">
                                                                                {match.matchData.league}
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="text-slate-300 text-xs">
                                                                                    {dateTime.date} {dateTime.time}
                                                                                </div>
                                                                                <div className="w-12 relative">
                                                                                    {scoreFromDataset ? (
                                                                                        <div className="text-green-400 text-sm font-bold text-center bg-green-500/10 rounded-lg py-1 relative group">
                                                                                            {match.matchData.score}
                                                                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Счет из датасета"></div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="relative">
                                                                                            <input
                                                                                                type="text"
                                                                                                value={match.matchData.score || ''}
                                                                                                onChange={(e) => handleUpdateScore(match.id, e.target.value)}
                                                                                                placeholder="Счет"
                                                                                                className="w-full px-2 py-1 bg-slate-700/80 border border-slate-600/50 rounded-lg text-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 focus:bg-slate-700 text-center transition-all duration-200"
                                                                                            />
                                                                                            {match.scoreSource === 'manual' && (
                                                                                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full" title="Счет введен вручную"></div>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <input
                                                                                    type="text"
                                                                                    value={match.betType || ''}
                                                                                    onChange={(e) => handleUpdateBetType(match.id, e.target.value)}
                                                                                    placeholder="Тип ставки"
                                                                                    className="w-24 px-2 py-1 bg-slate-700/80 border border-slate-600/50 rounded-lg text-white text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 focus:bg-slate-700 transition-all duration-200"
                                                                                />
                                                                                <div className="flex gap-1">
                                                                                    <button
                                                                                        onClick={() => handleUpdateBetResult(match.id, 'won')}
                                                                                        className={`px-2 py-1 text-xs rounded-lg transition-all duration-200 hover:scale-105 ${
                                                                                            match.betResult === 'won'
                                                                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                                                                                                : 'bg-slate-700/80 text-slate-300 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:shadow-lg hover:shadow-green-500/30'
                                                                                        }`}
                                                                                    >
                                                                                        W
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleUpdateBetResult(match.id, 'lost')}
                                                                                        className={`px-2 py-1 text-xs rounded-lg transition-all duration-200 hover:scale-105 ${
                                                                                            match.betResult === 'lost'
                                                                                                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30'
                                                                                                : 'bg-slate-700/80 text-slate-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30'
                                                                                        }`}
                                                                                    >
                                                                                        L
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>



                                                                        {/* Правая часть: Удаление */}
                                                                        <div className="flex items-center min-w-0">
                                                                            <button
                                                                                onClick={() => handleDeleteMatch(match.id)}
                                                                                className="px-2 py-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white text-xs rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Центральная часть: Фильтрация */}
                                                                    <div className="mt-2 flex-1 flex justify-center">
                                                                        <div className="bg-gradient-to-r from-slate-800/70 to-slate-700/50 rounded-lg border border-slate-500/40 shadow-lg backdrop-blur-sm">
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
                                                                                    'Оз-нет',
                                                                                    'Маржа 1X2',
                                                                                    'Маржа ТБ/ТМ2.5',
                                                                                    'Маржа ТБ/ТМ3',
                                                                                    'Маржа ОЗ'
                                                                                ].map((columnKey) => {
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
                                                                                            className="px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xs rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 relative z-10"
                                                                                        >
                                                                                            Применить
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
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
