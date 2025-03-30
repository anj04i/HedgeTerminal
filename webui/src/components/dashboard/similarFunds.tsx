import React from 'react';
import { SimilarFund } from '@/lib/types';
import { config } from './config';

interface SimilarFundsProps {
  similarFunds: SimilarFund[];
  setSelectedFund: (fund: string) => void;
}

const SimilarFunds: React.FC<SimilarFundsProps> = ({
  similarFunds,
  setSelectedFund,
}) => {
  if (similarFunds.length === 0) return null;

  return (
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
  );
};

export default SimilarFunds;
