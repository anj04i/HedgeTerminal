"use client"
import { memo } from 'react';
import { darkTheme } from './theme';
import { CompleteMetrics } from '@/lib/types';

interface FundHeaderProps {
  metrics: CompleteMetrics | null;
  isMobile?: boolean;
}

const getValueColor = (value: string) => {
  if (!value) return { color: darkTheme.secondaryText };
  return value.startsWith('-')
    ? { color: darkTheme.negative }
    : { color: darkTheme.accent };
};

export const FundHeader = memo(
  ({ metrics, isMobile = false }: FundHeaderProps) => {
    if (!metrics) return null;

    return (
      <div
        className={`${isMobile ? 'flex flex-col' : 'flex items-center'} px-4 py-3 border-b`}
        style={{
          borderColor: darkTheme.border,
          backgroundColor: darkTheme.cardBackground,
        }}
      >
        <h1
          className={`text-sm font-medium ${isMobile ? 'mb-2' : 'mr-6'}`}
          style={{ color: darkTheme.accent }}
        >
          {metrics.name}
        </h1>
        <div
          className={`text-xs ${isMobile ? 'flex flex-wrap gap-x-4 gap-y-2' : 'flex gap-6'}`}
          style={{ color: darkTheme.secondaryText }}
        >
          <span>
            AUM:{' '}
            <span className="font-mono" style={{ color: darkTheme.text }}>
              ${(Number(metrics.aum) / 1e9).toFixed(2)}B
            </span>
          </span>
          <span>
            QoQ Change:{' '}
            <span
              className="font-mono"
              style={getValueColor(metrics.latest_qoq_change_pct)}
            >
              {metrics.latest_qoq_change_pct}
            </span>
          </span>
          <span>
            YoY Growth:{' '}
            <span
              className="font-mono"
              style={getValueColor(metrics.total_appreciation_pct)}
            >
              {metrics.total_appreciation_pct}
            </span>
          </span>
          <span>
            Total Growth:{' '}
            <span
              className="font-mono"
              style={getValueColor(metrics.total_appreciation_str)}
            >
              {metrics.total_appreciation_str}
            </span>
          </span>
          <span>
            CIK:{' '}
            <span className="font-mono" style={{ color: darkTheme.text }}>
              {metrics.cik}
            </span>
          </span>
        </div>
      </div>
    );
  },
);

FundHeader.displayName = 'FundHeader';
