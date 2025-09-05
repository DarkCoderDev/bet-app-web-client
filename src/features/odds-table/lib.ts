// --- Функция расчета результатов ставок
import type {FilterFn} from "@tanstack/react-table";
import type {Match} from "entities/match/types.ts";

import { RusMatchKeys } from 'entities/match/consts';

export const calculateBetResult = (betType: string, homeScore: number, awayScore: number): boolean => {
    const totalGoals = homeScore + awayScore;

    const betResults = {
        'П1': () => homeScore > awayScore,
        'Х': () => homeScore === awayScore,
        'П2': () => awayScore > homeScore,
        'Ф1(0)': () => homeScore > awayScore,
        'Ф2(0)': () => awayScore > homeScore,
        '1 заб': () => homeScore > 0,
        '2 заб': () => awayScore > 0,
        'ТМ2.5': () => totalGoals < 2.5,
        'ТБ2.5': () => totalGoals > 2.5,
        'ТМ3': () => totalGoals < 3,
        'ТБ3': () => totalGoals > 3,
        'Оз-да': () => homeScore > 0 && awayScore > 0,
        'Оз-нет': () => homeScore === 0 || awayScore === 0,
    };

    const result = betResults[betType as keyof typeof betResults]?.() ?? false;
    
    return result;
};


export const stripTags = (html: string) =>
    html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();

export const includesText: FilterFn<Match> = (match, columnId, filterValue) => {
    const v = String(match.getValue(columnId) ?? "");
    return stripTags(v).toLowerCase().includes(String(filterValue ?? "").toLowerCase());
};

export const renderClean = (v: string) => stripTags(v);
