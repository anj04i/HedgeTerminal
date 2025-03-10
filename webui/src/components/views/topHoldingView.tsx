import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TopHoldingsViewProps {
  topHoldings: any[];
  selectedFund: string;
}

export default function TopHoldingsView({
  topHoldings,
  selectedFund,
}: TopHoldingsViewProps) {
  return (
    <div className="mb-10">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold mb-1">Top Holdings</h2>
          <p className="text-zinc-500 text-sm">
            Largest positions for {selectedFund}
          </p>
        </div>
      </div>
      <div className="bg-black border border-zinc-900 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-zinc-900">
              <TableHead className="text-zinc-400 text-xs uppercase font-medium p-4 w-1/4">
                TITLE
              </TableHead>
              <TableHead className="text-zinc-400 text-xs uppercase font-medium p-4 w-1/4">
                CLASS
              </TableHead>
              <TableHead className="text-zinc-400 text-xs uppercase font-medium p-4 text-right w-1/4">
                VALUE (USD)
              </TableHead>
              <TableHead className="text-zinc-400 text-xs uppercase font-medium p-4 text-right w-1/4">
                % OF TOTAL
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topHoldings.map((h) => (
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
                  $
                  {typeof h.value_usd === 'number'
                    ? h.value_usd.toLocaleString('en-US')
                    : parseFloat(h.value_usd).toLocaleString('en-US')}
                </TableCell>
                <TableCell className="p-4 text-sm text-right font-mono">
                  {h.percentage_of_total}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
