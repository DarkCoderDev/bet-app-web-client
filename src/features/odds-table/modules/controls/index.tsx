import {Button} from "shared/ui/Button";

type Props = {
    rowCount: number;
    setInputs: (filters: Record<string, string>) => void;
    setAppliedFilters: (filters: Record<string, string>) => void;
    setSearchParams: (params: URLSearchParams) => void;
    debouncedApply?: { cancel: () => void };
}

export const Controls = (props: Props) => {

    const {rowCount: allRows, setInputs, setAppliedFilters, setSearchParams, debouncedApply} = props;

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
            <div className="flex flex-col lg:flex-Match gap-3 items-end justify-end">
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
    )
}
