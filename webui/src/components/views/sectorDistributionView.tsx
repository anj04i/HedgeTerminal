import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface SectorDistributionViewProps {
  classDistribution: any[];
  selectedFund: string;
}

export default function SectorDistributionView({
  classDistribution,
  selectedFund,
}: SectorDistributionViewProps) {
  // Calculate dynamic height based on number of categories
  // Allocate ~40px per category with a minimum of 400px and maximum of 800px
  const dynamicHeight = Math.max(
    400,
    Math.min(800, classDistribution.length * 40),
  );

  return (
    <div className="mb-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Sector Distribution</h2>
        <p className="text-zinc-500 text-sm">
          Class distribution for {selectedFund}
        </p>
      </div>
      <div
        className="bg-black border border-zinc-900 rounded-lg p-6"
        style={{ height: `${dynamicHeight}px` }}
      >
        {classDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={classDistribution}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
            >
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
              <XAxis
                type="number"
                stroke="#52525b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                dataKey="class"
                type="category"
                stroke="#52525b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
                width={150}
                tick={{ fill: '#a1a1aa' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '4px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value) => [`${value}%`, 'Percentage']}
                cursor={{ fill: '#3f3f46', opacity: 0.3 }}
              />
              <Bar
                dataKey="percentage_of_total"
                fill="#22c55e"
                radius={[0, 3, 3, 0]}
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-500 text-sm">
              No class distribution data available for {selectedFund}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
