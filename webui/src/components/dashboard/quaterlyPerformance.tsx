import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { VolatilityData } from '@/lib/types';
import { config } from './config';

interface QuarterlyPerformanceProps {
  quarterlyChanges: VolatilityData[];
}

const QuarterlyPerformance: React.FC<QuarterlyPerformanceProps> = ({
  quarterlyChanges,
}) => {
  if (quarterlyChanges.length === 0) return null;

  return (
    <div
      className={`${config.bgCard} rounded-lg overflow-hidden border ${config.borderBase}`}
    >
      <div
        className={`p-4 border-b ${config.borderBase} flex justify-between items-center`}
      >
        <div>
          <h2 className={`text-lg font-semibold ${config.textSecondary}`}>
            Quarterly Performance
          </h2>
          <p className={`${config.textMuted} text-sm`}>
            Quarter-over-quarter percentage changes
          </p>
        </div>
      </div>
      <div className="p-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={quarterlyChanges}>
            <defs>
              <linearGradient id="colorChanges" x1="0" y1="0" x2="0" y2="1">
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
              tickFormatter={(value) => `${value}%`}
              stroke={config.axisText}
            />
            <CartesianGrid strokeDasharray="3 3" stroke={config.gridStroke} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(2)}%`, 'Change']}
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
              fill="url(#colorChanges)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(QuarterlyPerformance);
