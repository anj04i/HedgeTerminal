import React from 'react';
import { StatsResponse } from '@/lib/types';
import { CompleteMetrics } from '@/lib/types';
import { config } from './config';

interface FundHeaderProps {
  fundName: string;
  stats: StatsResponse['stats'];
  metrics: CompleteMetrics | null;
}

const FundHeader: React.FC<FundHeaderProps> = ({
  fundName,
  stats,
  metrics,
}) => {
  if (!fundName) return null;

  // Helper function to safely parse and format numbers
  const formatNumber = (
    value: string | number | undefined,
    decimals: number = 1,
  ): string => {
    if (value === undefined || value === null) return '0';
    return parseFloat(String(value)).toFixed(decimals);
  };

  // Helper function to format percentages with + sign for positive values
  const formatPercentage = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return '0%';
    const numValue = parseFloat(String(value));
    return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(1)}%`;
  };

  // Helper to check if a value is positive
  const isPositive = (value: string | number | undefined): boolean => {
    if (value === undefined || value === null) return false;
    return parseFloat(String(value)) >= 0;
  };

  return (
    <div
      className={`${config.bgCard} border-b ${config.borderBase} px-6 py-4 mb-6`}
    >
      <h1 className={`text-2xl font-bold mb-2 ${config.textSecondary}`}>
        {fundName}
      </h1>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
        <div>
          <span className={`${config.textMuted} mr-2`}>AUM:</span>
          <span className={`font-medium ${config.textPrimary}`}>
            ${(parseFloat(String(stats.aum)) / 1000000000).toFixed(2)}B
          </span>
          <span
            className={`ml-2 ${
              isPositive(stats.qoq_change)
                ? config.textHighlightPositive
                : config.textHighlightNegative
            }`}
          >
            ({isPositive(stats.qoq_change) ? '+' : ''}
            {stats.qoq_change}%)
          </span>
        </div>

        <div>
          <span className={`${config.textMuted} mr-2`}>VOLATILITY:</span>
          <span className={`font-medium ${config.textPrimary}`}>
            {metrics
              ? formatNumber(metrics.aum_volatility_pct)
              : stats.volatility}
            %
          </span>
        </div>

        <div>
          <span className={`${config.textMuted} mr-2`}>TOTAL GROWTH:</span>
          <span
            className={`font-medium ${
              isPositive(metrics?.total_appreciation_pct)
                ? config.textHighlightPositive
                : config.textHighlightNegative
            }`}
          >
            {metrics
              ? formatPercentage(metrics.total_appreciation_pct)
              : stats.total_appreciation}
          </span>
        </div>

        <div>
          <span className={`${config.textMuted} mr-2`}>YOY:</span>
          <span className={`font-medium ${config.textPrimary}`}>
            {stats.yoy_growth !== 'N/A'
              ? `${isPositive(stats.yoy_growth) ? '+' : ''}${stats.yoy_growth}%`
              : 'N/A'}
          </span>
        </div>

        {metrics && (
          <div>
            <span className={`${config.textMuted} mr-2`}>TOP HOLDING:</span>
            <span className={`font-medium ${config.textPrimary}`}>
              {formatNumber(metrics.top_holding_pct)}%
            </span>
          </div>
        )}

        <div>
          <span className={`${config.textMuted} mr-2`}>LATEST:</span>
          <span className={`font-medium ${config.textPrimary}`}>
            {stats.quarter}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FundHeader;
