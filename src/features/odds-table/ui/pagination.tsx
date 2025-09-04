
type Props = {
    pageCount: number;
    pageIndex: number;
    setPageIndex: (index: any) => void;
}

export const Pagination = (props: Props) => {
    const {pageCount, pageIndex, setPageIndex} = props;

    return (
        <div
            className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 px-4 py-1 border-t border-white/10 flex-shrink-0">
            <div className="flex flex-row sm:flex-Match gap-2 items-center justify-center">
                <button
                    onClick={() => setPageIndex(0)}
                    disabled={pageIndex === 0}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700/50 border border-slate-600 rounded-lg text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 text-slate-300 enabled:bg-slate-700 enabled:text-white enabled:cursor-pointer enabled:hover:bg-slate-600 enabled:hover:border-slate-500 transform hover:scale-105 active:scale-95"
                >
                    «
                </button>
                <button
                    onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                    disabled={pageIndex === 0}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700/50 border border-slate-600 rounded-lg text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-800 text-slate-300 enabled:bg-slate-700 enabled:text-white enabled:cursor-pointer enabled:hover:bg-slate-600 enabled:hover:border-slate-500 transform hover:scale-105 active:scale-95"
                >
                    ‹
                </button>
                <span
                    className="px-3 py-1 bg-slate-700/50 rounded-lg border border-slate-600 text-white text-xs font-medium">
      {pageIndex + 1} / {pageCount}
    </span>
                <button
                    onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
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
