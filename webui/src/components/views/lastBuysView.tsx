import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LastBuysViewProps {
  purchases: any[];
  selectedFund: string;
}

export default function LastBuysView({
  purchases,
  selectedFund,
}: LastBuysViewProps) {
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

  const sortedPurchases = useMemo(() => {
    if (!sortConfig.key) return purchases;

    return [...purchases].sort((a, b) => {
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
      if (sortConfig.key === 'value_usd') {
        const aValue =
          typeof a.value_usd === 'number'
            ? a.value_usd
            : parseFloat(a.value_usd);
        const bValue =
          typeof b.value_usd === 'number'
            ? b.value_usd
            : parseFloat(b.value_usd);

        return sortConfig.direction === 'ascending'
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });
  }, [purchases, sortConfig]);

  return (
    <div className="mb-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold mb-1">Recent Purchases</h2>
          <p className="text-zinc-500 text-sm">
            Latest holdings for {selectedFund}
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
                onClick={() => handleSort('value_usd')}
              >
                VALUE (USD)
                {sortConfig.key === 'value_usd' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPurchases.map((p) => (
              <TableRow
                key={`${p.title}-${p.class}`}
                className="hover:bg-zinc-800/50 border-zinc-900"
              >
                <TableCell className="p-4 text-sm font-medium">
                  {p.title}
                </TableCell>
                <TableCell className="p-4 text-sm text-zinc-300">
                  {p.class}
                </TableCell>
                <TableCell className="p-4 text-sm text-right font-mono">
                  $
                  {typeof p.value_usd === 'number'
                    ? p.value_usd.toLocaleString('en-US')
                    : parseFloat(p.value_usd).toLocaleString('en-US')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
