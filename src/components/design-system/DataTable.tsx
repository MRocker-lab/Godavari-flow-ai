import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  portal?: 'pilgrim' | 'command';
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  portal = 'command',
  emptyMessage = 'No matching records found.',
}: DataTableProps<T>) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;
    if (sortCol === col.key) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col.key);
      setSortAsc(true);
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortCol) return data;
    const col = columns.find((c) => c.key === sortCol);
    if (!col || !col.sortValue) return data;

    return [...data].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [data, sortCol, sortAsc, columns]);

  return (
    <div
      className={`w-full overflow-x-auto rounded-2xl border ${
        portal === 'command'
          ? 'bg-[#0F172A] border-slate-800 text-slate-200'
          : 'bg-white border-[#E5DFD5] text-slate-800'
      }`}
    >
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr
            className={`border-b text-xs uppercase tracking-wider font-semibold ${
              portal === 'command'
                ? 'bg-slate-900/90 border-slate-800 text-slate-400'
                : 'bg-[#FAF8F5] border-[#E5DFD5] text-slate-600'
            }`}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3.5 ${
                  col.sortable ? 'cursor-pointer select-none hover:text-cyan-400' : ''
                } ${col.className || ''}`}
                onClick={() => handleSort(col)}
              >
                <div className="inline-flex items-center gap-1.5">
                  <span>{col.header}</span>
                  {col.sortable && <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40">
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm opacity-70"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${
                  portal === 'command'
                    ? 'hover:bg-slate-800/60 border-b border-slate-800/60'
                    : 'hover:bg-slate-50 border-b border-slate-100'
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3.5 ${col.className || ''}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export interface MetricBarProps {
  label: string;
  valuePercent: number;
  valueLabel: string;
  portal?: 'pilgrim' | 'command';
}

export const MetricCapacityBar: React.FC<MetricBarProps> = ({
  label,
  valuePercent,
  valueLabel,
  portal = 'pilgrim',
}) => {
  const clamped = Math.max(0, Math.min(100, valuePercent));
  const barColor =
    clamped >= 88
      ? 'bg-red-500'
      : clamped >= 72
      ? 'bg-amber-500'
      : portal === 'command'
      ? 'bg-cyan-400'
      : 'bg-[#0D9488]';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className={portal === 'command' ? 'text-slate-300' : 'text-slate-700'}>
          {label}
        </span>
        <span className="font-mono font-semibold">{valueLabel}</span>
      </div>
      <div
        className={`w-full h-2 rounded-full overflow-hidden ${
          portal === 'command' ? 'bg-slate-800' : 'bg-slate-200'
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

