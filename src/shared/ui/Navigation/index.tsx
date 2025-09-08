import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// removed unused Button import

const navigationItems = [
    { path: '/', label: 'Таблица матчей', icon: '📊' },
    { path: '/saved-matches', label: 'Сохраненные матчи', icon: '💾' },
    { path: '/finance', label: 'Финансовый менеджер', icon: '💰' },
    { path: '/statistics', label: 'Статистика', icon: '📈' },
    { path: '/settings', label: 'Настройки', icon: '⚙️' },
];

export const Navigation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 flex-shrink-0">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-12">
                    {/* Логотип/Название */}
                    <div className="flex items-center">
                        <Link to="/" className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                            BetApp
                        </Link>
                    </div>

                    {/* Навигационные ссылки */}
                    <div className="hidden md:flex items-center space-x-0.5">
                        {navigationItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                        isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-700'
                                    }`}
                                >
                                    <span className="mr-1">{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Мобильное меню */}
                    <div className="md:hidden">
                        <select
                            value={location.pathname}
                            onChange={(e) => navigate(e.target.value)}
                            className="bg-slate-700 text-white text-xs rounded-md px-2 py-1.5 border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {navigationItems.map((item) => (
                                <option key={item.path} value={item.path}>
                                    {item.icon} {item.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </nav>
    );
};
