
type Props = {
    pageCount: number;
    pageIndex: number;
    setPageIndex: (index: number) => void;
}

export const Pagination = (props: Props) => {
    const {pageCount, pageIndex, setPageIndex} = props;

    return (
        <div className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-2">
            {/* Мобильная версия - только основные кнопки */}
            <div className="flex sm:hidden items-center gap-1">
                <button
                    onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                    disabled={pageIndex === 0}
                    className="w-7 h-7 flex items-center justify-center bg-slate-700/50 border border-slate-600 rounded text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 text-slate-300 enabled:bg-slate-700 enabled:text-white enabled:cursor-pointer enabled:hover:bg-slate-600 enabled:hover:border-slate-500"
                >
                    ‹
                </button>
                <span className="px-2 py-1 bg-slate-700/50 rounded border border-slate-600 text-white text-xs font-medium min-w-[60px] text-center">
                    {pageIndex + 1} / {pageCount}
                </span>
                <button
                    onClick={() => setPageIndex(Math.min(pageCount - 1, pageIndex + 1))}
                    disabled={pageIndex >= pageCount - 1}
                    className="w-7 h-7 flex items-center justify-center bg-slate-700/50 border border-slate-600 rounded text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 text-slate-300 enabled:bg-slate-700 enabled:text-white enabled:cursor-pointer enabled:hover:bg-slate-600 enabled:hover:border-slate-500"
                >
                    ›
                </button>
            </div>

            {/* Десктопная версия - полная пагинация */}
            <div className="hidden sm:flex items-center gap-2">
                <button
                    onClick={() => setPageIndex(0)}
                    disabled={pageIndex === 0}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700/50 border border-slate-600 rounded-lg text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 text-slate-300 enabled:bg-slate-700 enabled:text-white enabled:cursor-pointer enabled:hover:bg-slate-600 enabled:hover:border-slate-500 transform hover:scale-105 active:scale-95"
                >
                    «
                </button>
                <button
                    onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                    disabled={pageIndex === 0}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700/50 border border-slate-600 rounded-lg text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 text-slate-300 enabled:bg-slate-700 enabled:text-white enabled:cursor-pointer enabled:hover:bg-slate-600 enabled:hover:border-slate-500 transform hover:scale-105 active:scale-95"
                >
                    ‹
                </button>
                <span className="px-3 py-1 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-xs font-medium">
                    {pageIndex + 1} / {pageCount}
                </span>
                <button
                    onClick={() => setPageIndex(Math.min(pageCount - 1, pageIndex + 1))}
                    disabled={pageIndex >= pageCount - 1}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700/50 border border-slate-600 rounded-lg text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 text-slate-300 enabled:bg-slate-700 enabled:text-white enabled:cursor-pointer enabled:hover:bg-slate-600 enabled:hover:border-slate-500 transform hover:scale-105 active:scale-95"
                >
                    ›
                </button>
                <button
                    onClick={() => setPageIndex(pageCount - 1)}
                    disabled={pageIndex >= pageCount - 1}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700/50 border border-slate-600 rounded-lg text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 text-slate-300 enabled:bg-slate-700 enabled:text-white enabled:cursor-pointer enabled:hover:bg-slate-600 enabled:hover:border-slate-500 transform hover:scale-105 active:scale-95"
                >
                    »
                </button>
            </div>
        </div>
    )
}
