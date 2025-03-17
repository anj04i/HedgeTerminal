import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronUp,
  ChevronDown,
  TrendingUp,
  ArrowUpRight,
  DollarSign,
} from 'lucide-react';
import {
  fetchApi,
  StatsResponse,
  ConfigResponse,
  FundFiling,
} from '@/lib/utils';
import HistoryView from '@/components/views/historyView';
import LastBuysView from '@/components/views/lastBuysView';
import PerformanceView from '@/components/views/performanceView';
import PopularView from '@/components/views/popularView';
import SectorDistributionView from '@/components/views/sectorDistributionView';
import TopHoldingsView from '@/components/views/topHoldingView';

export default function Home() {
  const [funds, setFunds] = useState<Record<string, string>>({});
  const [selectedFund, setSelectedFund] = useState('');
  const [filings, setFilings] = useState<FundFiling[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [classDistribution, setClassDistribution] = useState<any[]>([]);
  const [topHoldings, setTopHoldings] = useState<any[]>([]);
  const [popularHoldings, setPopularHoldings] = useState<any[]>([]);
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
  const [quarterlyChanges, setQuarterlyChanges] = useState<any[]>([]);
  const [view, setView] = useState<
    | 'performance'
    | 'history'
    | 'lastBuys'
    | 'sectorDistribution'
    | 'topHoldings'
    | 'popular'
  >('performance');

  useEffect(() => {
    fetchApi<ConfigResponse>('/api/config')
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

  useEffect(() => {
    if (!selectedFund || !funds[selectedFund]) return;
    const cik = funds[selectedFund];
    Promise.all([
      fetchApi<any>(`/api/funds/${cik}/filings`).then((data) =>
        setFilings(
          data.filings.map((f: any) => ({
            quarter: f.quarter,
            value_usd: Number(f.value_usd),
          })),
        ),
      ),
      fetchApi<StatsResponse>(`/api/funds/${cik}/stats`).then((data) =>
        setStats(data.stats),
      ),
      fetchApi<any>(`/api/funds/${cik}/volatility`).then((data) =>
        setQuarterlyChanges(data.volatility),
      ),
      fetchApi<any>(`/api/funds/${cik}/purchases`).then((data) =>
        setPurchases(data.purchases),
      ),
      fetchApi<any>(`/api/funds/${cik}/class-distribution`).then((data) =>
        setClassDistribution(data.distribution),
      ),
      fetchApi<any>(`/api/funds/${cik}/top-holdings`).then((data) =>
        setTopHoldings(data.holdings),
      ),
    ]).catch((err) => console.error('Error fetching data:', err));
  }, [selectedFund, funds]);

  useEffect(() => {
    fetchApi<any>('/api/holdings/popular')
      .then((data) => setPopularHoldings(data.holdings))
      .catch((err) => console.error('Error fetching popular holdings:', err));
  }, []);

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

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-900 pt-6 pb-3 px-6 !static md:!sticky top-0 bg-black/95 backdrop-blur-sm z-10">
        {' '}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-black text-xs font-bold">13F</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight">INSIGHTS</h1>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                INSTITUTIONAL PORTFOLIO ANALYTICS
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Fund selector */}
              <Select value={selectedFund} onValueChange={setSelectedFund}>
                <SelectTrigger className="w-full sm:w-[240px] bg-zinc-900 border-zinc-900 text-white focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Select fund" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {Object.keys(funds).map((fund) => (
                    <SelectItem
                      key={fund}
                      value={fund}
                      className="hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white text-zinc-300"
                    >
                      {fund}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Navigation - Desktop buttons */}
              <div className="hidden md:flex space-x-3">
                <Button
                  variant={view === 'performance' ? 'default' : 'outline'}
                  onClick={() => setView('performance')}
                  className={
                    view === 'performance'
                      ? 'bg-white text-black hover:bg-zinc-200 hover:text-black'
                      : 'bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                  }
                >
                  Performance
                </Button>
                <Button
                  variant={view === 'history' ? 'default' : 'outline'}
                  onClick={() => setView('history')}
                  className={
                    view === 'history'
                      ? 'bg-white text-black hover:bg-zinc-200 hover:text-black'
                      : 'bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                  }
                >
                  History
                </Button>
              </div>

              {/* View selector dropdown - Works on both mobile and desktop */}
              <Select
                value={view}
                onValueChange={(value) => setView(value as any)}
              >
                <SelectTrigger className="w-full sm:w-[120px] bg-zinc-900 border-zinc-900 text-white focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem
                    value="performance"
                    className="hover:bg-zinc-800 text-zinc-300 md:hidden"
                  >
                    Performance
                  </SelectItem>
                  <SelectItem
                    value="history"
                    className="hover:bg-zinc-800 text-zinc-300 md:hidden"
                  >
                    History
                  </SelectItem>
                  <SelectItem
                    value="lastBuys"
                    className="hover:bg-zinc-800 text-zinc-300"
                  >
                    Last Buys
                  </SelectItem>
                  <SelectItem
                    value="sectorDistribution"
                    className="hover:bg-zinc-800 text-zinc-300"
                  >
                    Sector Distribution
                  </SelectItem>
                  <SelectItem
                    value="topHoldings"
                    className="hover:bg-zinc-800 text-zinc-300"
                  >
                    Top Holdings
                  </SelectItem>
                  <SelectItem
                    value="popular"
                    className="hover:bg-zinc-800 text-zinc-300"
                  >
                    Popular
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filings.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-6 pb-2">
              <div className="flex items-center min-w-[45%] sm:min-w-0">
                <DollarSign
                  size={14}
                  className="text-zinc-500 mr-1 flex-shrink-0"
                />
                <span className="text-xs text-zinc-500 mr-2">AUM</span>
                <span className="text-lg font-bold whitespace-nowrap">
                  ${(Number(stats.aum) / 1000000000).toFixed(2)}B
                </span>
                <div
                  className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium flex items-center ${parseFloat(stats.qoq_change) >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}
                >
                  {parseFloat(stats.qoq_change) >= 0 ? (
                    <ChevronUp size={12} className="mr-0.5" />
                  ) : (
                    <ChevronDown size={12} className="mr-0.5" />
                  )}
                  {parseFloat(stats.qoq_change) >= 0 ? '+' : ''}
                  {stats.qoq_change}%
                </div>
              </div>
              <div className="flex items-center min-w-[45%] sm:min-w-0">
                <TrendingUp
                  size={14}
                  className="text-zinc-500 mr-1 flex-shrink-0"
                />
                <span className="text-xs text-zinc-500 mr-2">VOLATILITY</span>
                <span className="text-lg font-bold">{stats.volatility}%</span>
              </div>
              <div className="flex items-center min-w-[45%] sm:min-w-0">
                <ArrowUpRight
                  size={14}
                  className="text-zinc-500 mr-1 flex-shrink-0"
                />
                <span className="text-xs text-zinc-500 mr-2">YOY</span>
                <span className="text-lg font-bold">
                  {stats.yoy_growth !== 'N/A'
                    ? `${parseFloat(stats.yoy_growth) >= 0 ? '+' : ''}${stats.yoy_growth}%`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center min-w-[45%] sm:min-w-0">
                <span className="text-xs text-zinc-500 mr-2">LATEST</span>
                <span className="text-lg font-bold">{stats.quarter}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {selectedFund && filings.length > 0 ? (
          <div>
            {view === 'performance' && (
              <PerformanceView
                filings={filings}
                quarterlyChanges={quarterlyChanges}
                stats={stats}
                selectedFund={selectedFund}
              />
            )}
            {view === 'history' && (
              <HistoryView
                filings={filings}
                selectedFund={selectedFund}
                handleExportCSV={handleExportCSV}
              />
            )}
            {view === 'lastBuys' && (
              <LastBuysView purchases={purchases} selectedFund={selectedFund} />
            )}
            {view === 'sectorDistribution' && (
              <SectorDistributionView
                classDistribution={classDistribution}
                selectedFund={selectedFund}
              />
            )}
            {view === 'topHoldings' && (
              <TopHoldingsView
                topHoldings={topHoldings}
                selectedFund={selectedFund}
              />
            )}
            {view === 'popular' && (
              <PopularView popularHoldings={popularHoldings} />
            )}
          </div>
        ) : selectedFund ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold mb-2">Loading Data...</h3>
            <p className="text-zinc-500">
              Retrieving 13F filing information for {selectedFund}
            </p>
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold mb-2">Select a Fund</h3>
            <p className="text-zinc-500">
              Choose an institutional investment fund to view their 13F filing
              history and performance metrics
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-900 py-6 mt-10 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <p>13F INSIGHTS • INSTITUTIONAL PORTFOLIO TRACKER</p>
            <p>DATA UPDATED {stats.quarter || 'N/A'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
