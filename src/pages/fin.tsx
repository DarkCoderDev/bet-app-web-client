// {/* Sticky Header */}
// <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 flex-shrink-0">
//     <div className="container mx-auto px-4 py-4">
//         <div className="flex items-center justify-between">
//             <div>
//                 <h1 className="text-2xl md:text-3xl font-bold text-white">Финансовый менеджер</h1>
//                 <p className="text-slate-400 text-sm md:text-base mt-1">
//                     Управление банкроллом и анализ прибыльности
//                 </p>
//             </div>
//
//             {/* Quick Actions */}
//             <div className="hidden md:flex items-center gap-3">
//                 <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
//                     Экспорт отчета
//                 </button>
//                 <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">
//                     Настройки
//                 </button>
//             </div>
//         </div>
//     </div>
// </header>
//
// {/* Main Content - скроллится */}
// <main className="flex-1 overflow-auto">
//     <div className="container mx-auto px-4 py-6 pb-8">
//         <div className="mb-8">
//             <h1 className="text-4xl font-bold text-white mb-2">Финансовый менеджер</h1>
//             <p className="text-slate-300 text-lg">
//                 Управление банкроллом и анализ прибыльности
//             </p>
//         </div>
//
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//             {/* Карточка банкролла */}
//             <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
//                 <h3 className="text-xl font-semibold text-white mb-4">Банкролл</h3>
//                 <div className="text-3xl font-bold text-green-400 mb-2">₽ 100,000</div>
//                 <div className="text-slate-400 text-sm">Текущий баланс</div>
//             </div>
//
//             {/* Карточка прибыли */}
//             <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
//                 <h3 className="text-xl font-semibold text-white mb-4">Прибыль</h3>
//                 <div className="text-3xl font-bold text-green-400 mb-2">+₽ 15,250</div>
//                 <div className="text-slate-400 text-sm">За текущий месяц</div>
//             </div>
//
//             {/* Карточка ROI */}
//             <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
//                 <h3 className="text-xl font-semibold text-white mb-4">ROI</h3>
//                 <div className="text-3xl font-bold text-blue-400 mb-2">18.2%</div>
//                 <div className="text-slate-400 text-sm">Возврат инвестиций</div>
//             </div>
//         </div>
//
//         {/* График прибыльности */}
//         <div className="mb-8 bg-slate-800/50 rounded-lg p-6 border border-slate-700">
//             <h3 className="text-xl font-semibold text-white mb-4">График прибыльности</h3>
//             <div className="h-64 bg-slate-700/30 rounded flex items-center justify-center">
//                 <p className="text-slate-400">График будет добавлен позже</p>
//             </div>
//         </div>
