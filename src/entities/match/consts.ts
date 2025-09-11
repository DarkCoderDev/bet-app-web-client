export const WD = "wd";
export const LEAGUE = "league";
export const DATE = "date";
export const SCORE = "score";
export const FIRST_HALF_SCORE = "firstHalfScore";
export const SECOND_HALF_SCORE = "secondHalfScore";
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
export const MARGIN_1X2 = "margin_1x2";
export const MARGIN_OU_2_5 = "margin_ou_2_5";
export const MARGIN_OU_3 = "margin_ou_3";
export const MARGIN_BTTS = "margin_btts";

export const MatchKeys = {
    WD,
    LEAGUE,
    DATE,
    SCORE,
    FIRST_HALF_SCORE,
    SECOND_HALF_SCORE,
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
    MARGIN_1X2,
    MARGIN_OU_2_5,
    MARGIN_OU_3,
    MARGIN_BTTS,
} as const;

export type DataKey = keyof typeof MatchIndexMap;
export const MatchIndexMap = {
    [WD]: 0,
    [LEAGUE]: 1,
    [DATE]: 2,
    [SCORE]: 3,
    [FIRST_HALF_SCORE]: 4,
    [SECOND_HALF_SCORE]: 5,
    [TEAMS]: 6,
    [P1]: 7,
    [X]: 8,
    [P2]: 9,
    [HANDICAP1_0]: 10,
    [HANDICAP2_0]: 11,
    [ONE_TO_SCORE]: 12,
    [TWO_TO_SCORE]: 13,
    [OVER2_5]: 14,
    [UNDER2_5]: 15,
    [OVER3]: 16,
    [UNDER3]: 17,
    [BTTS_YES]: 18,
    [BTTS_NO]: 19,
    [MARGIN_1X2]: 20,
    [MARGIN_OU_2_5]: 21,
    [MARGIN_OU_3]: 22,
    [MARGIN_BTTS]: 23,
} as const;

export const RusMatchKeys = {
    [WD]: 'День',
    [LEAGUE]: 'Лига',
    [DATE]: 'Дата',
    [SCORE]: 'Счет',
    [FIRST_HALF_SCORE]: '1 тайм',
    [SECOND_HALF_SCORE]: '2 тайм',
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
    [MARGIN_1X2]: 'Маржа 1X2',
    [MARGIN_OU_2_5]: 'Маржа ТБ/ТМ2.5',
    [MARGIN_OU_3]: 'Маржа ТБ/ТМ3',
    [MARGIN_BTTS]: 'Маржа ОЗ',
} as const;

// Порядок полей для сохранения в URL
export const FILTER_ORDER = [
    RusMatchKeys[LEAGUE],
    RusMatchKeys[TEAMS],
    RusMatchKeys[P1],
    RusMatchKeys[X],
    RusMatchKeys[P2],
    RusMatchKeys[SECOND_HALF_SCORE],
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
    RusMatchKeys[MARGIN_1X2],
    RusMatchKeys[MARGIN_OU_2_5],
    RusMatchKeys[MARGIN_OU_3],
    RusMatchKeys[MARGIN_BTTS],
] as const;


