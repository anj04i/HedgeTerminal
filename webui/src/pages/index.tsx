import { useState, useEffect, useRef } from 'react';

import {
  StatsResponse,
  FundFiling,
  VolatilityData,
  Holding,
  ClassDistribution,
  CompleteMetrics,
  SimilarFund,
} from '@/lib/types';
import {
  fetchConfig,
  fetchFundFilings,
  fetchFundStats,
  fetchFundVolatility,
  fetchFundPurchases,
  fetchFundClassDistribution,
  fetchFundMetrics,
  fetchSimilarFunds,
} from '@/lib/utils';

// Import Components
import { config } from '@/components/dashboard/config';
import AdvancedMetrics from '@/components/dashboard/advancedMetrics';
import AumChart from '@/components/dashboard/aumChart';
import FundHeader from '@/components/dashboard/fundHeader';
import QuarterlyPerformance from '@/components/dashboard/quaterlyPerformance';
import RecentPurchases from '@/components/dashboard/recentPurchases';
import SectorDistribution from '@/components/dashboard/sectorDistribution';
import SimilarFunds from '@/components/dashboard/similarFunds';
import { Download, Search } from 'lucide-react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandDialog,
} from '@/components/ui/command';

export default function Dashboard() {
  // State
  const [funds, setFunds] = useState<Record<string, string>>({});
  const [selectedFund, setSelectedFund] = useState('');
  const [filings, setFilings] = useState<FundFiling[]>([]);
  const [purchases, setPurchases] = useState<Holding[]>([]);
  const [classDistribution, setClassDistribution] = useState<
    ClassDistribution[]
  >([]);
  const [stats, setStats] = useState<StatsResponse['stats']>({
    aum: 0,
    quarter: '',
    qoq_change: '0',
    yoy_growth: 'N/A',
    total_appreciation: '0',
    volatility: '0',
    max_growth: '0',
    max_decline: '0',
    growth_consistency: '0',
  });
  const [quarterlyChanges, setQuarterlyChanges] = useState<VolatilityData[]>(
    [],
  );
  const [metrics, setMetrics] = useState<CompleteMetrics | null>(null);
  const [similarFunds, setSimilarFunds] = useState<SimilarFund[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [fadeState, setFadeState] = useState('in');
  const [prevFund, setPrevFund] = useState('');

  // Fetch list of funds on initial load
  useEffect(() => {
    fetchConfig()
      .then((data) => {
        const fundMap = data.funds.reduce((acc: Record<string, string>, f) => {
          acc[f.name] = f.cik;
          return acc;
        }, {});
        setFunds(fundMap);
        if (data.funds.length > 0) setSelectedFund(data.funds[0].name);
      })
      .catch((err) => console.error('Error fetching config:', err));
  }, []);

  // Handle fund selection change with smooth transition
  const handleFundChange = (newFund: string) => {
    if (newFund === selectedFund) return;

    setPrevFund(selectedFund);
    // Start fade out transition
    setFadeState('out');

    // After fade out completes, change the fund and begin loading new data
    setTimeout(() => {
      setSelectedFund(newFund);
      setSearchTerm('');
    }, 300); // Match this timing with your CSS transition duration
  };

  // Fetch fund data when selection changes
  useEffect(() => {
    if (!selectedFund || !funds[selectedFund]) return;

    setIsLoading(true);
    const cik = funds[selectedFund];

    Promise.all([
      // Use dedicated fetch functions instead of generic fetchApi
      fetchFundFilings(cik).then((data) =>
        setFilings(
          data.filings.map((f) => ({
            quarter: f.quarter,
            value_usd: Number(f.value_usd),
          })),
        ),
      ),
      fetchFundStats(cik).then((data) => setStats(data.stats)),
      fetchFundVolatility(cik).then((data) =>
        setQuarterlyChanges(data.volatility),
      ),
      fetchFundPurchases(cik).then((data) => setPurchases(data.purchases)),
      fetchFundClassDistribution(cik).then((data) =>
        setClassDistribution(data.distribution),
      ),
      fetchFundMetrics(cik).then((data) => {
        setMetrics(data.metrics);
      }),
      fetchSimilarFunds(cik).then((data) => {
        setSimilarFunds(data.similar);
      }),
    ])
      .then(() => {
        setIsLoading(false);
        // Start fade in transition when data is loaded
        setFadeState('in');
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setIsLoading(false);
        // Even on error, we should transition back in
        setFadeState('in');
      });
  }, [selectedFund, funds]);

  const [open, setOpen] = useState(false);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        (e.key === 'k' && (e.metaKey || e.ctrlKey)) || // ⌘K or Ctrl+K
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT')
      ) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Export data as CSV
  const handleExportCSV = () => {
    if (filings.length === 0) return;
    let csvContent = 'Fund,Quarter,AUM,Change (QoQ)\n';
    for (let i = 0; i < filings.length; i++) {
      const f = filings[i];
      let qoqChange = 'N/A';
      if (i > 0) {
        const prevFiling = filings[i - 1];
        qoqChange = ((f.value_usd / prevFiling.value_usd - 1) * 100).toFixed(2);
      }
      csvContent += `${selectedFund},${f.quarter},${f.value_usd},${qoqChange}\n`;
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedFund.replace(/\s+/g, '_')}_filings.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Define transition classes based on fade state
  const fadeClass =
    fadeState === 'in'
      ? 'opacity-100 transition-opacity duration-300 ease-in'
      : 'opacity-0 transition-opacity duration-300 ease-out';

  return (
    <div className={`font-sans ${config.bgBase} min-h-screen`}>
      {/* Header */}
      <div
        className={`${config.bgCard} border-b ${config.borderBase} p-4 flex items-center justify-between relative`}
      >
        {/* left side */}
        <div className={`font-bold text-xl ${config.textSecondary}`}>
          13F INSIGHTS
        </div>

        {/* center search trigger */}
        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md">
          <button
            onClick={() => setOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-sm border rounded-md bg-white text-gray-600 hover:bg-gray-50 border-gray-300 shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <span className="hidden sm:inline text-gray-500">
                Search funds...
              </span>
            </span>
            <kbd className="text-xs text-gray-500 border border-gray-300 bg-gray-100 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* right side export button */}
        <button
          className={`flex items-center px-4 py-2 ${config.bgCard} border ${config.borderBase} ${config.textSecondary} rounded-md transition-colors`}
          onClick={handleExportCSV}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </button>

        {/* command palette */}
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

      {/* Content Section with Fade Transitions */}
      <div className={fadeClass}>
        {/* Fund Header with Stats */}
        {selectedFund && !isLoading ? (
          <FundHeader fundName={selectedFund} stats={stats} metrics={metrics} />
        ) : selectedFund && isLoading ? (
          <div
            className={`${config.bgCard} border-b ${config.borderBase} px-6 py-4 mb-6 opacity-40`}
          >
            {/* Keep showing previous fund during transition */}
            <FundHeader
              fundName={prevFund || selectedFund}
              stats={stats}
              metrics={metrics}
            />
          </div>
        ) : (
          <div
            className={`${config.bgCard} border-b ${config.borderBase} px-6 py-4 mb-6`}
          >
            <div className="text-center py-4">
              <h3 className={`text-xl font-bold mb-2 ${config.textSecondary}`}>
                Select a Fund
              </h3>
              <p className={`${config.textMuted}`}>
                Choose an institutional investment fund to view their 13F filing
                history and performance metrics
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {selectedFund && !isLoading && filings.length > 0 && (
          <>
            {/* Charts Section */}
            <div className="px-6 pb-6 space-y-6">
              <AumChart filings={filings} stats={stats} />
              <QuarterlyPerformance quarterlyChanges={quarterlyChanges} />
              {metrics && <AdvancedMetrics metrics={metrics} />}
            </div>

            {/* Two Column Layout */}
            <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              <SectorDistribution classDistribution={classDistribution} />
              <RecentPurchases purchases={purchases} />
            </div>

            {/* Additional Metrics */}
            <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-1 gap-6">
              {similarFunds.length > 0 && (
                <SimilarFunds
                  similarFunds={similarFunds}
                  setSelectedFund={handleFundChange}
                />
              )}
            </div>
          </>
        )}

        {/* Show faded previous data during loading */}
        {selectedFund && isLoading && prevFund && (
          <div className="opacity-40 transition-opacity duration-300">
            {/* Use previous data during loading */}
            <div className="px-6 pb-6 space-y-6">
              <AumChart filings={filings} stats={stats} />
              <QuarterlyPerformance quarterlyChanges={quarterlyChanges} />
              {metrics && <AdvancedMetrics metrics={metrics} />}
            </div>

            <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              <SectorDistribution classDistribution={classDistribution} />
              <RecentPurchases purchases={purchases} />
            </div>

            {similarFunds.length > 0 && (
              <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-1 gap-6">
                <SimilarFunds
                  similarFunds={similarFunds}
                  setSelectedFund={handleFundChange}
                />
              </div>
            )}
          </div>
        )}

        {/* When no previous data is available, show minimal loading skeleton */}
        {selectedFund && isLoading && !prevFund && (
          <div className="px-6 pb-6 space-y-6">
            <div className="h-64 bg-gray-100 animate-pulse rounded-md"></div>
            <div className="h-64 bg-gray-100 animate-pulse rounded-md"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-gray-100 animate-pulse rounded-md"></div>
              <div className="h-48 bg-gray-100 animate-pulse rounded-md"></div>
            </div>
          </div>
        )}

        {/* Footer */}
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
