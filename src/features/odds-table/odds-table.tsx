import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  type ColumnDef,
  getCoreRowModel,
  createColumnHelper,
  useReactTable,
} from "@tanstack/react-table";
import type { Match } from "entities/match/types.ts";
import { debounce } from "shared/libs.ts";
import {
  MatchIndexMap,
  RusMatchKeys,
  MatchKeys,
  FILTER_ORDER,
} from "entities/match/consts.ts";
import { signatures } from "entities/filter/signatures.ts";
import {calculateBetResult, renderClean, getColumnIndex, type BetResult} from "./lib";
import { BetManagementService } from "entities/match/bet-management.ts";
import { Controls } from "features/odds-table/modules/controls";
import clsx from "clsx";
import { Button } from "shared/ui/Button";
import { EmptyData } from "features/odds-table/ui/emptyData.tsx";
import { Pagination } from "features/odds-table/ui/pagination.tsx";
import toast from "react-hot-toast";

const columnHelper = createColumnHelper<Match>();

// === Функции для кастомной фильтрации ===

const readFiltersFromURL = (sp: URLSearchParams): Record<string, string> => {
  const res: Record<string, string> = {};
  Object.entries(MatchIndexMap).forEach(([key, idx]) => {
    const v = sp.get(String(idx));
    if (v) {
      const label = RusMatchKeys[key as keyof typeof RusMatchKeys];
      if (label) res[label] = v;
    }
  });
  return res;
};

const writeFiltersToURL = (
  filters: Record<string, string>,
  setSearchParams: ReturnType<typeof useSearchParams>[1]
) => {
  const sp = new URLSearchParams();

  // Используем константу для порядка полей
  const orderedFields = FILTER_ORDER;

  // Сохраняем фильтры в определенном порядке
  for (const label of orderedFields) {
    const value = filters[label];
    if (value?.trim()) {
      const matchKey = Object.entries(RusMatchKeys).find(
        ([, name]) => name === label
      )?.[0];
      if (matchKey) {
        const idx = MatchIndexMap[matchKey as keyof typeof MatchIndexMap];
        sp.set(String(idx), value.trim());
      }
    }
  }

  setSearchParams(sp);
};

const applyPredicates = (
  data: Match[],
  filters: Record<string, string>
): Match[] => {
  const entries = Object.entries(filters);
  if (entries.length === 0) return data;

  const compiled = entries.map(([label, raw]) => {
    const idx = getColumnIndex(label);
    const q = raw.toLowerCase();
    return (row: Match) => {
      const rawValue = String(row[idx] ?? "");
      const val = renderClean(rawValue).toLowerCase();
      return val.includes(q);
    };
  });

  return data.filter((row) => {
    for (let i = 0; i < compiled.length; i++) {
      if (!compiled[i](row)) return false;
    }
    return true;
  });
};

// --- Функция получения результата ставки для ячейки
const getBetResultForCell = (columnId: string, Match: Match): BetResult | false => {
  const scoreStr = String(Match[MatchIndexMap[MatchKeys.SCORE]] || "");
  const halfStr = String(Match[MatchIndexMap[MatchKeys.FIRST_HALF_SCORE]] || "");

  const scoreMatch = scoreStr.match(/(\d+)-(\d+)/);
  const halfMatch = halfStr.match(/(\d+)-(\d+)/);

  if (!scoreMatch || !halfMatch) return false;

  const homeScore = parseInt(scoreMatch[1]);
  const awayScore = parseInt(scoreMatch[2]);

  const betColumns = {
    [RusMatchKeys[MatchKeys.P1]]: true,
    [RusMatchKeys[MatchKeys.X]]: true,
    [RusMatchKeys[MatchKeys.P2]]: true,
    [RusMatchKeys[MatchKeys.HANDICAP1_0]]: true,
    [RusMatchKeys[MatchKeys.HANDICAP2_0]]: true,
    [RusMatchKeys[MatchKeys.ONE_TO_SCORE]]: true,
    [RusMatchKeys[MatchKeys.TWO_TO_SCORE]]: true,
    [RusMatchKeys[MatchKeys.OVER2_5]]: true,
    [RusMatchKeys[MatchKeys.UNDER2_5]]: true,
    [RusMatchKeys[MatchKeys.OVER3]]: true,
    [RusMatchKeys[MatchKeys.UNDER3]]: true,
    [RusMatchKeys[MatchKeys.BTTS_YES]]: true,
    [RusMatchKeys[MatchKeys.BTTS_NO]]: true,
  } as const;

  if (betColumns[columnId as keyof typeof betColumns]) {
    return calculateBetResult(columnId, homeScore, awayScore);
  }

  return false;
};

// Маппинг ключей из signatures на заголовки колонок через RusMatchKeys
const signatureKeyToColumnHeader: Record<string, string> = {
  [MatchKeys.LEAGUE]: RusMatchKeys[MatchKeys.LEAGUE],
  [MatchKeys.P1]: RusMatchKeys[MatchKeys.P1],
  [MatchKeys.X]: RusMatchKeys[MatchKeys.X],
  [MatchKeys.P2]: RusMatchKeys[MatchKeys.P2],
  [MatchKeys.HANDICAP1_0]: RusMatchKeys[MatchKeys.HANDICAP1_0],
  [MatchKeys.HANDICAP2_0]: RusMatchKeys[MatchKeys.HANDICAP2_0],
  [MatchKeys.ONE_TO_SCORE]: RusMatchKeys[MatchKeys.ONE_TO_SCORE],
  [MatchKeys.TWO_TO_SCORE]: RusMatchKeys[MatchKeys.TWO_TO_SCORE],
  [MatchKeys.OVER2_5]: RusMatchKeys[MatchKeys.OVER2_5],
  [MatchKeys.UNDER2_5]: RusMatchKeys[MatchKeys.UNDER2_5],
  [MatchKeys.OVER3]: RusMatchKeys[MatchKeys.OVER3],
  [MatchKeys.UNDER3]: RusMatchKeys[MatchKeys.UNDER3],
  [MatchKeys.BTTS_YES]: RusMatchKeys[MatchKeys.BTTS_YES],
  [MatchKeys.BTTS_NO]: RusMatchKeys[MatchKeys.BTTS_NO],
};

type DataKey = keyof typeof MatchIndexMap;
const dataColumns: { key: DataKey; label: string; widthClass: string }[] = [
  { key: MatchKeys.WD, label: RusMatchKeys[MatchKeys.WD], widthClass: "w-11" },
  {
    key: MatchKeys.LEAGUE,
    label: RusMatchKeys[MatchKeys.LEAGUE],
    widthClass: "w-50",
  },
  {
    key: MatchKeys.DATE,
    label: RusMatchKeys[MatchKeys.DATE],
    widthClass: "w-25",
  },
  {
    key: MatchKeys.SCORE,
    label: RusMatchKeys[MatchKeys.SCORE],
    widthClass: "w-11",
  },
  {
    key: MatchKeys.FIRST_HALF_SCORE,
    label: RusMatchKeys[MatchKeys.FIRST_HALF_SCORE],
    widthClass: "w-12",
  },
  {
    key: MatchKeys.TEAMS,
    label: RusMatchKeys[MatchKeys.TEAMS],
    widthClass: "w-50",
  },
  { key: MatchKeys.P1, label: RusMatchKeys[MatchKeys.P1], widthClass: "w-11" },
  { key: MatchKeys.X, label: RusMatchKeys[MatchKeys.X], widthClass: "w-11" },
  { key: MatchKeys.P2, label: RusMatchKeys[MatchKeys.P2], widthClass: "w-11" },
  {
    key: MatchKeys.HANDICAP1_0,
    label: RusMatchKeys[MatchKeys.HANDICAP1_0],
    widthClass: "w-11",
  },
  {
    key: MatchKeys.HANDICAP2_0,
    label: RusMatchKeys[MatchKeys.HANDICAP2_0],
    widthClass: "w-11",
  },
  {
    key: MatchKeys.ONE_TO_SCORE,
    label: RusMatchKeys[MatchKeys.ONE_TO_SCORE],
    widthClass: "w-11",
  },
  {
    key: MatchKeys.TWO_TO_SCORE,
    label: RusMatchKeys[MatchKeys.TWO_TO_SCORE],
    widthClass: "w-11",
  },
  {
    key: MatchKeys.OVER2_5,
    label: RusMatchKeys[MatchKeys.OVER2_5],
    widthClass: "w-11",
  },
  {
    key: MatchKeys.UNDER2_5,
    label: RusMatchKeys[MatchKeys.UNDER2_5],
    widthClass: "w-11",
  },
  {
    key: MatchKeys.OVER3,
    label: RusMatchKeys[MatchKeys.OVER3],
    widthClass: "w-11",
  },
  {
    key: MatchKeys.UNDER3,
    label: RusMatchKeys[MatchKeys.UNDER3],
    widthClass: "w-11",
  },
  {
    key: MatchKeys.BTTS_YES,
    label: RusMatchKeys[MatchKeys.BTTS_YES],
    widthClass: "w-11",
  },
  {
    key: MatchKeys.BTTS_NO,
    label: RusMatchKeys[MatchKeys.BTTS_NO],
    widthClass: "w-12",
  },
];

const columns: ColumnDef<Match, string>[] = [
  ...dataColumns.map((c) =>
    columnHelper.accessor((row) => row[MatchIndexMap[c.key]], {
      id: c.label,
      header: c.label,
      cell: (ctx) => renderClean(String(ctx.getValue() ?? "")),
      meta: { widthClass: c.widthClass },
    })
  ),
  columnHelper.display({
    id: "Сигнатуры",
    header: "Сигнатуры",
    cell: () => "",
    meta: { widthClass: "w-20" },
  }),
  columnHelper.display({
    id: "Действия",
    header: "Действия",
    cell: () => "",
    meta: { widthClass: "w-24" },
  }),
];

export const OddsTable = React.memo(function OddsTable(props: {
  dataSet: Match[];
}) {
  const { dataSet } = props;
  const [pageIndex, setPageIndex] = React.useState<number>(0);
  const [pageSize, setPageSize] = React.useState<number>(28);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSignatures, setActiveSignatures] = React.useState<
    Record<string, string | null>
  >({});

  // Состояния для кастомной фильтрации
  const [inputs, setInputs] = React.useState<Record<string, string>>({});
  const [appliedFilters, setAppliedFilters] = React.useState<
    Record<string, string>
  >({});

  // Сервис управления ставками
  const betService = React.useMemo(
    () => BetManagementService.getInstance(),
    []
  );

  // Debounce функция для применения фильтров
  const debouncedApply = React.useCallback(
    debounce((newFilters: Record<string, string>) => {
      setAppliedFilters(newFilters);
      writeFiltersToURL(newFilters, setSearchParams);
    }, 300),
    []
  );

  // Cleanup для debounce при размонтировании
  React.useEffect(() => {
    return () => {
      debouncedApply.cancel();
    };
  }, [debouncedApply]);

  // Обработчик изменения инпутов
  const onInputChange = React.useCallback(
    (columnId: string, value: string) => {
      setInputs((prevInputs) => {
        const newInputs = { ...prevInputs, [columnId]: value };

        // Применяем debounce для обновления appliedFilters
        debouncedApply(newInputs);

        return newInputs;
      });
    },
    [debouncedApply]
  );

  // Состояние для подсвеченных строк
  const [highlightedRows, setHighlightedRows] = React.useState<Set<string>>(
    new Set()
  );

  // Загрузка фильтров из URL при монтировании
  React.useEffect(() => {
    const urlFilters = readFiltersFromURL(searchParams);
    if (Object.keys(urlFilters).length > 0) {
      setInputs(urlFilters);
      setAppliedFilters(urlFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Загрузка подсвеченных строк при монтировании и при изменении сохраненных матчей
  React.useEffect(() => {
    // Загружаем выделенные матчи из localStorage
    const highlightedMatches = betService.getHighlightedMatches();
    console.log("Loaded highlighted matches from localStorage:", Array.from(highlightedMatches));

    setHighlightedRows(highlightedMatches);
  }, [betService, dataSet]); // Добавляем dataSet как зависимость для обновления при изменении данных

  React.useEffect(() => {
    // Сбрасываем активные сигнатуры, если фильтры сброшены
    if (Object.keys(inputs).length === 0) {
      setActiveSignatures({});
    }
  }, [inputs]);

  // refs для расчета доступной высоты
  const tableAreaRef = React.useRef<HTMLDivElement | null>(null);

  // Универсальный хендлер для сигнатур
  const handleSignatureClick = React.useCallback(
    (signature: (typeof signatures)[0], match: Match) => {
      const matchId = `${match[MatchIndexMap[MatchKeys.TEAMS]]}_${
        match[MatchIndexMap[MatchKeys.DATE]]
      }`;

      // Перезаписываем активную сигнатуру для этого матча
      setActiveSignatures({ [matchId]: signature.label });

      // Обновляем inputs
      setInputs(() => {
        const coefficientColumns = Object.values(signatureKeyToColumnHeader);

        // Сбрасываем все колонки коэффициентов
        const clearedInputs: Record<string, string> = {};
        coefficientColumns.forEach((col) => {
          clearedInputs[col] = "";
        });

        // Применяем поля из сигнатуры
        signature.fields.forEach((field) => {
          const columnHeader = signatureKeyToColumnHeader[field.key];
          if (columnHeader) {
            const columnIndex = dataColumns.findIndex(
              (col) => col.label === columnHeader
            );
            if (columnIndex !== -1) {
              const value = String(
                match[MatchIndexMap[dataColumns[columnIndex].key]] || ""
              );
              clearedInputs[columnHeader] = field.transform(value);
            }
          }
        });

        debouncedApply(clearedInputs);
        return clearedInputs;
      });
    },
    [debouncedApply]
  );

  // Обработчик сохранения матча
  const handleSaveMatch = React.useCallback(
    (match: Match) => {
      try {
        // Используем текущие значения инпутов, если appliedFilters пустой
        const filtersToSave =
          Object.keys(appliedFilters).length > 0 ? appliedFilters : inputs;
        console.log("Saving match with filters:", filtersToSave);

        // Запрашиваем тип ставки перед сохранением
        // eslint-disable-next-line no-alert
        const enteredBetType = window.prompt(
          "Введите тип ставки (например: П1, Х, П2, ТБ2.5 и т.д.)",
          ""
        );

        const saved = betService.saveMatch(match, filtersToSave);

        if (enteredBetType && enteredBetType.trim()) {
          betService.updateMatch(saved.id, { betType: enteredBetType.trim() });
          toast.success("Матч сохранен и тип ставки добавлен!");
        } else {
          toast.success("Матч сохранен в историю!");
        }
      } catch (error) {
        console.error("Ошибка сохранения матча:", error);
        toast.error("Ошибка сохранения матча");
      }
    },
    [appliedFilters, inputs, betService]
  );

  const handleToggleHighlight = (matchId: string) => {
    console.log("Toggling highlight for matchId:", matchId);

    // Используем BetManagementService для сохранения в localStorage
    const isHighlighted = betService.toggleHighlight(matchId);
    console.log("Highlight status:", isHighlighted);

    // Обновляем локальное состояние
    setHighlightedRows((prev) => {
      const newHighlightedRows = new Set(prev);
      if (isHighlighted) {
        newHighlightedRows.add(matchId);
        console.log("Added highlight for:", matchId);
      } else {
        newHighlightedRows.delete(matchId);
        console.log("Removed highlight for:", matchId);
      }

      // Также обновляем статус в сохраненном матче, если он существует
      const savedMatches = betService.getSavedMatches();
      const savedMatch = savedMatches.find((match) => {
        const id = `${match.matchData.teams}_${match.matchData.date}`;
        return id === matchId;
      });

      if (savedMatch) {
        betService.updateMatch(savedMatch.id, {
          isHighlighted: isHighlighted,
        });
        console.log(
          "Updated saved match:",
          savedMatch.id,
          "isHighlighted:",
          isHighlighted
        );
      }

      return newHighlightedRows;
    });
  };


  // Применяем кастомную фильтрацию
  const filteredData = React.useMemo(() => {
    return applyPredicates(dataSet, appliedFilters);
  }, [dataSet, appliedFilters]);

  // таблица
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Сброс pageIndex при изменении фильтров
  React.useEffect(() => {
    setPageIndex(0);
  }, [appliedFilters]);

  // пагинация
  const allRows = table.getRowModel().rows;
  const pageCount = Math.max(1, Math.ceil(allRows.length / pageSize));
  const pageMatches = React.useMemo(
    () => allRows.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize),
    [allRows, pageIndex, pageSize]
  );

  const financialResults = useMemo(() => {
    const totals: Record<string, number> = {
      П1: 0,
      Х: 0,
      П2: 0,
      "Ф1(0)": 0,
      "Ф2(0)": 0,
      "1 заб": 0,
      "2 заб": 0,
      "ТБ2.5": 0,
      "ТМ2.5": 0,
      ТБ3: 0,
      ТМ3: 0,
      "Оз-да": 0,
      "Оз-нет": 0,
    };

    // Предвычисленные индексы для быстрого доступа
    const scoreIndex = MatchIndexMap[MatchKeys.SCORE];
    const betIndices = {
      П1: MatchIndexMap[MatchKeys.P1],
      Х: MatchIndexMap[MatchKeys.X],
      П2: MatchIndexMap[MatchKeys.P2],
      "Ф1(0)": MatchIndexMap[MatchKeys.HANDICAP1_0],
      "Ф2(0)": MatchIndexMap[MatchKeys.HANDICAP2_0],
      "1 заб": MatchIndexMap[MatchKeys.ONE_TO_SCORE],
      "2 заб": MatchIndexMap[MatchKeys.TWO_TO_SCORE],
      "ТБ2.5": MatchIndexMap[MatchKeys.OVER2_5],
      "ТМ2.5": MatchIndexMap[MatchKeys.UNDER2_5],
      ТБ3: MatchIndexMap[MatchKeys.OVER3],
      ТМ3: MatchIndexMap[MatchKeys.UNDER3],
      "Оз-да": MatchIndexMap[MatchKeys.BTTS_YES],
      "Оз-нет": MatchIndexMap[MatchKeys.BTTS_NO],
    };

    pageMatches.forEach((row) => {
      const match = row.original;

      // Проверяем, есть ли счет у матча
      const score = String(match[scoreIndex] || "");
      if (
        !score ||
        score.trim() === "" ||
        score === "undefined" ||
        score === "null"
      ) {
        return; // Пропускаем матчи без счета
      }

      // Прямой доступ к данным по индексам
      Object.entries(betIndices).forEach(([betType, index]) => {
        const coef = Number(match[index]);
        if (!isNaN(coef)) {
          const result = getBetResultForCell(betType, match);
          switch (result) {
            case "lose":
              totals[betType] += - 1;
              break;
            case "win":
              totals[betType] += coef - 1;
              break;
            default:
              break;
          }
        }
      });
    });

    return totals;
  }, [pageMatches]);

  return (
    <div className="flex flex-col h-full">
      {/* Основной контейнер */}
      <div className="bg-white/5 backdrop-blur-xl overflow-hidden flex flex-col h-full">
        <Controls
          rowCount={allRows.length}
          setInputs={setInputs}
          setAppliedFilters={setAppliedFilters}
          setSearchParams={setSearchParams}
          debouncedApply={debouncedApply}
          pageSize={pageSize}
          setPageSize={setPageSize}
          setPageIndex={setPageIndex}
        />

        {/* Таблица - занимает всю доступную высоту */}
        <div className="flex-1 overflow-hidden" ref={tableAreaRef}>
          <div className="max-h-[100%] overflow-x-auto overflow-y-auto border border-slate-700 rounded-lg">
            <table className="w-full table-fixed border-collapse overflow-auto h-full min-w-[1200px] sm:min-w-[1000px]">
              <thead className="sticky top-0 z-10">
                {table.getHeaderGroups().map((hg) => (
                  <tr
                    key={hg.id}
                    className="h-8 bg-gradient-to-r from-slate-800 to-slate-700"
                  >
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        title={h.column.id}
                        className={`text-left p-0.5 border-b border-slate-600 text-white font-semibold text-xs leading-tight ${
                          (
                            h.column.columnDef as {
                              meta?: { widthClass?: string };
                            }
                          ).meta?.widthClass ?? "w-1/12"
                        }`}
                      >
                        <div className="relative">
                          <div className="select-none text-blue-300 font-bold mb-1 text-center text-xs">
                            {h.column.id}
                          </div>

                          {/* Значение флета над инпутом */}
                          {financialResults &&
                            financialResults[h.column.id] !== undefined && (
                              <div
                                className={clsx(
                                  "mb-1 text-xs font-bold rounded-sm text-center",
                                  financialResults[h.column.id] > 0
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                                )}
                              >
                                {financialResults[h.column.id].toFixed(2)}
                              </div>
                            )}

                          {/* Поле фильтра только для колонок с данными */}
                          {h.column.id !== "Сигнатуры" && h.column.id !== "Действия" && (
                            <input
                              value={inputs[h.column.id] || ""}
                              onChange={(e) =>
                                onInputChange(h.column.id, e.target.value)
                              }
                              placeholder={h.column.id}
                              className="w-full px-1 py-0.5 text-xs bg-slate-700/50 border border-slate-600 rounded outline-none transition-all duration-200 text-white placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent hover:bg-slate-700 min-w-0"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody className="divide-y divide-slate-700/50">
                {pageMatches.map((match, matchIndex) => {
                  // Создаем уникальный ID на основе данных матча
                  // match.original содержит массив данных
                  const teams = String(
                    match.original[MatchIndexMap[MatchKeys.TEAMS]] || ""
                  );
                  const date = String(
                    match.original[MatchIndexMap[MatchKeys.DATE]] || ""
                  );

                  const matchId = `${teams}_${date}`;
                  const isHighlighted = highlightedRows.has(matchId);

                  return (
                    <tr
                      key={matchId}
                      className={`h-8 transition-all duration-200 ${
                        isHighlighted
                          ? "bg-yellow-500/20"
                          : "hover:bg-slate-800/30"
                      } ${
                        matchIndex % 2 === 0
                          ? "bg-slate-900/30"
                          : "bg-slate-800/20"
                      }`}
                    >
                      {match.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={`p-0.5 text-slate-300 text-xs leading-tight cursor-pointer transition-all duration-200 hover:bg-slate-700/50 hover:text-white group text-center overflow-hidden ${
                            (
                              cell.column.columnDef as {
                                meta?: { widthClass?: string };
                              }
                            ).meta?.widthClass ?? "w-1/12"
                          }`}
                          style={{
                            backgroundColor: (() => {
                              const betResult = getBetResultForCell(
                                cell.column.id,
                                match.original
                              );
                              if (betResult === "win") {
                                return "rgba(34, 197, 94, 0.2)";
                              } else if (betResult === "return") {
                                return "rgba(253, 224, 71, 0.2)"
                              }
                              return "transparent";
                            })(),
                          }}
                          onClick={() => {
                            const value = String(cell.getValue() ?? "");
                            const cleanValue = renderClean(value);
                            if (cleanValue && cleanValue.trim()) {
                              onInputChange(cell.column.id, cleanValue.trim());
                            }
                          }}
                          title={renderClean(String(cell.getValue() ?? ""))}
                        >
                          {cell.column.id === "Сигнатуры" ? (
                            <div className="flex gap-1 justify-center">
                              {signatures.map((signature) => (
                                <button
                                  key={signature.label}
                                  className={clsx(
                                    "flex-1 basis-0 text-xs rounded transition-all cursor-pointer border",
                                    activeSignatures[matchId] ===
                                      signature.label
                                      ? "border-white text-white"
                                      : "border-transparent text-gray-200",
                                    "hover:border-gray-400"
                                  )}
                                  style={{
                                    backgroundColor: signature.color,
                                  }}
                                  onClick={() =>
                                    handleSignatureClick(
                                      signature,
                                      match.original
                                    )
                                  }
                                >
                                  {signature.btnText}
                                </button>
                              ))}
                            </div>
                          ) : cell.column.id === "Действия" ? (
                            <div className="flex gap-1 justify-center">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  handleToggleHighlight(matchId);
                                }}
                                className="cursor-pointer"
                              >
                                {isHighlighted ? "✅" : "✏️"}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  handleSaveMatch(match.original);
                                }}
                                className="cursor-pointer"
                              >
                                💾
                              </Button>
                            </div>
                          ) : (
                            <div>
                              {(() => {
                                const betResult = getBetResultForCell(
                                  cell.column.id,
                                  match.original
                                );
                                const value = renderClean(
                                  String(cell.getValue() ?? "")
                                );

                                if (betResult === "win") {
                                  return (
                                    <span className="text-green-300 font-semibold">
                                      {value}
                                    </span>
                                  );
                                }
                                return value;
                              })()}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {pageMatches.length === 0 && (
                  <EmptyData columnsLength={columns.length} />
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          setPageIndex={setPageIndex}
          pageCount={pageCount}
          pageIndex={pageIndex}
        />
      </div>
    </div>
  );
});
