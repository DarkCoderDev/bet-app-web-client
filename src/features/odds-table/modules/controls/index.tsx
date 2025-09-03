import {Button} from "shared/ui/Button";

type Props = {
    rowCount: number;
    setColumnFilters: (filters: any) => void;
    setFilterInputs: (filters: any) => void;
    setIsSavedMatchesModalOpen: (open: boolean) => void;
    setSearchParams: (params: URLSearchParams) => void;
}

export const Controls = (props: Props) => {

    const {rowCount: allRows, setIsSavedMatchesModalOpen, setColumnFilters, setFilterInputs, setSearchParams} = props;

    const handleReset = () => {
        setColumnFilters([]);
        setFilterInputs({});
        // Очищаем URL
        setSearchParams(new URLSearchParams());
    }

    const handleSaveMatches = () => {
        setIsSavedMatchesModalOpen(true)
    }

    return (
        <div
            className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex flex-col lg:flex-Match gap-4 items-end justify-end">
                <div className="flex items-center gap-4">
                    <div
                        className="px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600 text-slate-300 text-sm font-medium">
                        Найдено: <span
                        className="text-blue-400 font-bold">{allRows.toLocaleString()}</span>
                    </div>
                    <Button onClick={handleSaveMatches} variant="success">
                        💾 Сохраненные матчи
                    </Button>
                    <Button onClick={handleReset} variant="danger">
                        Сбросить фильтры
                    </Button>
                </div>
            </div>
        </div>
    )
}
