interface Column {
  key: string;
  label: string;
  className?: string;
}

interface TableProps {
  columns: Column[];
  rows: Record<string, React.ReactNode>[];
  caption?: string;
}

export function Table({ columns, rows, caption }: TableProps) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse text-sm text-ink">
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}
        <thead>
          <tr className="bg-[#E9E4D9]">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={[
                  "px-4 py-3 text-left",
                  "text-xs font-semibold uppercase tracking-wider text-soilBrown",
                  "border-b border-border",
                  col.className ?? "",
                ].join(" ")}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-border hover:bg-[#EAE7DF] transition-colors duration-100"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={[
                    "px-4 py-3",
                    col.className ?? "",
                  ].join(" ")}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
