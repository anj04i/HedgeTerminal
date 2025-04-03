import React, { memo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import {
  ClassDistribution,
  CompleteMetrics,
  FundFiling,
  VolatilityData,
} from '@/lib/types';
import { darkTheme } from './theme';

const formatQuarter = (quarter: string) => {
  const [year, q] = quarter.split('-');
  return `Q${q} ${year}`;
};

const tooltipStyle = {
  backgroundColor: darkTheme.cardBackground,
  border: `1px solid ${darkTheme.border}`,
  color: darkTheme.text,
  borderRadius: '4px',
  padding: '8px',
};

const tooltipLabelStyle = {
  color: darkTheme.accent,
};

const ChartCard: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div
    className="rounded-lg p-4 flex flex-col min-h-[300px] md:min-h-0"
    style={{
      backgroundColor: darkTheme.cardBackground,
      border: `1px solid ${darkTheme.border}`,
      flex: 1,
      minHeight: 0,
    }}
  >
    <h3 className="text-xs font-medium text-gray-200 mb-2">{title}</h3>
    <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
  </div>
);

const QuarterlyChart = memo(({ data }: { data: FundFiling[] }) => {
  if (!data.length) return null;
  const values = data.map((d) => d.value_usd);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const buffer = (max - min) * 0.05;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={darkTheme.chartGrid}
          vertical={false}
        />
        <XAxis
          dataKey="quarter"
          stroke={darkTheme.secondaryText}
          tickFormatter={formatQuarter}
          tick={{ fontSize: 10 }}
          axisLine={{ stroke: darkTheme.border }}
          tickLine={{ stroke: darkTheme.border }}
        />
        <YAxis
          domain={[min - buffer, max + buffer]}
          stroke={darkTheme.secondaryText}
          tickFormatter={(v) => `$${(v / 1e9).toFixed(1)}B`}
          tick={{ fontSize: 10 }}
          axisLine={{ stroke: darkTheme.border }}
          tickLine={{ stroke: darkTheme.border }}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number) => [
            `$${(value / 1e9).toFixed(2)}B`,
            'AUM',
          ]}
          labelFormatter={formatQuarter}
        />
        <Line
          type="monotone"
          dataKey="value_usd"
          stroke={darkTheme.accent}
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

QuarterlyChart.displayName = 'QuarterlyChart';

const VolatilityChart = memo(({ data }: { data: VolatilityData[] }) => {
  const processed = data.map((item) => ({
    ...item,
    changeValue: parseFloat(item.change),
  }));
  if (!processed.length) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={processed}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={darkTheme.chartGrid}
          vertical={false}
        />
        <XAxis
          dataKey="quarter"
          stroke={darkTheme.secondaryText}
          tickFormatter={formatQuarter}
          tick={{ fontSize: 10 }}
          axisLine={{ stroke: darkTheme.border }}
          tickLine={{ stroke: darkTheme.border }}
        />
        <YAxis
          stroke={darkTheme.secondaryText}
          tickFormatter={(v) => `${v.toFixed(1)}%`}
          tick={{ fontSize: 10 }}
          axisLine={{ stroke: darkTheme.border }}
          tickLine={{ stroke: darkTheme.border }}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number) => [`${v.toFixed(2)}%`, 'Change']}
          labelFormatter={formatQuarter}
        />
        <Line
          type="monotone"
          dataKey="changeValue"
          stroke={darkTheme.accent}
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

VolatilityChart.displayName = 'VolatilityChart';

const SectorChart = memo(({ data }: { data: ClassDistribution[] }) => {
  const processed = data
    .map((item) => ({
      name: item.class,
      value: parseFloat((item.percentage_of_total * 100).toFixed(1)),
    }))
    .sort((a, b) => b.value - a.value);
  if (!processed.length) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        data={processed}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={darkTheme.chartGrid}
          horizontal
          vertical={false}
        />
        <XAxis
          type="number"
          tickFormatter={(v) => `${v}%`}
          stroke={darkTheme.secondaryText}
          tick={{ fontSize: 10 }}
          axisLine={{ stroke: darkTheme.border }}
          tickLine={{ stroke: darkTheme.border }}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke={darkTheme.secondaryText}
          width={120}
          tick={{ fontSize: 10 }}
          axisLine={{ stroke: darkTheme.border }}
          tickLine={{ stroke: darkTheme.border }}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(v: number) => [`${v.toFixed(1)}%`, 'Allocation']}
          itemStyle={{ color: darkTheme.text }}
          cursor={{ fill: '#26262f' }}
        />
        <Bar dataKey="value" radius={[0, 2, 2, 0]}>
          {processed.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={darkTheme.accent}
              onMouseEnter={(e) => (e.currentTarget.style.fill = '#22c55e')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.fill = darkTheme.accent)
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

SectorChart.displayName = 'SectorChart';

export const ChartContainer = memo(
  ({
    metrics,
    filings,
    quarterlyChanges,
    classDistribution,
  }: {
    metrics: CompleteMetrics | null;
    filings: FundFiling[];
    quarterlyChanges: VolatilityData[];
    classDistribution: ClassDistribution[];
  }) => {
    return (
      <div className="flex-1 flex flex-col overflow-auto p-4 gap-4 min-h-0">
        <ChartCard title="Quarter-over-quarter change">
          <QuarterlyChart data={filings} />
        </ChartCard>
        <ChartCard title="Quarterly volatility">
          <VolatilityChart data={quarterlyChanges} />
        </ChartCard>
        <ChartCard title="Sector breakdown">
          <SectorChart data={classDistribution} />
        </ChartCard>
      </div>
    );
  },
);

ChartContainer.displayName = 'ChartContainer';
