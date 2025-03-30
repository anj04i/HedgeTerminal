import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Download, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  fetchApi,
  StatsResponse,
  ConfigResponse,
  FundFiling,
} from '@/lib/utils';

const config = {
  primaryColor: '#3B82F6',
  primaryColorLight: '#DBEAFE',
  primaryGradientStart: '#3B82F6',
  primaryGradientEnd: '#3B82F6',
  tooltipBackground: '#FFFFFF',
  tooltipText: '#111827',
  tooltipBorder: '#E5E7EB',
  gridStroke: '#E5E7EB',
  axisText: '#6B7280',
  axisLabel: '#374151',
  bgBase: 'bg-gray-50',
  bgCard: 'bg-white',
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-800',
  textMuted: 'text-gray-900',
  textHighlightPositive: 'text-green-600',
  textHighlightNegative: 'text-red-600',
  borderBase: 'border-gray-200',
};

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
  const [metrics, setMetrics] = useState<any>(null);
  const [similarFunds, setSimilarFunds] = useState<any[]>([]);

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
      // Existing data fetches
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

      fetchApi<any>(`/api/funds/${cik}/metrics`).then((data) => {
        setMetrics(data.metrics);
      }),
      fetchApi<any>(`/api/funds/${cik}/similar`).then((data) => {
        setSimilarFunds(data.similar);
      }),
    ])
      .then(() => {})
      .catch((err) => {
        console.error(`Error fetching data for ${selectedFund}: ${err}`);
      });
  }, [selectedFund, funds]);

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

  // Format AUM data for charts
  const aumChartData = filings.map((filing) => ({
    quarter: filing.quarter,
    value: Number((filing.value_usd / 1000000000).toFixed(2)),
  }));

  // Format top holdings data for bar chart
  const holdingsChartData = topHoldings.slice(0, 5).map((holding) => ({
    name: holding.ticker,
    value: Number((holding.value_usd / 1000000000).toFixed(2)),
  }));

  return (
    <div className={`font-sans ${config.bgBase} min-h-screen`}>
      <div
        className={`${config.bgCard} border-b ${config.borderBase} p-4 flex items-center justify-between`}
      >
        <div className={`font-bold text-xl ${config.textSecondary}`}>
          13F INSIGHTS
        </div>

        <div className="flex-1 max-w-xl mx-8 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className={`h-4 w-4 ${config.textMuted}`} />
          </div>
          <Select value={selectedFund} onValueChange={setSelectedFund}>
            <SelectTrigger
              className={`w-full pl-10 py-2 ${config.bgBase} border ${config.borderBase} ${config.textSecondary} text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[${config.primaryColor}] focus:border-[${config.primaryColor}]`}
            >
              <SelectValue placeholder="Select fund" />
            </SelectTrigger>
            <SelectContent
              className={`${config.bgCard} ${config.borderBase} ${config.textSecondary}`}
            >
              {Object.keys(funds).map((fund) => (
                <SelectItem
                  key={fund}
                  value={fund}
                  className={`text-sm ${config.textSecondary} hover:bg-[rgba(0,0,0,0.03)]`}
                >
                  {fund}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          className={`flex items-center px-4 py-2 ${config.bgCard} border ${config.borderBase} ${config.textSecondary} rounded-md transition-colors`}
          onClick={handleExportCSV}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </button>
      </div>

      {selectedFund && filings.length > 0 ? (
        <div
          className={`${config.bgCard} border-b ${config.borderBase} px-6 py-4 mb-6`}
        >
          <h1 className={`text-2xl font-bold mb-2 ${config.textSecondary}`}>
            {selectedFund}
          </h1>
          <div className="flex flex-wrap items-center space-x-8 text-sm">
            <div>
              <span className={`${config.textMuted} mr-2`}>AUM:</span>
              <span className={`font-medium ${config.textPrimary}`}>
                ${(Number(stats.aum) / 1000000000).toFixed(2)}B
              </span>
              <span
                className={`ml-2 ${
                  parseFloat(stats.qoq_change) >= 0
                    ? config.textHighlightPositive
                    : config.textHighlightNegative
                }`}
              >
                ({parseFloat(stats.qoq_change) >= 0 ? '+' : ''}
                {stats.qoq_change}%)
              </span>
            </div>
            <div>
              <span className={`${config.textMuted} mr-2`}>VOLATILITY:</span>
              <span className={`font-medium ${config.textPrimary}`}>
                {stats.volatility}%
              </span>
            </div>
            <div>
              <span className={`${config.textMuted} mr-2`}>YOY:</span>
              <span className={`font-medium ${config.textPrimary}`}>
                {stats.yoy_growth !== 'N/A'
                  ? `${parseFloat(stats.yoy_growth) >= 0 ? '+' : ''}${stats.yoy_growth}%`
                  : 'N/A'}
              </span>
              {stats.yoy_growth !== 'N/A' && (
                <span
                  className={`ml-2 ${
                    parseFloat(stats.yoy_growth) >= 0
                      ? config.textHighlightPositive
                      : config.textHighlightNegative
                  }`}
                >
                  {parseFloat(stats.yoy_growth) >= 0 ? 'Growth' : 'Decline'}
                </span>
              )}
            </div>
            <div>
              <span className={`${config.textMuted} mr-2`}>LATEST:</span>
              <span className={`font-medium ${config.textPrimary}`}>
                {stats.quarter}
              </span>
            </div>
          </div>
        </div>
      ) : selectedFund ? (
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

      {selectedFund && metrics && (
        <div
          className={`${config.bgCard} border-b ${config.borderBase} px-6 py-4 mb-6`}
        >
          <h1 className={`text-2xl font-bold mb-2 ${config.textSecondary}`}>
            {selectedFund}
          </h1>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
            <div>
              <span className={`${config.textMuted} mr-2`}>AUM:</span>
              <span className={`font-medium ${config.textPrimary}`}>
                ${(Number(stats.aum) / 1000000000).toFixed(2)}B
              </span>
              <span
                className={`ml-2 ${
                  parseFloat(stats.qoq_change) >= 0
                    ? config.textHighlightPositive
                    : config.textHighlightNegative
                }`}
              >
                ({parseFloat(stats.qoq_change) >= 0 ? '+' : ''}
                {stats.qoq_change}%)
              </span>
            </div>

            <div>
              <span className={`${config.textMuted} mr-2`}>VOLATILITY:</span>
              <span className={`font-medium ${config.textPrimary}`}>
                {metrics.aum_volatility_pct.toFixed(1)}%
              </span>
            </div>

            <div>
              <span className={`${config.textMuted} mr-2`}>TOTAL GROWTH:</span>
              <span
                className={`font-medium ${
                  metrics.total_appreciation_pct >= 0
                    ? config.textHighlightPositive
                    : config.textHighlightNegative
                }`}
              >
                {metrics.total_appreciation_pct >= 0 ? '+' : ''}
                {metrics.total_appreciation_pct.toFixed(1)}%
              </span>
            </div>

            <div>
              <span className={`${config.textMuted} mr-2`}>YOY:</span>
              <span className={`font-medium ${config.textPrimary}`}>
                {stats.yoy_growth !== 'N/A'
                  ? `${parseFloat(stats.yoy_growth) >= 0 ? '+' : ''}${stats.yoy_growth}%`
                  : 'N/A'}
              </span>
            </div>

            <div>
              <span className={`${config.textMuted} mr-2`}>TOP HOLDING:</span>
              <span className={`font-medium ${config.textPrimary}`}>
                {metrics.top_holding_pct.toFixed(1)}%
              </span>
            </div>

            <div>
              <span className={`${config.textMuted} mr-2`}>LATEST:</span>
              <span className={`font-medium ${config.textPrimary}`}>
                {stats.quarter}
              </span>
            </div>
          </div>
        </div>
      )}

      {selectedFund && filings.length > 0 && (
        <div className="px-6 pb-6 space-y-6">
          <div
            className={`${config.bgCard} rounded-lg overflow-hidden border ${config.borderBase}`}
          >
            <div
              className={`p-4 border-b ${config.borderBase} flex justify-between items-center`}
            >
              <div>
                <h2 className={`text-lg font-semibold ${config.textSecondary}`}>
                  Assets Under Management
                </h2>
                <p className={`${config.textMuted} text-sm`}>
                  Historical 13F filing data
                </p>
              </div>
              <div className="flex space-x-6 text-sm">
                <div>
                  <span className={`${config.textMuted} mr-1`}>
                    MAX GROWTH:
                  </span>
                  <span className={`font-medium ${config.textPrimary}`}>
                    {stats.max_growth}%
                  </span>
                </div>
                <div>
                  <span className={`${config.textMuted} mr-1`}>TOTAL:</span>
                  <span
                    className={`font-medium ${
                      parseFloat(stats.total_appreciation) >= 0
                        ? config.textHighlightPositive
                        : config.textHighlightNegative
                    }`}
                  >
                    {parseFloat(stats.total_appreciation) >= 0 ? '+' : ''}
                    {stats.total_appreciation}%
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aumChartData}>
                  <defs>
                    <linearGradient id="colorAum" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={config.primaryGradientStart}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={config.primaryGradientEnd}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="quarter" stroke={config.axisText} />
                  <YAxis
                    tickFormatter={(value) => `${value}B`}
                    stroke={config.axisText}
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={config.gridStroke}
                  />
                  <Tooltip
                    formatter={(value) => [`$${value}B`, 'AUM']}
                    contentStyle={{
                      backgroundColor: config.tooltipBackground,
                      border: `1px solid ${config.tooltipBorder}`,
                      borderRadius: '4px',
                      color: config.tooltipText,
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={config.primaryColor}
                    fillOpacity={1}
                    fill="url(#colorAum)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            className={`${config.bgCard} rounded-lg overflow-hidden border ${config.borderBase}`}
          >
            <div
              className={`p-4 border-b ${config.borderBase} flex justify-between items-center`}
            >
              <div>
                <h2 className={`text-lg font-semibold ${config.textSecondary}`}>
                  Quarterly Performance
                </h2>
                <p className={`${config.textMuted} text-sm`}>
                  Quarter-over-quarter percentage changes
                </p>
              </div>
            </div>
            <div className="p-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={quarterlyChanges}>
                  <defs>
                    <linearGradient id="colorAum" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={config.primaryGradientStart}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={config.primaryGradientEnd}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="quarter" stroke={config.axisText} />
                  <YAxis
                    tickFormatter={(value) => `${value}B`}
                    stroke={config.axisText}
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={config.gridStroke}
                  />
                  <Tooltip
                    formatter={(value) => [`$${value}B`, 'AUM']}
                    contentStyle={{
                      backgroundColor: config.tooltipBackground,
                      border: `1px solid ${config.tooltipBorder}`,
                      borderRadius: '4px',
                      color: config.tooltipText,
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={config.primaryColor}
                    fillOpacity={1}
                    fill="url(#colorAum)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        <div
          className={`${config.bgCard} rounded-lg overflow-hidden border ${config.borderBase} flex flex-col h-[496px]`}
        >
          <div className={`p-4 border-b ${config.borderBase}`}>
            <h2 className={`text-lg font-semibold ${config.textSecondary}`}>
              Sector Distribution
            </h2>
            <p className={`text-sm ${config.textMuted}`}>
              Portfolio allocation by sector
            </p>
          </div>
          <div className="p-4 flex-1 overflow-auto">
            {classDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={classDistribution}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    stroke={config.gridStroke}
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    type="number"
                    stroke={config.axisText}
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: config.gridStroke }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    dataKey="class"
                    type="category"
                    stroke={config.axisText}
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: config.gridStroke }}
                    width={150}
                    tick={{ fill: config.axisLabel }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: config.tooltipBackground,
                      border: `1px solid ${config.tooltipBorder}`,
                      borderRadius: '4px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      color: config.tooltipText,
                      fontSize: '12px',
                    }}
                    formatter={(value, name) => {
                      if (name === 'percentage_of_total') {
                        return [`${value}%`, 'Allocation'];
                      }
                      if (name === 'value_usd') {
                        return [
                          `$${((value as number) / 1e9).toFixed(2)}B`,
                          'Value',
                        ];
                      }
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Sector: ${label}`}
                  />
                  <Bar
                    dataKey="percentage_of_total"
                    name="Allocation"
                    fill={config.primaryColor}
                    radius={[0, 3, 3, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className={`text-sm ${config.textMuted}`}>
                  No sector distribution data available
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className={`${config.bgCard} rounded-lg overflow-hidden border ${config.borderBase} flex flex-col h-[496px]`}
        >
          <div className={`p-4 border-b ${config.borderBase}`}>
            <h2 className={`text-lg font-semibold ${config.textSecondary}`}>
              Recent Purchases
            </h2>
            <p className={`text-sm ${config.textMuted}`}>
              New positions in the latest filing
            </p>
          </div>
          <div className="overflow-auto flex-1">
            <table
              className="min-w-full divide-y"
              style={{ borderColor: config.borderBase }}
            >
              <thead className={`${config.bgBase} sticky top-0 z-10`}>
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${config.textMuted}`}
                  >
                    Title
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${config.textMuted}`}
                  >
                    Class
                  </th>
                  <th
                    className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${config.textMuted}`}
                  >
                    Value ($M)
                  </th>
                </tr>
              </thead>
              <tbody
                className={`${config.bgCard} divide-y`}
                style={{ borderColor: config.borderBase }}
              >
                {purchases.map((purchase) => (
                  <tr key={purchase.title + purchase.class}>
                    <td
                      className={`px-6 py-4 whitespace-nowrap font-medium ${config.textPrimary}`}
                    >
                      {purchase.title}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap ${config.textSecondary}`}
                    >
                      {purchase.class}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-right ${config.textSecondary}`}
                    >
                      ${(purchase.value_usd / 1e9).toFixed(2)}B
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={`${config.bgCard} rounded-lg overflow-hidden border ${config.borderBase}`}
        >
          <div className={`p-4 border-b ${config.borderBase}`}>
            <h3 className={`text-lg font-semibold ${config.textSecondary}`}>
              Key Metrics
            </h3>
            <p className={`text-sm ${config.textMuted}`}>
              Performance and portfolio structure indicators
            </p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
              >
                <div className={`text-sm mb-1 ${config.textMuted}`}>
                  Top 10 Holdings
                </div>
                <div className={`text-2xl font-bold ${config.textPrimary}`}>
                  {topHoldings.length > 0
                    ? `${(
                        (topHoldings
                          .slice(0, 10)
                          .reduce((sum, h) => sum + h.value_usd, 0) /
                          topHoldings.reduce(
                            (sum, h) => sum + h.value_usd,
                            0,
                          )) *
                        100
                      ).toFixed(1)}%`
                    : 'N/A'}
                </div>
                <div className={`text-xs mt-1 ${config.textMuted}`}>
                  Portfolio concentration
                </div>
              </div>
              <div
                className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
              >
                <div className={`text-sm mb-1 ${config.textMuted}`}>
                  Diversification
                </div>
                <div className={`text-2xl font-bold ${config.textPrimary}`}>
                  {topHoldings.length}
                </div>
                <div className={`text-xs mt-1 ${config.textMuted}`}>
                  {topHoldings.length > 20
                    ? 'Well diversified'
                    : topHoldings.length > 10
                      ? 'Moderately diversified'
                      : 'Concentrated'}
                </div>
              </div>
              <div
                className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
              >
                <div className={`text-sm mb-1 ${config.textMuted}`}>
                  Growth Consistency
                </div>
                <div className={`text-2xl font-bold ${config.textPrimary}`}>
                  {stats.growth_consistency}%
                </div>
                <div className={`text-xs mt-1 ${config.textMuted}`}>
                  Positive quarters ratio
                </div>
              </div>
              <div
                className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
              >
                <div className={`text-sm mb-1 ${config.textMuted}`}>
                  Volatility
                </div>
                <div className={`text-2xl font-bold ${config.textPrimary}`}>
                  {stats.volatility}%
                </div>
                <div className={`text-xs mt-1 ${config.textMuted}`}>
                  Standard deviation
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {metrics && (
          <div
            className={`${config.bgCard} rounded-lg overflow-hidden border ${config.borderBase}`}
          >
            <div className={`p-4 border-b ${config.borderBase}`}>
              <h3 className={`text-lg font-semibold ${config.textSecondary}`}>
                Advanced Portfolio Metrics
              </h3>
              <p className={`text-sm ${config.textMuted}`}>
                Comprehensive analytics for portfolio structure and performance
              </p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div
                  className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
                >
                  <div className={`text-sm mb-1 ${config.textMuted}`}>
                    Top Holding
                  </div>
                  <div className={`text-2xl font-bold ${config.textPrimary}`}>
                    {metrics.top_holding_pct.toFixed(1)}%
                  </div>
                  <div className={`text-xs mt-1 ${config.textMuted}`}>
                    Largest position concentration
                  </div>
                </div>

                <div
                  className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
                >
                  <div className={`text-sm mb-1 ${config.textMuted}`}>
                    Top 10 Holdings
                  </div>
                  <div className={`text-2xl font-bold ${config.textPrimary}`}>
                    {metrics.top_10_holdings_pct.toFixed(1)}%
                  </div>
                  <div className={`text-xs mt-1 ${config.textMuted}`}>
                    Portfolio concentration
                  </div>
                </div>

                <div
                  className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
                >
                  <div className={`text-sm mb-1 ${config.textMuted}`}>
                    Diversification Score
                  </div>
                  <div className={`text-2xl font-bold ${config.textPrimary}`}>
                    {metrics.diversification_score.toFixed(1)}
                  </div>
                  <div className={`text-xs mt-1 ${config.textMuted}`}>
                    {metrics.diversification_score > 30
                      ? 'Well diversified'
                      : metrics.diversification_score > 15
                        ? 'Moderately diversified'
                        : 'Concentrated'}
                  </div>
                </div>

                <div
                  className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
                >
                  <div className={`text-sm mb-1 ${config.textMuted}`}>
                    Uniqueness Score
                  </div>
                  <div className={`text-2xl font-bold ${config.textPrimary}`}>
                    {metrics.uniqueness_score.toFixed(1)}%
                  </div>
                  <div className={`text-xs mt-1 ${config.textMuted}`}>
                    Holdings not in other funds
                  </div>
                </div>

                <div
                  className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
                >
                  <div className={`text-sm mb-1 ${config.textMuted}`}>
                    Drawdown
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      metrics.drawdown_from_peak_pct > 20
                        ? config.textHighlightNegative
                        : config.textPrimary
                    }`}
                  >
                    {metrics.drawdown_from_peak_pct.toFixed(1)}%
                  </div>
                  <div className={`text-xs mt-1 ${config.textMuted}`}>
                    From peak AUM
                  </div>
                </div>

                <div
                  className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
                >
                  <div className={`text-sm mb-1 ${config.textMuted}`}>
                    Filing Lag
                  </div>
                  <div className={`text-2xl font-bold ${config.textPrimary}`}>
                    {metrics.avg_filing_lag_days.toFixed(0)} days
                  </div>
                  <div className={`text-xs mt-1 ${config.textMuted}`}>
                    Avg delay in reporting
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {similarFunds.length > 0 && (
          <div
            className={`${config.bgCard} rounded-lg overflow-hidden border ${config.borderBase}`}
          >
            <div className={`p-4 border-b ${config.borderBase}`}>
              <h3 className={`text-lg font-semibold ${config.textSecondary}`}>
                Similar Funds
              </h3>
              <p className={`text-sm ${config.textMuted}`}>
                Funds with overlapping holdings
              </p>
            </div>
            <div className="overflow-auto">
              <table
                className="min-w-full divide-y"
                style={{ borderColor: config.borderBase }}
              >
                <thead className={`${config.bgBase} sticky top-0 z-10`}>
                  <tr>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${config.textMuted}`}
                    >
                      Fund Name
                    </th>
                    <th
                      className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${config.textMuted}`}
                    >
                      Overlap Count
                    </th>
                    <th
                      className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${config.textMuted}`}
                    >
                      Overlap %
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`${config.bgCard} divide-y`}
                  style={{ borderColor: config.borderBase }}
                >
                  {similarFunds.map((fund) => (
                    <tr
                      key={fund.cik}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedFund(fund.name)}
                    >
                      <td
                        className={`px-6 py-4 whitespace-nowrap font-medium ${config.textPrimary}`}
                      >
                        {fund.name}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-right ${config.textSecondary}`}
                      >
                        {fund.overlap_count}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-right ${config.textSecondary}`}
                      >
                        {fund.overlap_percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

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
