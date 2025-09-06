import type { Match } from "entities/match/types.ts";

export async function getDataSet(): Promise<Match[]> {
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const url = new URL('/dataset.json', baseUrl);

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
    return result.data;
}
