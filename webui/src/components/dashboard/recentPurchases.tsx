import React from 'react';
import { Holding } from '@/lib/types';
import { config } from './config';

interface RecentPurchasesProps {
  purchases: Holding[];
}

const RecentPurchases: React.FC<RecentPurchasesProps> = ({ purchases }) => {
  return (
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
        {purchases.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className={`text-sm ${config.textMuted}`}>
              No recent purchases found
            </p>
          </div>
        ) : (
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
                  Value ($B)
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
                    ${(purchase.value_usd / 1e9).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecentPurchases;
