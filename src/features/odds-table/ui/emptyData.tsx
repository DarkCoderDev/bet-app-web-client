
type Props = {
    columnsLength: number;
}

export const EmptyData = (props: Props) => {
    return (
        <tr>
            <td colSpan={props.columnsLength}
                className="p-8 text-center text-slate-400 text-lg">
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-500" fill="none"
                             stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"/>
                        </svg>
                    </div>
                    <span>Ничего не найдено</span>
                </div>
            </td>
        </tr>
    )
}
