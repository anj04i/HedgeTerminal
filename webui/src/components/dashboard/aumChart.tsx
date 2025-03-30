import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FundFiling, StatsResponse } from '@/lib/types';
import { config } from './config';

interface AumChartProps {
  filings: FundFiling[];
  stats: StatsResponse['stats'];
}

interface ChartData {
  quarter: string;
  value: number;
}

const AumChart: React.FC<AumChartProps> = ({ filings, stats }) => {
  const chartData: ChartData[] = useMemo(() => {
    return filings.map((filing) => ({
      quarter: filing.quarter,
      value: Number((filing.value_usd / 1e9).toFixed(2)),
    }));
  }, [filings]);

  if (chartData.length === 0) return null;

  return (
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
            <span className={`${config.textMuted} mr-1`}>MAX GROWTH:</span>
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
          <AreaChart data={chartData}>
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
            <CartesianGrid strokeDasharray="3 3" stroke={config.gridStroke} />
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
  );
};

export default AumChart;
