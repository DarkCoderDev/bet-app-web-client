import type { Match } from "entities/match/types.ts";

export async function getDataSet(): Promise<Match[]> {
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const url = new URL('/dataset.br', baseUrl);

    const response = await fetch(url.toString(), {
        headers: {
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json() as { data: Match[] };

    const getEpoch = (row: Match): number => {
        const dateStr = String(row[2] || '');
        const match = dateStr.match(/<span[^>]*>(\d+)<\/span>/);
        return match ? parseInt(match[1]) : 0;
    };

    const sortedByEpoch = [...result.data].sort((a, b) => getEpoch(b) - getEpoch(a));

    const cleanedData = sortedByEpoch.map((row) => {
        const newRow = [...row] as Match;
        if (newRow[2]) {
            newRow[2] = String(newRow[2]).replace(/<span[^>]*>.*?<\/span>/g, '').trim();
        }
        return newRow;
    });

    return cleanedData;
}
