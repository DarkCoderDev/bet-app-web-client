import React from 'react';
import {OddsTable} from 'features/odds-table/odds-table.tsx';
import type {Match} from 'entities/match/types.ts';

interface TablePageProps {
    dataSet: Match[];
}

export const TablePage: React.FC<TablePageProps> = ({dataSet}) => {
    return (
        <OddsTable dataSet={dataSet}/>
    );
};
