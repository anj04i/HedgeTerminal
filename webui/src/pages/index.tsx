import { useState, useEffect } from 'react';
import { apiConfig, config, fundMap } from '@/components/dashboard/config';
import AdvancedMetrics from '@/components/dashboard/advancedMetrics';
import AumChart from '@/components/dashboard/aumChart';
import FundHeader from '@/components/dashboard/fundHeader';
import QuarterlyPerformance from '@/components/dashboard/quaterlyPerformance';
import RecentPurchases from '@/components/dashboard/recentPurchases';
import SectorDistribution from '@/components/dashboard/sectorDistribution';
import SimilarFunds from '@/components/dashboard/similarFunds';
import { Download, Search } from 'lucide-react';
import {
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandDialog,
} from '@/components/ui/command';
import { useFundData } from '@/components/hooks/useFundData';

export default function Dashboard() {
  const [funds] = useState(fundMap);
  const [selectedFund, setSelectedFund] = useState(apiConfig.funds[0].name);
  const [pendingFund, setPendingFund] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  const activeFund = pendingFund || selectedFund;
  const cik = fundMap[activeFund];
  const {
    filings,
    stats,
    quarterlyChanges,
    purchases,
    classDistribution,
    metrics,
    similarFunds,
    isLoading,
  } = useFundData(cik);

  useEffect(() => {
    if (!isLoading && pendingFund) {
      setSelectedFund(pendingFund);
      setPendingFund(null);
    }
  }, [isLoading, pendingFund]);

  const handleFundChange = (newFund: string) => {
    if (newFund === selectedFund || newFund === pendingFund) return;
    setPendingFund(newFund);
    setSearchTerm('');
  };

  const handleExportJSON = () => {
    if (!selectedFund || !filings.length || !metrics) return;

    const data = {
      filings,
      stats,
      volatility: quarterlyChanges,
      purchases,
      classDistribution,
      metrics,
      similarFunds,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedFund.replace(/\s+/g, '_')}_data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        (e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT')
      ) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const fundName = pendingFund ? selectedFund : activeFund;
  const showData = filings.length > 0;

  return (
    <div className={`font-sans ${config.bgBase} min-h-screen`}>
      <div
        className={`${config.bgCard} border-b ${config.borderBase} p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative`}
      >
        <div
          className={`font-bold text-xl ${config.textSecondary} mb-3 sm:mb-0`}
        >
          Hedge Terminal
        </div>

        <div className="w-full sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md">
          <button
            onClick={() => setOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-sm border rounded-md bg-white text-gray-600 hover:bg-gray-50 border-gray-300 shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500">Search funds...</span>
            </span>
            <kbd className="hidden sm:inline text-xs text-gray-500 border border-gray-300 bg-gray-100 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        <button
          className={`hidden sm:flex items-center px-4 py-2 ${config.bgCard} border ${config.borderBase} ${config.textSecondary} rounded-md transition-colors`}
          onClick={handleExportJSON}
        >
          <Download className="mr-2 h-4 w-4" />
          <span className="whitespace-nowrap">Export</span>
        </button>

        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput
            placeholder="Search for a fund..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandGroup heading="Funds">
              {Object.keys(funds)
                .filter((fund) =>
                  fund.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((fund) => (
                  <CommandItem
                    key={fund}
                    value={fund}
                    onSelect={() => {
                      handleFundChange(fund);
                      setOpen(false);
                    }}
                  >
                    {fund}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>

      <div
        className={`${isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'} transition-opacity duration-150`}
      >
        <FundHeader fundName={fundName} stats={stats} metrics={metrics} />

        {showData && (
          <>
            <div className="px-6 pb-6 space-y-6">
              <AumChart filings={filings} stats={stats} />
              <QuarterlyPerformance quarterlyChanges={quarterlyChanges} />
              {metrics && <AdvancedMetrics metrics={metrics} />}
            </div>

            <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              <SectorDistribution classDistribution={classDistribution} />
              <RecentPurchases purchases={purchases} />
            </div>

            <div className="px-6 pb-6 grid grid-cols-1 gap-6">
              {similarFunds.length > 0 && (
                <SimilarFunds
                  similarFunds={similarFunds}
                  setSelectedFund={handleFundChange}
                />
              )}
            </div>
          </>
        )}

        {!showData && isLoading && (
          <div className="px-6 pb-6 space-y-6">
            <div className="h-64 bg-gray-100 animate-pulse rounded-md"></div>
            <div className="h-64 bg-gray-100 animate-pulse rounded-md"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-gray-100 animate-pulse rounded-md"></div>
              <div className="h-48 bg-gray-100 animate-pulse rounded-md"></div>
            </div>
          </div>
        )}

        <footer
          className={`border-t ${config.borderBase} py-6 mt-10 text-center text-xs ${config.textMuted}`}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center">
              <p>13F INSIGHTS • INSTITUTIONAL PORTFOLIO TRACKER</p>
              <p>DATA UPDATED {stats.quarter || 'N/A'}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
