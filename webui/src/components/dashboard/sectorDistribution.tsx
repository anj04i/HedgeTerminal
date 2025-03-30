import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ClassDistribution } from '@/lib/types';
import { config } from './config';

interface SectorDistributionProps {
  classDistribution: ClassDistribution[];
}

const SectorDistribution: React.FC<SectorDistributionProps> = ({
  classDistribution,
}) => {
  if (classDistribution.length === 0) {
    return (
      <div
        className={`${config.bgCard} rounded-lg overflow-hidden border ${config.borderBase} flex flex-col h-[496px]`}
      >
        <div className={`p-4 border-b ${config.borderBase}`}>
          <h2 className={`text-lg font-semibold ${config.textSecondary}`}>
            Sector Distribution
          </h2>
          <p className={`text-sm ${config.textMuted}`}>
            Portfolio allocation by sector
          </p>
        </div>
        <div className="p-4 flex-1 flex items-center justify-center">
          <p className={`text-sm ${config.textMuted}`}>
            No sector distribution data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${config.bgCard} rounded-lg overflow-hidden border ${config.borderBase} flex flex-col h-[496px]`}
    >
      <div className={`p-4 border-b ${config.borderBase}`}>
        <h2 className={`text-lg font-semibold ${config.textSecondary}`}>
          Sector Distribution
        </h2>
        <p className={`text-sm ${config.textMuted}`}>
          Portfolio allocation by sector
        </p>
      </div>
      <div className="p-4 flex-1 overflow-auto">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={classDistribution}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid stroke={config.gridStroke} strokeDasharray="3 3" />
            <XAxis
              type="number"
              stroke={config.axisText}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: config.gridStroke }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              dataKey="class"
              type="category"
              stroke={config.axisText}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: config.gridStroke }}
              width={150}
              tick={{ fill: config.axisLabel }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: config.tooltipBackground,
                border: `1px solid ${config.tooltipBorder}`,
                borderRadius: '4px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                color: config.tooltipText,
                fontSize: '12px',
              }}
              formatter={(value, name) => {
                if (name === 'percentage_of_total') {
                  return [`${value}%`, 'Allocation'];
                }
                if (name === 'total_value_usd') {
                  return [`$${((value as number) / 1e9).toFixed(2)}B`, 'Value'];
                }
                return [value, name];
              }}
              labelFormatter={(label) => `Sector: ${label}`}
            />
            <Bar
              dataKey="percentage_of_total"
              name="Allocation"
              fill={config.primaryColor}
              radius={[0, 3, 3, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SectorDistribution;
