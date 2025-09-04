import React from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import './global.css';
import { TablePage } from "../pages/table/table-page.tsx";
import { FinanceManagerPage } from "../pages/finance-manager-page";
import type {Match} from "entities/match/types.ts";
import { getDataSet } from "entities/match/api.ts";
import {Toaster} from "react-hot-toast";

export const App = () => {
    const [matches, setMatches] = React.useState<Match[] | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let isMounted = true;

        void async function loadData() {
            try {
                setError(null);
                const data = await getDataSet();
                if (isMounted) setMatches(data);
            } catch (e) {
                console.error('Ошибка загрузки данных:', e);
                if (isMounted) {
                    setError(e instanceof Error ? e.message : 'Неизвестная ошибка');
                }
            }
        }();

        return () => {
            isMounted = false;
        };
    }, []);

    if (error) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-6">
                <div
                    className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Ошибка загрузки</h3>
                    <pre className="whitespace-pre-wrap text-red-200 text-sm bg-red-900/30 rounded-lg p-3">{error}</pre>
                </div>
            </div>
        );
    }

    if (!matches) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="mb-6">
                        <div className="loading-spinner mx-auto"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Загрузка данных…</h3>
                    <p className="text-slate-400 text-lg">Пожалуйста, подождите</p>
                </div>
            </div>
            );
    }

    return (
        <Router>
            <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
                <div className="flex-1 min-h-0">
                    <Routes>
                        <Route path="/" element={<TablePage dataSet={matches} />} />
                        <Route path="/finance" element={<FinanceManagerPage />} />
                        <Route path="/statistics" element={<div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center"><div className="text-white text-2xl">📈 Статистика - в разработке</div></div>} />
                        <Route path="/settings" element={<div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center"><div className="text-white text-2xl">⚙️ Настройки - в разработке</div></div>} />
                        <Route path="/profile" element={<div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center"><div className="text-white text-2xl">👤 Профиль - в разработке</div></div>} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </div>
            <Toaster position="top-right" />
        </Router>
    );
}
