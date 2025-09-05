import React from 'react';
import {OddsTable} from 'features/odds-table/odds-table.tsx';
import type {Match} from 'entities/match/types.ts';

interface TablePageProps {
    dataSet: Match[];
}

export const TablePage: React.FC<TablePageProps> = ({dataSet}) => {
    return (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
            <div className="flex-1 min-h-0">
                <OddsTable dataSet={dataSet}/>
            </div>
        </div>
    );
};
