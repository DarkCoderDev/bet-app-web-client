import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BetManagementService } from '../entities/match/bet-management';
import type { SavedMatch } from '../entities/match/types';
import { RusMatchKeys, MatchKeys, MatchIndexMap } from '../entities/match/consts';

interface SavedMatchesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filterValues: Record<string, string>) => void;
}

export const SavedMatchesModal: React.FC<SavedMatchesModalProps> = ({ isOpen, onClose, onApplyFilters }) => {
    const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
    const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([]);
    const [groupedMatches, setGroupedMatches] = useState<Record<string, SavedMatch[]>>({});
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const betService = BetManagementService.getInstance();

    // Оборачиваем onApplyFilters в useCallback для стабильности
    const handleApplyFiltersCallback = useCallback((filterValues: Record<string, string>) => {
        onApplyFilters(filterValues);
        onClose(); // Закрываем модалку после применения фильтров
    }, [onApplyFilters, onClose]);

    // Функция для обновления URL с query параметрами фильтров
    const updateUrlWithFilters = useCallback((filterValues: Record<string, string>) => {
        console.log('updateUrlWithFilters called with:', filterValues);

        // Создаем копию текущих параметров
        const newSearchParams = new URLSearchParams(searchParams);

        // Очищаем существующие параметры фильтров
        Object.values(MatchKeys).forEach(key => {
            newSearchParams.delete(key);
        });

        // Добавляем новые значения фильтров, используя индексы
        Object.entries(filterValues).forEach(([key, value]) => {
            if (value && value.trim() !== '') {
                // Находим соответствующий индекс для ключа фильтра
                if (key in MatchIndexMap) {
                    const index = MatchIndexMap[key as keyof typeof MatchIndexMap];
                    newSearchParams.set(String(index), value);
                    console.log(`Setting index ${index} = ${value} (for ${key})`);
                }
            }
        });

        console.log('New search params:', newSearchParams.toString());

        // Обновляем URL
        setSearchParams(newSearchParams);
    }, [searchParams, setSearchParams]);

    // Загрузка данных при изменении таба
    useEffect(() => {
        if (isOpen) {
            loadMatches();
        }
    }, [activeTab, isOpen]);

    // Загрузка сохраненных матчей из localStorage при инициализации
    useEffect(() => {
        if (isOpen) {
            loadSavedMatchesFromStorage();
        }
    }, [isOpen]);

    // Функция для загрузки сохраненных матчей из localStorage
    const loadSavedMatchesFromStorage = () => {
        try {
            const savedData = localStorage.getItem('saved_matches_history');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (Array.isArray(parsedData)) {
                    // Восстанавливаем данные в сервисе
                    parsedData.forEach(matchData => {
                        betService.restoreMatch(matchData);
                    });
                    // Перезагружаем матчи
                    loadMatches();
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки сохраненных матчей из localStorage:', error);
        }
    };

    // Функция для сохранения матчей в localStorage
    const saveMatchesToStorage = () => {
        try {
            const allMatches = betService.getAllMatches();
            localStorage.setItem('saved_matches_history', JSON.stringify(allMatches, null, 2));
            console.log('Матчи сохранены в localStorage:', allMatches.length);
        } catch (error) {
            console.error('Ошибка сохранения матчей в localStorage:', error);
        }
    };

    // Загрузка фильтров из URL при инициализации и изменении searchParams
    useEffect(() => {
        const urlFilters: Record<string, string> = {};

        // Загружаем фильтры из query параметров
        Object.values(MatchKeys).forEach(key => {
            const value = searchParams.get(key);
            if (value) {
                urlFilters[key] = value;
            }
        });

        // Если есть фильтры в URL, применяем их
        if (Object.keys(urlFilters).length > 0) {
            handleApplyFiltersCallback(urlFilters);
        }
    }, [searchParams, handleApplyFiltersCallback]);

    // Автоматическое обновление URL при изменении сохраненных матчей
    useEffect(() => {
        if (savedMatches.length > 0) {
            // Берем фильтры из первого матча (или можно объединить все)
            const firstMatch = savedMatches[0];
            if (firstMatch && firstMatch.filterValues && Object.keys(firstMatch.filterValues).length > 0) {
                updateUrlWithFilters(firstMatch.filterValues);
            }
        }
    }, [savedMatches, updateUrlWithFilters]);

    const loadMatches = () => {
        const matches = betService.getMatchesByTab(activeTab);
        const grouped = betService.getGroupedMatches(activeTab);

        setSavedMatches(matches);
        setGroupedMatches(grouped);

        // Автоматически сохраняем в localStorage при изменении
        saveMatchesToStorage();
    };

    // Применение сохраненных фильтров
    const handleApplyFilters = (matchId: string) => {
        console.log('handleApplyFilters called for matchId:', matchId);
        const filterValues = betService.getFilterValues(matchId);
        console.log('Filter values from service:', filterValues);

        if (filterValues) {
            // Создаем URL с фильтрами для главной страницы
            const newSearchParams = new URLSearchParams();

            // Добавляем фильтры в URL, используя индексы из MatchIndexMap
            Object.entries(filterValues).forEach(([key, value]) => {
                if (value && value.trim() !== '') {
                    // Находим соответствующий английский ключ для русского названия
                    const englishKey = Object.entries(RusMatchKeys).find(([engKey, rusName]) => rusName === key)?.[0];
                    if (englishKey && englishKey in MatchIndexMap) {
                        const index = MatchIndexMap[englishKey as keyof typeof MatchIndexMap];
                        newSearchParams.set(String(index), value);
                        console.log(`Setting index ${index} = ${value} (for ${key} -> ${englishKey})`);
                    }
                }
            });

            // Переходим на главную страницу с примененными фильтрами
            navigate(`/?${newSearchParams.toString()}`);
            onClose(); // Закрываем модалку
        } else {
            console.log('No filter values found for matchId:', matchId);
        }
    };

    // Обновление матча
    const handleUpdateMatch = (matchId: string, field: keyof SavedMatch, value: any) => {
        betService.updateMatch(matchId, { [field]: value });
        loadMatches(); // Перезагружаем данные
    };

    // Удаление матча
    const handleDeleteMatch = (matchId: string) => {
        if (confirm('Удалить этот матч?')) {
            betService.deleteMatch(matchId);
            loadMatches();
        }
    };

    // Экспорт данных
    const handleExport = () => {
        const data = betService.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `saved-matches-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Импорт данных
    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const data = event.target?.result as string;
                    if (betService.importData(data)) {
                        loadMatches();
                        alert('Данные успешно импортированы!');
                    } else {
                        alert('Ошибка импорта данных');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const renderMatchCard = (match: SavedMatch) => (
        <div
            key={match.id}
            className={`rounded-xl p-4 border transition-all duration-200 hover:shadow-lg mb-3 ${
                match.betResult === 'won' 
                    ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 shadow-emerald-500/10' 
                    : match.betResult === 'lost' 
                        ? 'border-red-500/50 bg-gradient-to-r from-red-900/20 to-red-800/10 shadow-red-500/10' 
                        : 'border-slate-600/50 bg-gradient-to-r from-slate-800/30 to-slate-700/20 hover:border-slate-500/70'
            }`}
        >
            {/* Основная информация в компактном виде */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm mb-1 truncate pr-2">
                        {match.matchData.teams}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{match.matchData.league}</span>
                        <span>•</span>
                        <span>{match.matchData.date}</span>
                    </div>
                </div>
                
                {/* Статус матча */}
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    match.betResult === 'won' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : match.betResult === 'lost' 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                            : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                }`}>
                    {match.betResult === 'won' ? 'Выигрыш' : match.betResult === 'lost' ? 'Проигрыш' : 'В ожидании'}
                </div>
            </div>

            {/* Фильтры в виде мини-таблички */}
            <div className="mb-3">
                <h5 className="text-slate-400 text-xs mb-2 font-medium text-center">Фильтры:</h5>
                <div className="bg-slate-700/40 border border-slate-500 rounded-lg p-2 shadow-inner">
                    <div className="flex gap-1 overflow-x-auto">
                        {Object.entries(match.filterValues).map(([key, value]) => {
                            const rusKey = RusMatchKeys[key as keyof typeof RusMatchKeys] || key;
                            return (
                                <div key={key} className="text-center flex-shrink-0">
                                    <div className="text-slate-300 font-medium text-xs mb-1 bg-slate-600/50 rounded px-1 py-0.5">
                                        {rusKey}
                                    </div>
                                    <div className="bg-slate-600/30 border border-slate-500 rounded px-1 py-0.5 text-white text-xs font-semibold min-w-[1.5rem]">
                                        {value}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Нижняя панель с действиями */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-600/30">
                <div className="flex items-center gap-4">
                    {/* Счет */}
                    <div className="flex items-center gap-2">
                        <label className="text-slate-400 text-xs">Счет:</label>
                        <input
                            type="text"
                            value={match.finalScore || match.matchData.score || ''}
                            onChange={(e) => handleUpdateMatch(match.id, 'finalScore', e.target.value)}
                            className="w-16 px-2 py-1 text-xs bg-slate-700/50 border border-slate-600 rounded-md text-white text-center focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                            placeholder="0-0"
                        />
                    </div>
                    
                    {/* Ставка */}
                    <div className="flex items-center gap-2">
                        <label className="text-slate-400 text-xs">Ставка:</label>
                        <input
                            type="text"
                            value={match.bet || ''}
                            onChange={(e) => handleUpdateMatch(match.id, 'bet', e.target.value)}
                            className="w-16 px-2 py-1 text-xs bg-slate-700/50 border border-slate-600 rounded-md text-white text-center focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                            placeholder=""
                        />
                    </div>

                    {/* Статус */}
                    <div className="flex items-center gap-2">
                        <label className="text-slate-400 text-xs">Статус:</label>
                        <input
                            type="text"
                            value={match.betResult || ''}
                            onChange={(e) => handleUpdateMatch(match.id, 'betResult', e.target.value)}
                            className="w-20 px-2 py-1 text-xs bg-slate-700/50 border border-slate-600 rounded-md text-white text-center focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                            placeholder="won/lost"
                        />
                    </div>
                </div>
                
                {/* Кнопки действий */}
                <div className="flex gap-2">
                    <button
                        onClick={() => handleApplyFilters(match.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                        Применить
                    </button>
                    <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );

    const renderTodayTab = () => (
        <div>
            {Object.entries(groupedMatches).map(([groupKey, matches]) => {
                // Находим самый ранний матч в группе
                const earliestMatch = matches.reduce((earliest, current) => {
                    const earliestDate = new Date(earliest.matchData.date);
                    const currentDate = new Date(current.matchData.date);
                    return currentDate < earliestDate ? current : earliest;
                });

                return (
                    <div key={groupKey} className="mb-6">
                        <h3 className="text-blue-400 font-semibold text-sm mb-3 border-b border-slate-700 pb-2">
                            {earliestMatch.matchData.date}
                        </h3>
                        {matches.map(renderMatchCard)}
                    </div>
                );
            })}
        </div>
    );

    const renderHistoryTab = () => (
        <div>
            {Object.entries(groupedMatches).map(([groupKey, matches]) => {
                // Находим самый ранний матч в группе
                const earliestMatch = matches.reduce((earliest, current) => {
                    const earliestDate = new Date(earliest.matchData.date);
                    const currentDate = new Date(current.matchData.date);
                    return currentDate < earliestDate ? current : earliest;
                });

                return (
                    <div key={groupKey} className="mb-6">
                        <h3 className="text-blue-400 font-semibold text-sm mb-3 border-b border-slate-700 pb-2">
                            {earliestMatch.matchData.date}
                        </h3>
                        {matches.map(renderMatchCard)}
                    </div>
                );
            })}
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-800/95 to-slate-700/95 rounded-xl border border-slate-600/50 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-600/50 bg-slate-800/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Сохраненные матчи</h2>
                        <p className="text-slate-400 text-sm">Управление историей ставок и результатами</p>
                    </div>
                    
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex justify-between items-center p-4 border-b border-slate-600/50 bg-slate-800/30">
                    <div className="flex gap-2">
                        <button
                            onClick={handleImport}
                            className="px-3 py-2 bg-purple-600/80 hover:bg-purple-600 text-white text-xs rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                            Импорт
                        </button>
                        <button
                            onClick={() => {
                                saveMatchesToStorage();
                                alert(`Сохранено ${betService.getAllMatches().length} матчей в localStorage!`);
                            }}
                            className="px-3 py-2 bg-blue-600/80 hover:bg-blue-600 text-white text-xs rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            Сохранить
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Очистить всю историю сохраненных матчей? Это действие нельзя отменить.')) {
                                    localStorage.removeItem('saved_matches_history');
                                    betService.clearAllMatches();
                                    loadMatches();
                                    alert('История очищена!');
                                }
                            }}
                            className="px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white text-xs rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        >
                            Очистить
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-600/50">
                        <button
                            onClick={() => setActiveTab('today')}
                            className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                activeTab === 'today'
                                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                            }`}
                        >
                            Today ({betService.getMatchesByTab('today').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                activeTab === 'history'
                                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                            }`}
                        >
                            History ({betService.getMatchesByTab('history').length})
                        </button>
                    </div>

                    {/* Tab content */}
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        {activeTab === 'today' ? renderTodayTab() : renderHistoryTab()}

                        {savedMatches.length === 0 && (
                            <div className="text-center text-slate-400 py-12">
                                <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-slate-500">Нет сохраненных матчей в секции {activeTab === 'today' ? 'Today' : 'History'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
