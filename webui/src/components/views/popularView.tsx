import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PopularViewProps {
  popularHoldings: any[];
}

export default function PopularView({ popularHoldings }: PopularViewProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'ascending' | 'descending';
  }>({ key: null, direction: 'ascending' });

  const handleSort = (key: string) => {
    setSortConfig((prevSortConfig) => ({
      key,
      direction:
        prevSortConfig.key === key && prevSortConfig.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));
  };

  const sortedHoldings = useMemo(() => {
    if (!sortConfig.key) return popularHoldings;

    return [...popularHoldings].sort((a, b) => {
      if (sortConfig.key === 'title') {
        return sortConfig.direction === 'ascending'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      if (sortConfig.key === 'class') {
        return sortConfig.direction === 'ascending'
          ? a.class.localeCompare(b.class)
          : b.class.localeCompare(a.class);
      }
      if (sortConfig.key === 'fund_count') {
        return sortConfig.direction === 'ascending'
          ? a.fund_count - b.fund_count
          : b.fund_count - a.fund_count;
      }
      return 0;
    });
  }, [popularHoldings, sortConfig]);

  return (
    <div className="mb-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold mb-1">Popular Holdings</h2>
          <p className="text-zinc-500 text-sm">
            Most widely held assets across funds
          </p>
        </div>
      </div>
      <div className="bg-black border border-zinc-900 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-zinc-900">
              <TableHead
                className="text-zinc-400 text-xs uppercase font-medium p-4 w-1/3 cursor-pointer hover:text-zinc-200"
                onClick={() => handleSort('title')}
              >
                TITLE
                {sortConfig.key === 'title' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="text-zinc-400 text-xs uppercase font-medium p-4 w-1/3 cursor-pointer hover:text-zinc-200"
                onClick={() => handleSort('class')}
              >
                CLASS
                {sortConfig.key === 'class' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="text-zinc-400 text-xs uppercase font-medium p-4 text-right w-1/3 cursor-pointer hover:text-zinc-200"
                onClick={() => handleSort('fund_count')}
              >
                FUND COUNT
                {sortConfig.key === 'fund_count' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedHoldings.map((h) => (
              <TableRow
                key={`${h.title}-${h.class}`}
                className="hover:bg-zinc-800/50 border-zinc-900"
              >
                <TableCell className="p-4 text-sm font-medium">
                  {h.title}
                </TableCell>
                <TableCell className="p-4 text-sm text-zinc-300">
                  {h.class}
                </TableCell>
                <TableCell className="p-4 text-sm text-right font-mono">
                  {h.fund_count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
