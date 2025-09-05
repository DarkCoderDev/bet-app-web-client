import {Button} from "shared/ui/Button";

type Props = {
    rowCount: number;
    setInputs: (filters: Record<string, string>) => void;
    setAppliedFilters: (filters: Record<string, string>) => void;
    setIsSavedMatchesModalOpen: (open: boolean) => void;
    setSearchParams: (params: URLSearchParams) => void;
}

export const Controls = (props: Props) => {

    const {rowCount: allRows, setIsSavedMatchesModalOpen, setInputs, setAppliedFilters, setSearchParams} = props;

    const handleReset = () => {
        setInputs({});
        setAppliedFilters({});
        // Очищаем URL
        setSearchParams(new URLSearchParams());
    }

    const handleSaveMatches = () => {
        setIsSavedMatchesModalOpen(true)
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
                    <Button onClick={handleSaveMatches} variant="success" size="sm" className="text-xs cursor-pointer">
                        💾 Сохраненные матчи
                    </Button>
                    <Button onClick={handleReset} variant="danger" size="sm" className="text-xs cursor-pointer">
                        Сбросить фильтры
                    </Button>
                </div>
            </div>
        </div>
    )
}
