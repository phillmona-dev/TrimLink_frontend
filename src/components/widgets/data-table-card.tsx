import { Card } from "@/components/common/card";

export function DataTableCard({
  title,
  columns,
  rows
}: {
  title: string;
  columns: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <Card>
      <h3 className="text-lg font-bold">{title}</h3>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[540px] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th className="pb-3 font-semibold text-muted-foreground" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr className="border-b border-border/70" key={`${title}-${index}`}>
                {row.map((cell, cellIndex) => (
                  <td className="py-4" key={`${title}-${index}-${cellIndex}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
