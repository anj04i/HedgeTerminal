import React, { memo, useMemo } from 'react';
import { darkTheme } from './theme';
import { CompleteMetrics } from '@/lib/types';

interface PortfolioMetricsPanelProps {
  metrics: CompleteMetrics | null;
  stats: {
    aum: number;
    quarter: string;
    qoq_change: string;
    yoy_growth: string;
    total_appreciation: string;
    volatility: string;
    max_growth: string;
    max_decline: string;
    growth_consistency: string;
  };
  isMobile?: boolean;
}

export const PortfolioMetricsPanel = memo(
  ({ metrics, stats, isMobile = false }: PortfolioMetricsPanelProps) => {
    const allMetrics = useMemo(() => {
      if (!metrics) return [];

      return [
        {
          label: 'Top Holding',
          value: metrics.top_holding_pct || '0.0%',
          subtext: 'Highest allocation',
        },
        {
          label: 'Concentration',
          value: metrics.top_10_holdings_pct || '0.0%',
          subtext: 'Top 10 holdings',
        },
        {
          label: 'Diversification',
          value: metrics.diversification_score || '0',
          subtext: 'Score',
        },
        {
          label: 'Uniqueness',
          value: metrics.uniqueness_score || '0%',
          subtext: 'Unique holdings',
        },
        {
          label: 'QoQ Change',
          value: stats.qoq_change || '0%',
          subtext: 'Last quarter',
        },
        {
          label: 'YoY Growth',
          value: stats.yoy_growth || '0%',
          subtext: 'Annual growth',
        },
        {
          label: 'Total Apprec.',
          value: stats.total_appreciation || '0%',
          subtext: 'All-time return',
        },
        {
          label: 'Volatility',
          value: stats.volatility || '0%',
          subtext: 'Historical',
        },
        {
          label: 'Max Growth',
          value: stats.max_growth || '0%',
          subtext: 'Best quarter',
        },
        {
          label: 'Max Decline',
          value: stats.max_decline || '0%',
          subtext: 'Worst quarter',
        },
        {
          label: 'Consistency',
          value: stats.growth_consistency || '0%',
          subtext: 'Positive quarters',
        },
        {
          label: 'Drawdown',
          value: metrics.drawdown_from_peak_pct || '0%',
          subtext: 'From peak AUM',
        },
        {
          label: 'Filing Lag',
          value: `${metrics.avg_filing_lag_days || '0'} days`,
          subtext: 'Reporting delay',
        },
      ];
    }, [metrics, stats]);

    if (!metrics) return null;

    return (
      <div
        style={{
          borderTop: `1px solid ${darkTheme.border}`,
          backgroundColor: darkTheme.cardBackground,
          padding: '0.75rem 1rem',
          minHeight: isMobile ? '120px' : '80px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '1rem',
        }}
      >
        <div
          className={`flex ${isMobile ? 'flex-wrap justify-center gap-y-4' : 'gap-x-6'} overflow-x-auto hide-scrollbar`}
          style={{ flex: 1 }}
        >
          {allMetrics.map((item, index) => (
            <div key={`metric-${index}`} style={{ minWidth: '90px' }}>
              <div
                style={{ fontSize: '0.625rem', color: darkTheme.secondaryText }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  color: darkTheme.text,
                  marginTop: '2px',
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontSize: '0.625rem',
                  color: darkTheme.secondaryText,
                  marginTop: '2px',
                }}
              >
                {item.subtext}
              </div>
            </div>
          ))}
        </div>

        <div
          className={`text-xs text-gray-500 ${isMobile ? 'text-left mt-2' : 'text-right'}`}
          style={{
            minWidth: isMobile ? 'auto' : '160px',
            whiteSpace: 'nowrap',
          }}
        >
          {stats.quarter ? `Last Quarter: ${stats.quarter}` : ''}
          <br />
          {metrics.latest_report_date
            ? `Last Filed: ${metrics.latest_report_date}`
            : ''}
        </div>
      </div>
    );
  },
);

PortfolioMetricsPanel.displayName = 'PortfolioMetricsPanel';
