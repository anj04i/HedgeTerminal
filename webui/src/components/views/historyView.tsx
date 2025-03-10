import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface HistoryViewProps {
  filings: any[];
  selectedFund: string;
  handleExportCSV: () => void;
}

export default function HistoryView({
  filings,
  selectedFund,
  handleExportCSV,
}: HistoryViewProps) {
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

  // Prepare filings with QoQ data ahead of time
  const filingsWithQoQ = useMemo(() => {
    return filings.map((filing, idx) => {
      const prevFiling = idx > 0 ? filings[idx - 1] : null;
      const qoqChange = prevFiling
        ? ((filing.value_usd / prevFiling.value_usd - 1) * 100).toFixed(2)
        : null;
      return {
        ...filing,
        qoqChange,
        qoqChangeValue: qoqChange ? parseFloat(qoqChange) : null,
      };
    });
  }, [filings]);
  const sortedFilings = useMemo(() => {
    if (!sortConfig.key) return filingsWithQoQ;

    return [...filingsWithQoQ].sort((a, b) => {
      if (sortConfig.key === 'quarter') {
        return sortConfig.direction === 'ascending'
          ? a.quarter.localeCompare(b.quarter)
          : b.quarter.localeCompare(a.quarter);
      }
      if (sortConfig.key === 'value_usd') {
        return sortConfig.direction === 'ascending'
          ? a.value_usd - b.value_usd
          : b.value_usd - a.value_usd;
      }
      if (sortConfig.key === 'change') {
        const aChange = a.qoqChangeValue ?? -Infinity;
        const bChange = b.qoqChangeValue ?? -Infinity;
        return sortConfig.direction === 'ascending'
          ? aChange - bChange
          : bChange - aChange;
      }
      return 0;
    });
  }, [filingsWithQoQ, sortConfig]);

  return (
    <div className="mb-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold mb-1">Filing History</h2>
          <p className="text-zinc-500 text-sm">
            Complete record of {selectedFund} 13F filings
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs bg-transparent border-zinc-900 text-white hover:bg-zinc-900 hover:text-white hover:border-zinc-800"
          onClick={handleExportCSV}
        >
          Export CSV
        </Button>
      </div>
      <div className="bg-black border border-zinc-900 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-zinc-900">
              <TableHead className="text-zinc-400 text-xs uppercase font-medium p-4 w-1/4">
                FUND
              </TableHead>
              <TableHead
                className="text-zinc-400 text-xs uppercase font-medium p-4 w-1/4 cursor-pointer hover:text-zinc-200"
                onClick={() => handleSort('quarter')}
              >
                QUARTER
                {sortConfig.key === 'quarter' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="text-zinc-400 text-xs uppercase font-medium p-4 text-right w-1/4 cursor-pointer hover:text-zinc-200"
                onClick={() => handleSort('value_usd')}
              >
                AUM
                {sortConfig.key === 'value_usd' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="text-zinc-400 text-xs uppercase font-medium p-4 text-right w-1/4 cursor-pointer hover:text-zinc-200"
                onClick={() => handleSort('change')}
              >
                CHANGE (QoQ)
                {sortConfig.key === 'change' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFilings.map((f) => {
              return (
                <TableRow
                  key={f.quarter}
                  className="hover:bg-zinc-800/50 border-zinc-900"
                >
                  <TableCell className="p-4 text-sm font-medium">
                    {selectedFund}
                  </TableCell>
                  <TableCell className="p-4 text-sm text-zinc-300">
                    {f.quarter}
                  </TableCell>
                  <TableCell className="p-4 text-sm text-right font-mono">
                    ${f.value_usd.toLocaleString()}
                  </TableCell>
                  <TableCell className="p-4 text-sm text-right font-medium">
                    {f.qoqChange ? (
                      <span
                        className={`px-2 py-1 rounded ${f.qoqChangeValue >= 0 ? 'bg-emerald-950/70 text-emerald-400' : 'bg-red-950/70 text-red-400'}`}
                      >
                        {f.qoqChangeValue >= 0 ? '+' : ''}
                        {f.qoqChange}%
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
