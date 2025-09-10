import {Button} from "shared/ui/Button";

type Props = {
    rowCount: number;
    setInputs: (filters: Record<string, string>) => void;
    setAppliedFilters: (filters: Record<string, string>) => void;
    setSearchParams: (params: URLSearchParams) => void;
    debouncedApply?: { cancel: () => void };
    pageSize: number;
    setPageSize: (size: number) => void;
    setPageIndex: (index: number) => void;
}

export const Controls = (props: Props) => {

    const {rowCount: allRows, setInputs, setAppliedFilters, setSearchParams, debouncedApply, pageSize, setPageSize, setPageIndex} = props;

    const handleReset = () => {
        // Отменяем pending debounce операции
        debouncedApply?.cancel();

        // Очищаем все состояния
        setInputs({});
        setAppliedFilters({});

        // Очищаем URL
        setSearchParams(new URLSearchParams());
    }


    return (
        <div
           className='bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-1 border-b border-white/10 flex-shrink-0'>
            <div className="flex flex-col gap-3 px-1">
                {/* Мобильная версия - вертикальный стек */}
                <div className="flex flex-col sm:hidden gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                            <span>Показать:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    const next = Number(e.target.value);
                                    setPageSize(next);
                                    setPageIndex(0);
                                }}
                                className="px-2 py-1 bg-slate-700/80 border border-slate-600 rounded text-white text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors hover:bg-slate-700"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={28}>28</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <Button onClick={handleReset} variant="danger" size="sm" className="text-xs cursor-pointer">
                            Сбросить
                        </Button>
                    </div>
                    <div className="flex justify-center">
                        <div
                            className="px-3 py-1.5 bg-slate-700/50 rounded-lg border border-slate-600 text-slate-300 text-xs font-medium">
                            Найдено: <span
                            className="text-blue-400 font-bold">{allRows.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Десктопная версия - горизонтальный ряд */}
                <div className="hidden sm:flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                        <span>Показать:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                const next = Number(e.target.value);
                                setPageSize(next);
                                setPageIndex(0);
                            }}
                            className="px-2 py-1 bg-slate-700/80 border border-slate-600 rounded text-white text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors hover:bg-slate-700"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={28}>28</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-3">
                        <div
                            className="px-3 py-1.5 bg-slate-700/50 rounded-lg border border-slate-600 text-slate-300 text-xs font-medium">
                            Найдено: <span
                            className="text-blue-400 font-bold">{allRows.toLocaleString()}</span>
                        </div>
                        <Button onClick={handleReset} variant="danger" size="sm" className="text-xs cursor-pointer">
                            Сбросить фильтры
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
