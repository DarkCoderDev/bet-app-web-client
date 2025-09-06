export const WD = "wd";
export const LEAGUE = "league";
export const DATE = "date";
export const SCORE = "score";
export const FIRST_HALF_SCORE = "firstHalfScore";
export const TEAMS = "teams";
export const P1 = "p1";
export const X = "x";
export const P2 = "p2";
export const HANDICAP1_0 = "handicap1_0";
export const HANDICAP2_0 = "handicap2_0";
export const ONE_TO_SCORE = "oneToScore";
export const TWO_TO_SCORE = "twoToScore";
export const OVER2_5 = "over2_5";
export const UNDER2_5 = "under2_5";
export const OVER3 = "over3";
export const UNDER3 = "under3";
export const BTTS_YES = "bttsYes";
export const BTTS_NO = "bttsNo";

export const MatchKeys = {
    WD,
    LEAGUE,
    DATE,
    SCORE,
    FIRST_HALF_SCORE,
    TEAMS,
    P1,
    X,
    P2,
    HANDICAP1_0,
    HANDICAP2_0,
    ONE_TO_SCORE,
    TWO_TO_SCORE,
    OVER2_5,
    UNDER2_5,
    OVER3,
    UNDER3,
    BTTS_YES,
    BTTS_NO,
} as const;

export type DataKey = keyof typeof MatchIndexMap;
export const MatchIndexMap = {
    [WD]: 0,
    [LEAGUE]: 1,
    [DATE]: 2,
    [SCORE]: 3,
    [FIRST_HALF_SCORE]: 4,
    [TEAMS]: 5,
    [P1]: 6,
    [X]: 7,
    [P2]: 8,
    [HANDICAP1_0]: 9,
    [HANDICAP2_0]: 10,
    [ONE_TO_SCORE]: 11,
    [TWO_TO_SCORE]: 12,
    [OVER2_5]: 13,
    [UNDER2_5]: 14,
    [OVER3]: 15,
    [UNDER3]: 16,
    [BTTS_YES]: 17,
    [BTTS_NO]: 18,
} as const;

export const RusMatchKeys = {
    [WD]: 'День',
    [LEAGUE]: 'Лига',
    [DATE]: 'Дата',
    [SCORE]: 'Счет',
    [FIRST_HALF_SCORE]: '1 тайм',
    [TEAMS]: 'Команды',
    [P1]: 'П1',
    [X]: 'Х',
    [P2]: 'П2',
    [HANDICAP1_0]: 'Ф1(0)',
    [HANDICAP2_0]: 'Ф2(0)',
    [ONE_TO_SCORE]: '1 заб',
    [TWO_TO_SCORE]: '2 заб',
    [OVER2_5]: 'ТБ2.5',
    [UNDER2_5]: 'ТМ2.5',
    [OVER3]: 'ТБ3',
    [UNDER3]: 'ТМ3',
    [BTTS_YES]: 'Оз-да',
    [BTTS_NO]: 'Оз-нет',
} as const;

// Порядок полей для сохранения в URL
export const FILTER_ORDER = [
    RusMatchKeys[TEAMS],
    RusMatchKeys[P1],
    RusMatchKeys[X],
    RusMatchKeys[P2],
    RusMatchKeys[HANDICAP1_0],
    RusMatchKeys[HANDICAP2_0],
    RusMatchKeys[ONE_TO_SCORE],
    RusMatchKeys[TWO_TO_SCORE],
    RusMatchKeys[OVER2_5],
    RusMatchKeys[UNDER2_5],
    RusMatchKeys[OVER3],
    RusMatchKeys[UNDER3],
    RusMatchKeys[BTTS_YES],
    RusMatchKeys[BTTS_NO],
] as const;


