import { useState, useEffect } from 'react';

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
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setIsLoading(false);
      });
  }, [selectedFund, funds]);

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

  return (
    <div className={`font-sans ${config.bgBase} min-h-screen`}>
      {/* Header */}
      <div
        className={`${config.bgCard} border-b ${config.borderBase} p-4 flex items-center justify-between`}
      >
        <div className={`font-bold text-xl ${config.textSecondary}`}>
          13F INSIGHTS
        </div>

        <div className="flex-1 max-w-xl mx-8 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search for a fund..."
            className="w-full pl-10 py-2 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsSearchFocused(false), 200);
            }}
          />
          {isSearchFocused && (
            <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-64 overflow-y-auto">
              {Object.keys(funds)
                .filter(
                  (fund) =>
                    !searchTerm ||
                    fund.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((fund) => (
                  <div
                    key={fund}
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-black ${
                      fund === selectedFund ? 'bg-blue-50 font-medium' : ''
                    }`}
                    onClick={() => {
                      setSelectedFund(fund);
                      setSearchTerm('');
                    }}
                  >
                    {fund}
                  </div>
                ))}
            </div>
          )}
        </div>

        <button
          className={`flex items-center px-4 py-2 ${config.bgCard} border ${config.borderBase} ${config.textSecondary} rounded-md transition-colors`}
          onClick={handleExportCSV}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </button>
      </div>

      {/* Fund Header with Stats */}
      {selectedFund && !isLoading ? (
        <FundHeader fundName={selectedFund} stats={stats} metrics={metrics} />
      ) : selectedFund && isLoading ? (
        <div
          className={`${config.bgCard} border-b ${config.borderBase} px-6 py-4 mb-6`}
        >
          <div className="text-center py-4">
            <h3 className={`text-xl font-bold mb-2 ${config.textSecondary}`}>
              Loading Data...
            </h3>
            <p className={`${config.textMuted}`}>
              Retrieving 13F filing information for {selectedFund}
            </p>
          </div>
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
      {selectedFund && filings.length > 0 && (
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
            {/* <KeyMetrics stats={stats} topHoldings={topHoldings} /> */}
            {similarFunds.length > 0 && (
              <SimilarFunds
                similarFunds={similarFunds}
                setSelectedFund={setSelectedFund}
              />
            )}
          </div>
        </>
      )}

      {/* Loading States */}
      {selectedFund && filings.length === 0 && (
        <div className="px-6 py-12 text-center">
          <h3 className={`text-xl font-bold mb-2 ${config.textSecondary}`}>
            Loading Data...
          </h3>
          <p className={config.textMuted}>
            Retrieving 13F filing information for {selectedFund}
          </p>
        </div>
      )}

      {!selectedFund && (
        <div className="px-6 py-12 text-center">
          <h3 className={`text-xl font-bold mb-2 ${config.textSecondary}`}>
            Select a Fund
          </h3>
          <p className={config.textMuted}>
            Choose an institutional investment fund to view their 13F filing
            history and performance metrics
          </p>
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
  );
}
