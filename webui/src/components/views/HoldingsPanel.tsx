"use client"
import { memo, useMemo } from 'react';
import { darkTheme } from './theme';
import { Holding } from '@/lib/types';
import { formatPercentage } from '@/lib/utils';

interface HoldingsPanelProps {
  holdings: Holding[];
  isMobile?: boolean;
}

export const HoldingsPanel = memo(
  ({ holdings, isMobile = false }: HoldingsPanelProps) => {
    const topHoldings = useMemo(
      () => [...holdings].sort((a, b) => b.value_usd - a.value_usd),
      [holdings],
    );

    return (
      <div
        className={`${isMobile ? 'w-full' : 'w-96'} flex flex-col`}
        style={{
          borderLeft: isMobile ? 'none' : `1px solid ${darkTheme.border}`,
          backgroundColor: darkTheme.cardBackground,
        }}
      >
        <div
          className="py-3 px-4 flex justify-between items-center"
          style={{ borderBottom: `1px solid ${darkTheme.border}` }}
        >
          <h3 className="text-xs font-medium text-gray-200">Holdings</h3>
        </div>

        <div className="flex-1 overflow-auto">
          <table
            style={{
              width: '100%',
              fontSize: '0.75rem',
              borderCollapse: 'collapse',
            }}
          >
            <thead
              style={{
                position: 'sticky',
                top: 0,
                backgroundColor: darkTheme.cardBackground,
                borderBottom: `1px solid ${darkTheme.border}`,
                zIndex: 10,
              }}
            >
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '0.5rem 1rem',
                    fontWeight: 'normal',
                    color: darkTheme.secondaryText,
                  }}
                >
                  Holding
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '0.5rem 1rem',
                    fontWeight: 'normal',
                    color: darkTheme.secondaryText,
                  }}
                >
                  Value ($M)
                </th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: 'monospace' }}>
              {topHoldings.map((holding, index) => {
                const valueInMillions = holding.value_usd / 1000000;
                const changePercent = holding.percentage_of_total
                  ? formatPercentage(holding.percentage_of_total * 100, 1)
                  : '+0.0%';
                const isPositive = !changePercent.startsWith('-');

                return (
                  <tr
                    key={index}
                    style={{ borderBottom: `1px solid ${darkTheme.border}` }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        darkTheme.background;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '0.5rem 1rem' }}>
                      <div
                        style={{
                          fontFamily: 'sans-serif',
                          fontSize: '0.75rem',
                          color: darkTheme.text,
                        }}
                      >
                        {holding.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.625rem',
                          color: darkTheme.secondaryText,
                          fontFamily: 'sans-serif',
                        }}
                      >
                        {holding.class}
                      </div>
                    </td>
                    <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>
                      <div style={{ color: darkTheme.text }}>
                        {valueInMillions.toFixed(2)}
                      </div>
                      <div
                        style={{
                          fontSize: '0.625rem',
                          color: isPositive
                            ? darkTheme.accent
                            : darkTheme.negative,
                        }}
                      >
                        {changePercent}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);

HoldingsPanel.displayName = 'HoldingsPanel';
