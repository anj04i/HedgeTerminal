import React from 'react';
import { CompleteMetrics } from '@/lib/types';
import { config } from './config';

interface AdvancedMetricsProps {
  metrics: CompleteMetrics;
}

const AdvancedMetrics: React.FC<AdvancedMetricsProps> = ({ metrics }) => {
  if (!metrics) return null;

  // Helper function to safely parse string to number and format
  const formatNumber = (
    value: string | number | undefined,
    decimals: number = 1,
  ): string => {
    if (value === undefined || value === null) return '0';
    return parseFloat(String(value)).toFixed(decimals);
  };

  // Helper for diversification classification
  const getDiversificationLabel = (score: string | number): string => {
    const numScore = parseFloat(String(score));
    if (numScore > 30) return 'Well diversified';
    if (numScore > 15) return 'Moderately diversified';
    return 'Concentrated';
  };

  // Helper to determine if drawdown is severe
  const isDrawdownSevere = (drawdown: string | number): boolean => {
    return parseFloat(String(drawdown)) > 20;
  };

  // Helper to format with positive/negative sign
  const formatWithSign = (value: string | number): string => {
    const numValue = parseFloat(String(value));
    return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(1)}%`;
  };

  return (
    <div
      className={`${config.bgCard} rounded-lg overflow-hidden border ${config.borderBase}`}
    >
      <div className={`p-4 border-b ${config.borderBase}`}>
        <h3 className={`text-lg font-semibold ${config.textSecondary}`}>
          Portfolio Metrics
        </h3>
        <p className={`text-sm ${config.textMuted}`}>
          Performance and structure indicators
        </p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Portfolio Structure */}
          <div
            className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
          >
            <div className={`text-sm mb-1 ${config.textMuted}`}>
              Top Holding
            </div>
            <div className={`text-2xl font-bold ${config.textPrimary}`}>
              {formatNumber(metrics.top_holding_pct)}%
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
              {formatNumber(metrics.top_10_holdings_pct)}%
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
              {formatNumber(metrics.diversification_score)}
            </div>
            <div className={`text-xs mt-1 ${config.textMuted}`}>
              {getDiversificationLabel(metrics.diversification_score)}
            </div>
          </div>

          {/* Performance Metrics */}
          <div
            className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
          >
            <div className={`text-sm mb-1 ${config.textMuted}`}>
              Total Growth
            </div>
            <div
              className={`text-2xl font-bold ${
                parseFloat(String(metrics.total_appreciation_pct)) >= 0
                  ? config.textHighlightPositive
                  : config.textHighlightNegative
              }`}
            >
              {formatWithSign(metrics.total_appreciation_pct)}
            </div>
            <div className={`text-xs mt-1 ${config.textMuted}`}>
              Since first filing
            </div>
          </div>

          <div
            className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
          >
            <div className={`text-sm mb-1 ${config.textMuted}`}>Volatility</div>
            <div className={`text-2xl font-bold ${config.textPrimary}`}>
              {formatNumber(metrics.aum_volatility_pct)}%
            </div>
            <div className={`text-xs mt-1 ${config.textMuted}`}>
              Quarterly variability
            </div>
          </div>

          <div
            className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
          >
            <div className={`text-sm mb-1 ${config.textMuted}`}>
              Growth Consistency
            </div>
            <div className={`text-2xl font-bold ${config.textPrimary}`}>
              {formatNumber(metrics.growth_consistency)}%
            </div>
            <div className={`text-xs mt-1 ${config.textMuted}`}>
              Positive quarter ratio
            </div>
          </div>

          {/* Special Indicators */}
          <div
            className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
          >
            <div className={`text-sm mb-1 ${config.textMuted}`}>
              Uniqueness Score
            </div>
            <div className={`text-2xl font-bold ${config.textPrimary}`}>
              {formatNumber(metrics.uniqueness_score)}%
            </div>
            <div className={`text-xs mt-1 ${config.textMuted}`}>
              Unique holdings percentage
            </div>
          </div>

          <div
            className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
          >
            <div className={`text-sm mb-1 ${config.textMuted}`}>Drawdown</div>
            <div
              className={`text-2xl font-bold ${
                isDrawdownSevere(metrics.drawdown_from_peak_pct)
                  ? config.textHighlightNegative
                  : config.textPrimary
              }`}
            >
              {formatNumber(metrics.drawdown_from_peak_pct)}%
            </div>
            <div className={`text-xs mt-1 ${config.textMuted}`}>
              From peak AUM
            </div>
          </div>

          <div
            className={`${config.bgBase} rounded-lg p-4 border ${config.borderBase}`}
          >
            <div className={`text-sm mb-1 ${config.textMuted}`}>Filing Lag</div>
            <div className={`text-2xl font-bold ${config.textPrimary}`}>
              {formatNumber(metrics.avg_filing_lag_days, 0)} days
            </div>
            <div className={`text-xs mt-1 ${config.textMuted}`}>
              Avg delay in reporting
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AdvancedMetrics);
