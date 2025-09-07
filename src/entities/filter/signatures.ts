import {truncate} from "shared/libs.ts";
import {MatchKeys} from "entities/match/consts.ts";

export const signatures = [
    {
        label: 'Math Model',
        color: '#2e8b57',
        btnText: 'м',
        fields: [
            {key: MatchKeys.LEAGUE, transform: (v: string) => (v)},
            {key: MatchKeys.P1, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.X, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.P2, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.HANDICAP1_0, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.HANDICAP2_0, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.ONE_TO_SCORE, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.TWO_TO_SCORE, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.OVER2_5, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.UNDER2_5, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.OVER3, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.UNDER3, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.BTTS_YES, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.BTTS_NO, transform: (v: string) => truncate(v, 0)}
        ]
    },
    {
        label: 'Corridor',
        color: '#2e3d8b',
        btnText: 'к',
        fields: [
            {key: MatchKeys.P1, transform: (v: string) => truncate(v, 1)},
            {key: MatchKeys.X, transform: (v: string) => truncate(v, 1)},
            {key: MatchKeys.P2, transform: (v: string) => truncate(v, 1)},
        ]
    },
    {
        label: 'Total Model',
        color: '#8b2e31',
        btnText: 'т',
        fields: [
            {key: MatchKeys.P1, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.X, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.P2, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.HANDICAP1_0, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.HANDICAP2_0, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.ONE_TO_SCORE, transform: (v: string) => truncate(v, 1)},
            {key: MatchKeys.TWO_TO_SCORE, transform: (v: string) => truncate(v, 1)},
            {key: MatchKeys.OVER2_5, transform: (v: string) => truncate(v, 1)},
            {key: MatchKeys.UNDER2_5, transform: (v: string) => truncate(v, 1)},
            {key: MatchKeys.OVER3, transform: (v: string) => truncate(v, 1)},
            {key: MatchKeys.UNDER3, transform: (v: string) => truncate(v, 1)},
            {key: MatchKeys.BTTS_YES, transform: (v: string) => truncate(v, 1)},
            {key: MatchKeys.BTTS_NO, transform: (v: string) => truncate(v, 1)}
        ]
    },
    {
        label: 'LEAGUE Total Model',
        color: '#2e448b',
        btnText: 'lt',
        fields: [
            {key: MatchKeys.LEAGUE, transform: (v: string) => (v)},
            {key: MatchKeys.P1, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.X, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.P2, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.HANDICAP1_0, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.HANDICAP2_0, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.ONE_TO_SCORE, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.TWO_TO_SCORE, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.OVER2_5, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.UNDER2_5, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.OVER3, transform: (v: string) => truncate(v, 1)},
            {key: MatchKeys.UNDER3, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.BTTS_YES, transform: (v: string) => truncate(v, 0)},
            {key: MatchKeys.BTTS_NO, transform: (v: string) => truncate(v, 1)}
        ]
    }
];
