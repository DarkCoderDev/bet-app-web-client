// --- Функция расчета результатов ставок
import type {FilterFn} from "@tanstack/react-table";
import type {Match} from "entities/match/types.ts";

import { RusMatchKeys } from 'entities/match/consts';

export const calculateBetResult = (betType: string, homeScore: number, awayScore: number): boolean => {
    const totalGoals = homeScore + awayScore;

    const betResults = {
        [RusMatchKeys.p1]: () => homeScore > awayScore,
        [RusMatchKeys.x]: () => homeScore === awayScore,
        [RusMatchKeys.p2]: () => awayScore > homeScore,
        [RusMatchKeys.handicap1_0]: () => homeScore > awayScore,
        [RusMatchKeys.handicap2_0]: () => awayScore > homeScore,
        [RusMatchKeys.oneToScore]: () => homeScore > 0,
        [RusMatchKeys.twoToScore]: () => awayScore > 0,
        [RusMatchKeys.under2_5]: () => totalGoals < 2.5,
        [RusMatchKeys.over2_5]: () => totalGoals > 2.5,
        [RusMatchKeys.under3]: () => totalGoals < 3,
        [RusMatchKeys.over3]: () => totalGoals > 3,
        [RusMatchKeys.bttsYes]: () => homeScore > 0 && awayScore > 0,
        [RusMatchKeys.bttsNo]: () => homeScore === 0 || awayScore === 0,
    };

    return betResults[betType as keyof typeof betResults]?.() ?? false;
};


export const stripTags = (html: string) =>
    html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();

export const includesText: FilterFn<Match> = (match, columnId, filterValue) => {
    const v = String(match.getValue(columnId) ?? "");
    return stripTags(v).toLowerCase().includes(String(filterValue ?? "").toLowerCase());
};

export const renderClean = (v: string) => stripTags(v);
