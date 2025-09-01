// src/components/DataTable.tsx
import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    type ColumnFiltersState,
    type SortingState,
    type FilterFn,
} from "@tanstack/react-table";

type Row = string[];

// --- хелперы
const stripTags = (html: string) =>
    html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();

const includesText: FilterFn<Row> = (row, columnId, filterValue) => {
    const v = String(row.getValue(columnId) ?? "");
    return stripTags(v).toLowerCase().includes(String(filterValue ?? "").toLowerCase());
};

const extractEpoch = (v: string): number => {
    const m = v.match(/>(\d{9,})<\/span>/); // секунды в скрытом span
    return m ? Number(m[1]) : 0;
};

const renderClean = (v: string) => stripTags(v);

// -------------------- Таблица --------------------
export function DataTable({data}: { data: Row[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [pageIndex, setPageIndex] = React.useState(0);
    const [pageSize, setPageSize] = React.useState(50);

    // колонки
    const columns = React.useMemo<ColumnDef<Row>[]>(() => {
        if (!data?.length) return [];
        const cols: ColumnDef<Row>[] = [];

        const headers = [
            "День",      // 0
            "Турнир",    // 1 (HTML)
            "Дата",      // 2 (скрытый epoch + текст)
            "Счёт",      // 3
            "Счёт (1Т)", // 4
            "Матч",      // 5 (HTML)
        ];

        headers.forEach((h, idx) => {
            if (idx === 2) {
                cols.push({
                    id: `c${idx}`,
                    header: h,
                    accessorFn: (row) => row[idx],
                    cell: (ctx) => renderClean(ctx.getValue<string>()),
                    sortingFn: (a, b, colId) => {
                        const av = extractEpoch(a.getValue(colId) as string);
                        const bv = extractEpoch(b.getValue(colId) as string);
                        return av - bv;
                    },
                    filterFn: includesText,
                } as ColumnDef<Row> & { filterFn: FilterFn<Row> });
            } else {
                cols.push({
                    id: `c${idx}`,
                    header: h,
                    accessorFn: (row) => row[idx],
                    cell: (ctx) => renderClean(ctx.getValue<string>()),
                    filterFn: includesText,
                } as ColumnDef<Row> & { filterFn: FilterFn<Row> });
            }
        });

        // коэффициенты
        const totalCols = data[0].length;
        for (let i = 6; i < totalCols; i++) {
            cols.push({
                id: `c${i}`,
                header: `K${i}`,
                accessorFn: (row) => row[i],
                cell: (ctx) => renderClean(ctx.getValue<string>()),
                filterFn: includesText,
            } as ColumnDef<Row> & { filterFn: FilterFn<Row> });
        }

        return cols;
    }, [data]);

    // таблица
    const table = useReactTable({
        data,
        columns,
        state: {sorting, columnFilters},
        onSortingChange: (u) => setSorting(typeof u === "function" ? u(sorting) : u),
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        filterFns: {includesText},
        enableColumnFilters: true,
    });

    // пагинация
    const allRows = table.getRowModel().rows;
    const pageCount = Math.max(1, Math.ceil(allRows.length / pageSize));
    const pageRows = React.useMemo(
        () => allRows.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize),
        [allRows, pageIndex, pageSize]
    );

    React.useEffect(() => setPageIndex(0), [sorting, columnFilters]);

    const thStyle: React.CSSProperties = {
        textAlign: "left",
        padding: "8px 10px",
        borderBottom: "1px solid #eee",
        verticalAlign: "top"
    };
    const tdStyle: React.CSSProperties = {padding: "8px 10px", borderBottom: "1px solid #f5f5f5"};

    return (
        <div style={{display: "grid", gap: 12}}>
            {/* панель */}
            <div style={{display: "flex", gap: 12, alignItems: "center"}}>
                <label>
                    На странице:&nbsp;
                    <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                        {[25, 50, 100, 250].map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </label>
                <div style={{marginLeft: "auto", opacity: 0.7, fontSize: 12}}>
                    Найдено: {allRows.length.toLocaleString()}
                </div>
            </div>

            {/* таблица */}
            <div style={{overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 8}}>
                <table style={{width: "100%", borderCollapse: "collapse"}}>
                    <thead>
                    {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id}>
                            {hg.headers.map((h) => (
                                <th
                                    key={h.id}
                                    style={thStyle}
                                    onClick={h.column.getToggleSortingHandler()}
                                    title="Клик для сортировки"
                                >
                                    <div style={{userSelect: "none", cursor: "pointer"}}>
                                        {flexRender(h.column.columnDef.header, h.getContext())}
                                        {{
                                            asc: " ▲",
                                            desc: " ▼",
                                        }[h.column.getIsSorted() as string] ?? null}
                                    </div>

                                    {/* поле фильтра */}
                                    <div style={{marginTop: 6}}>
                                        <input
                                            value={(h.column.getFilterValue() as string) ?? ""}
                                            onChange={(e) => h.column.setFilterValue(e.target.value)}
                                            placeholder="фильтр…"
                                            style={{width: "100%", padding: "4px 6px", fontSize: 12}}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>

                    <tbody>
                    {pageRows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} style={tdStyle}>
                                    {renderClean(String(cell.getValue() ?? ""))}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {pageRows.length === 0 && (
                        <tr>
                            <td colSpan={columns.length}
                                style={{padding: 20, textAlign: "center", fontSize: 14, opacity: 0.7}}>
                                Ничего не найдено
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* пагинация */}
            <div style={{display: "flex", gap: 8, alignItems: "center"}}>
                <button onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>«</button>
                <button onClick={() => setPageIndex((p) => Math.max(0, p - 1))} disabled={pageIndex === 0}>‹</button>
                <span style={{fontSize: 12}}>
          {pageIndex + 1} / {pageCount}
        </span>
                <button
                    onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                    disabled={pageIndex >= pageCount - 1}
                >
                    ›
                </button>
                <button
                    onClick={() => setPageIndex(pageCount - 1)}
                    disabled={pageIndex >= pageCount - 1}
                >
                    »
                </button>
            </div>
        </div>
    );
}

// -------------------- App с загрузкой .gz --------------------

export default function App() {
    const [rows, setRows] = React.useState<Row[] | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        void async function getdata() {
            // Запрашиваем весь сжатый dataset
try {
    const response = await fetch('/coefficient-total-compressed.gz ', {
        headers: {
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    setRows(result.data)
} catch (e) {
    console.log(e)
}
        }();
    }, []);

    if (error) {
        return (
            <div style={{padding: 16}}>
                <h3>Ошибка загрузки</h3>
                <pre style={{whiteSpace: "pre-wrap"}}>{error}</pre>
            </div>
        );
    }

    if (!rows) {
        return (
            <div style={{padding: 16}}>
                <h3>Загрузка данных…</h3>
            </div>
        );
    }

    return (
        <div style={{padding: 16, maxWidth: 1400, margin: "0 auto"}}>
            <h1>Серия A — таблица</h1>
            <p style={{opacity: 0.7, marginTop: 4}}>
                Данные загружаются из <code>/coefficient-total-compressed.gz</code>. Фильтры по колонкам, сортировка по
                клику, пагинация.
            </p>
            <DataTable data={rows}/>
        </div>
    );
}
