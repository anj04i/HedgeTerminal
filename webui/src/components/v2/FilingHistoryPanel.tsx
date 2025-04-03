import React, { memo } from 'react';
import { darkTheme } from './theme';
import { FundFiling } from '@/lib/types';

interface FilingHistoryPanelProps {
  filings: FundFiling[];
  isMobile?: boolean;
}

export const FilingHistoryPanel = memo(
  ({ filings, isMobile = false }: FilingHistoryPanelProps) => {
    const sortedFilings = React.useMemo(() => {
      return [...filings].sort((a, b) => {
        const [yearA, quarterA] = a.quarter.split('-').map(Number);
        const [yearB, quarterB] = b.quarter.split('-').map(Number);

        if (yearA !== yearB) return yearB - yearA;
        return quarterB - quarterA;
      });
    }, [filings]);

    return (
      <div
        className={`${isMobile ? 'w-full' : 'w-72'} flex flex-col`}
        style={{
          borderLeft: isMobile ? 'none' : `1px solid ${darkTheme.border}`,
          backgroundColor: darkTheme.cardBackground,
        }}
      >
        <div
          className="py-3 px-4 flex justify-between items-center"
          style={{ borderBottom: `1px solid ${darkTheme.border}` }}
        >
          <h3 className="text-xs font-medium text-gray-200">Filing History</h3>
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
                    padding: '0.5rem 0.75rem',
                    fontWeight: 'normal',
                    color: darkTheme.secondaryText,
                  }}
                >
                  Quarter
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '0.5rem 0.75rem',
                    fontWeight: 'normal',
                    color: darkTheme.secondaryText,
                  }}
                >
                  Change
                </th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: 'monospace' }}>
              {sortedFilings.map((filing, index) => {
                const nextFiling = sortedFilings[index + 1];
                const change = nextFiling
                  ? ((filing.value_usd - nextFiling.value_usd) /
                      nextFiling.value_usd) *
                    100
                  : 0;

                const isPositive = change >= 0;
                const formattedQuarter = `Q${filing.quarter.split('-')[1]} ${filing.quarter.split('-')[0]}`;
                const valueInBillions = (filing.value_usd / 1000000000).toFixed(
                  1,
                );

                return (
                  <tr
                    key={filing.quarter}
                    style={{ borderBottom: `1px solid ${darkTheme.border}` }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        darkTheme.background;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <div style={{ color: darkTheme.text }}>
                        {formattedQuarter}
                      </div>
                      <div
                        style={{
                          fontSize: '0.625rem',
                          color: darkTheme.secondaryText,
                        }}
                      >
                        ${valueInBillions}B
                      </div>
                    </td>
                    <td
                      style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}
                    >
                      <div
                        style={{
                          color: isPositive
                            ? darkTheme.accent
                            : darkTheme.negative,
                        }}
                      >
                        {nextFiling
                          ? (isPositive ? '+' : '') + change.toFixed(1) + '%'
                          : '—'}
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

FilingHistoryPanel.displayName = 'FilingHistoryPanel';
